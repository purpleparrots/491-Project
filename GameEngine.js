window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

function GameEngine() {
	this.isPaused = false;
}

GameEngine.prototype.init = function (game_ctx, background_ctx, overlay_ctx) {
    this.splitEntities = [];
    this.waveEntities = [];
	this.entities = [];
    this.game_ctx = game_ctx;
    this.background_ctx = background_ctx;
    this.overlay_ctx = overlay_ctx;
    this.surfaceWidth = this.game_ctx.canvas.width / 2;
    this.surfaceHeight = this.game_ctx.canvas.height / 2;
    this.startInput();
    this.timer = new Timer();
    this.wave = 1;
    this.waveTick = 0;
    this.score = 0;
    this.active = true;
    this.count = 0;
    this.typeMap = {};
    this.fireLock = false;
    this.spawnPU = false;
	this.gameOver = false;
	this.overlay_ctx.canvas.focus();
	this.addEntity(new PlayerShip(this, 0, {x:0,y:0}, 
		AM.getAsset("./images/playership.png"), 0,0, "default"));
		
    for(var i = 0; i < 100; i++) {
            if(i < 20) this.typeMap[i] = "fillShieldPowerUp";
            if(i >= 20 && i < 30) this.typeMap[i] = "extraLifePowerUp";
            if(i >= 30 && i < 50) this.typeMap[i] = "doubleGunPowerUp";
            if(i >= 50 && i < 60) this.typeMap[i] = "tripleGunPowerUp";
            if(i >= 60 && i < 78) this.typeMap[i] = "backGunPowerUp";
            if(i >= 78 && i < 100) this.typeMap[i] = "bombPowerUp";
    }
}

GameEngine.prototype.start = function () {
	 
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.game_ctx.canvas);
    })();
    this.changeScore();
    this.generateWave();
}

GameEngine.prototype.drawLives = function(lives) {
    this.overlay_ctx.clearRect(this.overlay_ctx.canvas.width - (lives + 1) * 35, 0, this.overlay_ctx.canvas.width, 40);
    for (var i = 0; i <= lives; i++) {
        this.overlay_ctx.drawImage(AM.getAsset("./images/playership.png"), this.overlay_ctx.canvas.width - i * 35, 5, 30, 30);
    }
}

GameEngine.prototype.die = function() {
	this.gameOver = true;
	this.gameOverTxt = new FloatingText(this.overlay_ctx,"Game Over");
	this.changeScore();
}

GameEngine.prototype.pause = function() {
	this.isPaused = true;
}

GameEngine.prototype.unpause = function() {
	this.isPaused = false;
}

GameEngine.prototype.moveSlider = function(amount) {
    var sliderWidth = this.overlay_ctx.canvas.width / 2;
    var shieldAmount = Math.floor(sliderWidth * (amount / 100));
    //var sliderStart = this.overlay_ctx.canvas.width / 2 + (sliderWidth / 2);
    this.overlay_ctx.clearRect(this.overlay_ctx.canvas.width / 2 - sliderWidth / 2, this.overlay_ctx.canvas.height - 60, sliderWidth, 80);
    //context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
    this.overlay_ctx.drawImage(AM.getAsset("./images/shieldbar.jpg"), 0,  0, shieldAmount, 30,
                                            this.overlay_ctx.canvas.width / 2 - sliderWidth / 2, this.overlay_ctx.canvas.height - 45,
                                            shieldAmount, 30);
  //  var sliderLocationX = (amount) * 3;
  //  this.overlay_ctx.drawImage(AM.getAsset("./images/slider.png"), sliderStart + sliderLocationX, this.overlay_ctx.canvas.height - 70, 10, 50);
}

GameEngine.prototype.changeScore = function() {
    this.overlay_ctx.font="25px Impact";
    this.overlay_ctx.fillStyle = "white";
    var scoreText = "Score: " + this.score + "";
    var scoreTextMeasure = this.overlay_ctx.measureText(scoreText);

	if (!this.gameOver) {
    	this.overlay_ctx.clearRect(this.overlay_ctx.canvas.width - (300), this.overlay_ctx.canvas.height - 40, 400, 70);
    	this.overlay_ctx.fillText(scoreText, this.overlay_ctx.canvas.width - (175), this.overlay_ctx.canvas.height - 20);
	} else {
		this.overlay_ctx.font="35px Impact";
		this.overlay_ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
		scoreTextMeasure = this.overlay_ctx.measureText(scoreText);
    	this.overlay_ctx.clearRect(this.overlay_ctx.canvas.width - (300), this.overlay_ctx.canvas.height - 40, 400, 70);
    	this.overlay_ctx.fillText(scoreText, this.overlay_ctx.canvas.width / 2 - scoreTextMeasure.width / 2, this.overlay_ctx.canvas.height - 150);
	}
}


GameEngine.prototype.startInput = function () {
    var that = this;

    that.overlay_ctx.canvas.addEventListener("keydown", function (e) {
        if (String.fromCharCode(e.which) === ' ') that.spacebar = true;
        if (e.keyCode === 17) that.ctrlkey = true;
        if (e.keyCode === 37) that.leftkey = true;
        if (e.keyCode === 38) that.upkey = true;
        if (e.keyCode === 39) that.rightkey = true;
        if (e.keyCode === 40) that.downkey = true;
        e.preventDefault();
    }, false);
    
    that.overlay_ctx.canvas.addEventListener("keyup", function (e) {
        if (String.fromCharCode(e.which) === ' ') that.spacebar = false;
        if (e.keyCode === 17) that.ctrlkey = false;
        if (e.keyCode === 37) that.leftkey = false;
        if (e.keyCode === 38) that.upkey = false;
        if (e.keyCode === 39) that.rightkey = false;
        if (e.keyCode === 40) that.downkey = false;
        e.preventDefault();
    }, false);

}

GameEngine.prototype.addEntity = function (entity) {
    this.entities.push(entity);
}

GameEngine.prototype.addTempEntity = function(entity) {
    this.splitEntities.push(entity);
}

GameEngine.prototype.draw = function () {
    this.game_ctx.clearRect(0, 0, this.surfaceWidth * 2, this.surfaceHeight * 2);
    this.game_ctx.save();
    for (var i = 0; i < this.entities.length; i++) {
        if (this.entities[i].removeMe) {
            if(this.score % 250 > 25 && (((this.score + this.entities[i].value) % 250) < 25)) {
                this.spawnPU = true;
            }
            if (this.entities[i].value > 0) {
                this.score += this.entities[i].value;
                this.changeScore();
            }
            
            this.entities.splice(i,1);
        } else {
            this.entities[i].draw(this.ctx);
        }
    }
    this.game_ctx.restore();
}

GameEngine.prototype.update = function () {
	if (!this.gameOver) {
	    this.splitEntities = [];
	    var entitiesCount = this.entities.length;
	    this.count += 1;
	    for (var i = 0; i < entitiesCount; i++) {
        
	        var entity = this.entities[i];

	        for (var j = i + 1; j < entitiesCount; j++) {
            
	            //if(otherEntity != undefined) {
	                var otherEntity = this.entities[j];

	                if (this.checkCollision(entity, otherEntity)) {
	                    entity.collide(otherEntity, true);
	                } 
                
	            //}            
                         
	        }
    
	    if (!entity.removeMe)  entity.update();
	    }
	    var newEntitiesCount = this.splitEntities.length;
	    for(var k = 0; k < newEntitiesCount; k++) {
	        this.addEntity(this.splitEntities[k]);
	    }
	} else {
		this.gameOverTxt.update();
		this.gameOverTxt.draw();
	}
}

GameEngine.prototype.checkCollision = function(entity1, entity2) {
    return this.absoluteDistance(entity1, entity2) <= (entity1.radius + entity2.radius);
}

GameEngine.prototype.absoluteDistance = function(entity1, entity2) {
    return Math.sqrt(Math.pow((entity1.x - entity2.x), 2) + Math.pow((entity1.y - entity2.y), 2));
}

GameEngine.prototype.loop = function () {
	if (!this.isPaused) {
	    this.clockTick = this.timer.tick();
	    // reenable waveTick incrememnt went moving past prototype
	    this.waveTick += 1;

	    // 500x + 8000
	    // first wave gets 26 waves points. if each of these is an asteroid that means
	    // 26 asteroids are created. average of 5 seconds to kill each one means 130
	    // seconds to kill all, this equals 7800 ticks, round to 8000 and add 500 ticks
	    // to each wave. wave points increase by 15 each time or about 3x the increased time
	    // so the game gets harder in several ways each wave.
	    if (this.waveTick > (75 * this.wave) + 500) {
	        this.waveTick = 0;
	        document.title = this.wave;
	        this.generateWave();
	    }

	    if (this.waveTick % 18 === 0) {
	        if(this.waveEntities.length > 0) {
	            this.addEntity(this.waveEntities.pop());
	        }
	    }

	    if (this.waveTick % 16 === 0) {
	        this.fireLock = false;
	    }

	    if(this.spawnPU) {
	        var vel = {x: this.getRandomInt(-2,2),
	                   y: this.getRandomInt(-2,2)};
	        var x = this.randOffScreenPoint(0);
	        var y = this.randOffScreenPoint(1);
	        this.addEntity(new PowerUp(this, 0, vel, x, y,
	            this.typeMap[this.getRandomInt(0,100)]));
	        this.spawnPU = false;
	    }

	    if (this.waveTick % 250 === 0) {
	        var data = this.newObjectData();
	        this.addEntity(new AlienShip(this, data[0], data[2], data[3], "alien"));
	    }

	    this.update();
	    this.draw();
	}
}

GameEngine.prototype.generateWave = function() {
   // this.entities = [];
    //points worth of enemies generated this wave.
    this.wave += 1;
    var waveValue = (this.wave * 11) + 10;

    while (waveValue > 0) {
        var data = this.newObjectData();
        this.waveEntities.push(new Asteroid(this, data[1], data[0], data[2], data[3], data[4]));
        waveValue -= data[4];
    }
}

GameEngine.prototype.newObjectData = function() {
    var velX = this.getRandomInt(-4,4);
    var velY = this.getRandomInt(-4,4);
    while (velX === 0 && velY === 0) {
        velX = this.getRandomInt(-4,4);
        vely = this.getRandomInt(-4,4);
    }
    var velocity = {x: velX, y: velY};
    var angle = this.getRandomInt(0,2) * Math.PI;
    var x = this.randOffScreenPoint(0);
    var y = this.randOffScreenPoint(1);
    var size = this.getRandomInt(1,4);

    return [velocity, angle, x, y, size];
}

GameEngine.prototype.getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

GameEngine.prototype.randOffScreenPoint = function(dim) {
    var side = Math.round(Math.random());
    if (dim === 0) {
        if (side === 0) {
            return 0 - this.getRandomInt(this.surfaceWidth + 25, this.surfaceWidth + 50);
        } else {
            return this.getRandomInt(this.surfaceWidth + 25, this.surfaceWidth + 50);
        }
    } else {
        if (side === 0) {
            return 0 - this.getRandomInt(this.surfaceHeight + 25, this.surfaceHeight + 50);
        } else {
            return this.getRandomInt(this.surfaceHeight + 25, this.surfaceHeight + 50);
        }
    }
}

GameEngine.prototype.getX = function(width, x) {
    return this.surfaceWidth + x - (width / 2);
    
}

GameEngine.prototype.getY = function(height, y) {
    return this.surfaceHeight - y - (height / 2);
}

GameEngine.prototype.end = function() {
    this.changeState();
}

GameEngine.prototype.increment = function(target, amount) {
    this.target += amount;
}

GameEngine.prototype.changeState = function() {
    if(active) {
        this.wave = 0;
        this.score = 0;
    }
    active = !active;
}

GameEngine.prototype.makeProtoEnemies = function() {
    this.addEntity(new Asteroid(this, (Math.random() * 2 * Math.PI), {x: -2, y: -1}, 100, -50, 3));
    this.addEntity(new Asteroid(this, (Math.random() * 2 * Math.PI), {x: 2, y: 1}, -100, 50, 2));
    this.addEntity(new PowerUp(this, 2 * Math.PI,{x:0, y:0}, 100, 0, "bombPowerUp"));
    this.addEntity(new PowerUp(this, 2 * Math.PI,{x:0, y:0}, 150, 0, "bombPowerUp"));
    this.addEntity(new AlienShip(this, (Math.round() * 2 * Math.PI), {x:0, y:0}, -75, 0, null, 100, "default"));
   // generateWave();
}
    
GameEngine.prototype.resultVector = function(orig_vec, force_vec) {
    var ret = {};
    ret.x = orig_vec.x + force_vec.x;
    ret.y = orig_vec.y - force_vec.y;
    return ret; 
}

GameEngine.prototype.resolveVec = function(angle, mag) {
    var ret = {};
    ret.x = mag * Math.cos(angle);
    ret.y = mag * Math.sin(angle);
    return ret;
}

GameEngine.prototype.resolveCollision = function(entity1V, entity1M, entity2V, entity2M) {
	  var v3 = {};
	  v3.x = (entity1V.x * (entity1M - entity2M) + 2 * entity2M * entity2V.x) / (entity1M + entity2M);
	  v3.y = (entity1V.y * (entity1M - entity2M) + 2 * entity2M * entity2V.y) / (entity1M + entity2M);
	  var v4 = {};
	  v4.x = (entity2V.x * (entity2M - entity1M) + 2 * entity1M * entity1V.x) / (entity1M + entity2M);
	  v4.y = (entity2V.y * (entity2M - entity1M) + 2 * entity1M * entity1V.y) / (entity1M + entity2M);
	  return [v3, v4];
};

GameEngine.prototype.velocityMag = function(vel) {
    return Math.sqrt(vel.x * vel.x + vel.y * vel.y);
}

GameEngine.prototype.toRadians = function(degrees) {
    return degrees * (Math.PI / 180);
}


function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function () {
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
}
