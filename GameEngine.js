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
    this.newEntities = [];
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
	// temp function to show basic animations for prototype. remove for final
	this.makeProtoEnemies();

}

GameEngine.prototype.start = function () {
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.game_ctx.canvas);
    })();
}

GameEngine.prototype.startInput = function () {
    var that = this;

    that.overlay_ctx.canvas.addEventListener("keydown", function (e) {
        if (String.fromCharCode(e.which) === ' ') that.spacebar = true;
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
    this.newEntities.push(entity);
}

GameEngine.prototype.draw = function () {
    this.game_ctx.clearRect(0, 0, this.surfaceWidth * 2, this.surfaceHeight * 2);
    this.game_ctx.save();
    for (var i = 0; i < this.entities.length; i++) {
    	if (this.entities[i].removeMe) {
    		this.increment("score", this.entities[i].value);
    		this.entities.splice(i,1);
    	} else {
        	this.entities[i].draw(this.ctx);
        }
    }
    this.game_ctx.restore();
}

GameEngine.prototype.update = function () {
    this.newEntities = [];
    var entitiesCount = this.entities.length;
    this.count += 1;
    for (var i = 0; i < entitiesCount; i++) {
        
        var entity = this.entities[i];
<<<<<<< HEAD
        
        for (var j = i + 1; j < entitiesCount - 1; j++) {
            
            //if(otherEntity != undefined) {
                var otherEntity = this.entities[j];

                if (this.checkCollision(entity, otherEntity)) {
                    entity.collide(otherEntity, true);
                } 
                
            //}            
                         
        }
    
    if (!entity.removeMe)  entity.update();
    }
    var newEntitiesCount = this.newEntities.length;
    for(var k = 0; k < newEntitiesCount; k++) {
        this.addEntity(this.newEntities[k]);
    }
}

GameEngine.prototype.checkCollision = function(entity1, entity2) {
    return this.absoluteDistance(entity1, entity2) <= entity1.radius + entity2.radius;
=======
        entity.update();
    }
>>>>>>> 80aad121141b0fc4c825531cc9b02d7c4f73bf64
}

GameEngine.prototype.loop = function () {
    this.clockTick = this.timer.tick();
    // reenable waveTick incrememnt went moving past prototype
    //this.waveTick += 1;

    // 500x + 8000
    // first wave gets 26 waves points. if each of these is an asteroid that means
    // 26 asteroids are created. average of 5 seconds to kill each one means 130
    // seconds to kill all, this equals 7800 ticks, round to 8000 and add 500 ticks
    // to each wave. wave points increase by 15 each time or about 3x the increased time
    // so the game gets harder in several ways each wave.
    if (this.waveTick > (500 * this.wave) + 8000) {
    	this.waveTick = 0;
    	this.increment("wave",1);
    	this.generateWave();
    }

    this.update();
    this.draw();
    this.spacebar = null;
    this.leftkey = null;
    this.upkey = null;
    this.downkey = null;
    this.rightkey = null;
}

GameEngine.prototype.getX = function(width, x) {
	return this.surfaceWidth + x + (width / 2);
	
}

GameEngine.prototype.getY = function(height, y) {
	return this.surfaceHeight + y + (height / 2);
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
		type = this.getRandomInt(1,100);
        velocity = {x: this.getRandomInt(-4,4), y: this.getRandomInt(-4,4)};
        size = this.getRandomInt(1,3);
        angle = Math.random() * Math.PI;
        x = this.randOffScreenPoint();
        y = this.randOffScreenPoint();
/*
		if (type - alienChance > 0) {
			
			value = this.getRandomInt(2,4) * 10;
			this.addEntity(new AlienShip(this, angle, velocity, null, x, y, null, value));
			waveValue -= value;

		} else {
            */
			this.addEntity(new Asteroid(this, angle, velocity, x, y, size));
			waveValue -= size;
		//}
        /*
		if (type - powerupChance > 0) {
            velocity = {x: velx, y: vely};
			this.addEntity(new PowerUp(this, angle, velocity, null, x, y, null));
		}
        */
        

  //      this.addEntity(new Asteroid(this, Math.random() * 2 * Math.PI, velocity, this.randOffScreenPoint(), this.randOffScreenPoint(), size));
        waveValue -= size;
	}
}



GameEngine.prototype.randOffScreenPoint = function() {
	side = Math.round(Math.random());
	if (side === 0) {
		return 0 - this.getRandomInt(this.surfaceWidth + 25, this.surfaceWidth + 50);
	} else {
		return this.getRandomInt(this.surfaceHeight + 25, this.surfaceHeight + 50);
	}
}

GameEngine.prototype.makeProtoEnemies = function() {
	this.addEntity(new Asteroid(this, (Math.random() * 2 * Math.PI), {x: -2, y: -1}, -100, 50, 3));
    this.addEntity(new Asteroid(this, (Math.random() * 2 * Math.PI), {x: 2, y: 1}, 100, 50, 3));
	this.addEntity(new Asteroid(this, (Math.random() * 2 * Math.PI), {x: this.getRandomInt(1,4), y: this.getRandomInt(1,4)}, -200, 200, 2));
	this.addEntity(new Asteroid(this, (Math.random() * 2 * Math.PI), {x: this.getRandomInt(1,4), y: this.getRandomInt(1,4)}, -100,-150, 3));
	this.addEntity(new Asteroid(this, (Math.random() * 2 * Math.PI), {x: this.getRandomInt(1,4), y: this.getRandomInt(1,4)},  200, 300, 1));
    this.addEntity(new AlienShip(this, (Math.round() * 2 * Math.PI), {x:0, y:-1}, AM.getAsset("./images/alienship.png"), 75, 75, null, 100));
    this.addEntity(new Weapon(this, 0, {x:0,y:-1},AM.getAsset("./images/weapon3.png"), 0, 0));
    this.generateWave();

}

GameEngine.prototype.getRandomInt = function(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}
	
GameEngine.prototype.resultVector = function(orig_vec, force_vec) {
	var ret = {};
	ret.x = orig_vec.x + force_vec.x;
	ret.y = orig_vec.y + force_vec.y;
	return ret;	
}

GameEngine.prototype.resolveVec = function(angle, mag) {
	var ret = {};
	ret.x = mag * Math.cos(angle);
	ret.y = mag * Math.sin(angle);
	return ret;
}

GameEngine.prototype.velocityMag = function(vel) {
    return Math.sqrt(vel.x * vel.x + vel.y * vel.y);
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
