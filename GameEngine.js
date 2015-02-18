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
    this.entities = [];
    this.splitEntities = [];
    this.game_ctx = null;
    this.background_ctx = null;
    this.overlay_ctx = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
    this.wave = 0;
    this.waveTick = 0;
    this.score = 0;
    this.active = true;
    this.count = 0;
    this.ship = null;
    this.typeMap = {};
    this.liveLocationX = 35;        
    this.sliderLocationX = null; 
}

GameEngine.prototype.init = function (game_ctx, background_ctx, overlay_ctx) {
    this.game_ctx = game_ctx;
    this.background_ctx = background_ctx;
    this.overlay_ctx = overlay_ctx;
    this.surfaceWidth = this.game_ctx.canvas.width / 2;
    this.surfaceHeight = this.game_ctx.canvas.height / 2;
    this.startInput();
    this.timer = new Timer();
    this.wave = 1;
    
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
    //create 3 lives
    this.createLife();
    this.createLife();
    this.createLife();
    
    //create shield bar and slider
    this.resetSlider();
    
    //create and display score
    this.overlay_ctx.font="15px Georgia";
    this.overlay_ctx.fillStyle = "white";
    this.overlay_ctx.fillText("Score: ", 480, 360);
    this.overlay_ctx.fillText("" + this.score + "", 525, 360);
    
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.game_ctx.canvas);
    })();

    this.generateWave();
}

GameEngine.prototype.createLife = function() {
    this.overlay_ctx.drawImage(AM.getAsset("./images/playership.png"), this.overlay_ctx.canvas.width - this.liveLocationX, 5, 30, 30);
    this.liveLocationX += 35;
}

GameEngine.prototype.removeLife = function() {
    this.liveLocationX -= 35;
    this.overlay_ctx.clearRect(this.overlay_ctx.canvas.width - this.liveLocationX, 5, 30, 30);
}

GameEngine.prototype.resetSlider = function() {
    this.overlay_ctx.clearRect(this.sliderLocationX - 10, this.overlay_ctx.canvas.height - 80, 20, 70);
    this.sliderLocationX = 450;
    this.overlay_ctx.drawImage(AM.getAsset("./images/shieldbar.jpg"), this.surfaceWidth/2, this.overlay_ctx.canvas.height - 60, this.surfaceWidth, 30);
    this.overlay_ctx.drawImage(AM.getAsset("./images/slider.png"), this.sliderLocationX, this.overlay_ctx.canvas.height - 70, 10, 50);
}

GameEngine.prototype.moveSlider = function(amount) {
    this.overlay_ctx.clearRect(this.sliderLocationX - 10, this.overlay_ctx.canvas.height - 80, 20, 70);
    this.overlay_ctx.drawImage(AM.getAsset("./images/shieldbar.jpg"), this.surfaceWidth/2, this.overlay_ctx.canvas.height - 60, this.surfaceWidth, 30);
    this.sliderLocationX = this.sliderLocationX - (amount * 3);
    this.overlay_ctx.drawImage(AM.getAsset("./images/slider.png"), this.sliderLocationX, this.overlay_ctx.canvas.height - 70, 10, 50);
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
            this.score += this.entities[i].value;
            this.overlay_ctx.clearRect(520, 345, 200, 100);         
            this.overlay_ctx.fillText("" + this.score + "", 525, 360);
            this.entities.splice(i,1);
        } else {
            this.entities[i].draw(this.ctx);
        }
    }
    this.game_ctx.restore();
}

GameEngine.prototype.update = function () {
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
}

GameEngine.prototype.checkCollision = function(entity1, entity2) {
    return this.absoluteDistance(entity1, entity2) <= (entity1.radius + entity2.radius);
}

GameEngine.prototype.absoluteDistance = function(entity1, entity2) {
    return Math.sqrt(Math.pow((entity1.x - entity2.x), 2) + Math.pow((entity1.y - entity2.y), 2));
}

GameEngine.prototype.loop = function () {
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
        this.wave += 1;
        document.title = this.wave;
        this.generateWave();
    }


    this.update();
    this.draw();
    this.spacebar = null;
    this.ctrlkey = null;
    this.leftkey = null;
    this.upkey = null;
    this.downkey = null;
    this.rightkey = null;
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

GameEngine.prototype.generateWave = function() {
        
    //points worth of enemies generated this wave.
    waveValue = (this.wave * 15) + 11;
    //chance an alien can spawn. this is < 0 until wave 3.
    alienChance = (this.wave * 1.5) - 3;
    //chance a powerup can spawn. this is < 0 until wave 2.
    powerupChance = (this.wave * 2) - 2;
    while (waveValue > 0) {
        var type = this.getRandomInt(1,100);
        var velocity = {x: this.getRandomInt(-4,4), y: this.getRandomInt(-4,4)};
        var size = this.getRandomInt(1,3);
        var angle = Math.random() * Math.PI;
        var x = this.randOffScreenPoint(0);
        var y = this.randOffScreenPoint(1);
        console.log(x + " " + y);

        if (type + alienChance > 95) {
            
            value = this.getRandomInt(2,4) * 10;

            this.addEntity(new AlienShip(this, (Math.round() * 2 * Math.PI), velocity, AM.getAsset("./images/alienship.png"), x, y, null, 100, "default"));
            waveValue -= value;

        } else {
            
            this.addEntity(new Asteroid(this, angle, velocity, x, y, size));
            waveValue -= size;
        }
        
        if (type + powerupChance > 95) {
            var i = this.getRandomInt(0,100);
            this.addEntity(new PowerUp(this, 2 * Math.PI,velocity, 100, 0, this.typeMap[i]));
        }
        
    }
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

GameEngine.prototype.makeProtoEnemies = function() {
    this.addEntity(new Asteroid(this, (Math.random() * 2 * Math.PI), {x: -2, y: -1}, 100, -50, 3));
    this.addEntity(new Asteroid(this, (Math.random() * 2 * Math.PI), {x: 2, y: 1}, -100, 50, 2));
    //this.addEntity(new Asteroid(this, (Math.random() * 2 * Math.PI), {x: this.getRandomInt(1,4), y: this.getRandomInt(1,4)}, -200, 200, 2));
    //this.addEntity(new Asteroid(this, (Math.random() * 2 * Math.PI), {x: this.getRandomInt(1,4), y: this.getRandomInt(1,4)}, -100,-150, 3));
    //this.addEntity(new Asteroid(this, (Math.random() * 2 * Math.PI), {x: this.getRandomInt(1,4), y: this.getRandomInt(1,4)},  200, 300, 1));

    //this.addEntity(new Asteroid(this, 0, {x: 0, y: 0}, 100, 25, 2));  
    //this.addEntity(new Asteroid(this, 0, {x: 0, y: 0}, -100, 25, 3));
    this.addEntity(new PowerUp(this, 2 * Math.PI,{x:0, y:0}, 100, 0, "bombPowerUp"));
    this.addEntity(new PowerUp(this, 2 * Math.PI,{x:0, y:0}, 150, 0, "bombPowerUp"));
    this.addEntity(new AlienShip(this, (Math.round() * 2 * Math.PI), {x:0, y:0}, AM.getAsset("./images/alienship.png"), -75, 0, null, 100, "default"));
   // generateWave();
}

GameEngine.prototype.getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
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
	  //console.log(v3);
	  //console.log(v4);
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
