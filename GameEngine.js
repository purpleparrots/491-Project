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
}

GameEngine.prototype.init = function (game_ctx, background_ctx, overlay_ctx) {
    this.game_ctx = game_ctx;
	this.background_ctx = background_ctx;
	this.overlay_ctx = overlay_ctx;
    this.surfaceWidth = this.game_ctx.canvas.width;
    this.surfaceHeight = this.game_ctx.canvas.height;
    this.timer = new Timer();
	this.wave = 1;
	// temp function to show basic animations for prototype. remove for final
	this.makeProtoEnemies();

    console.log('game initialized');
}

GameEngine.prototype.start = function () {
    console.log("starting game");
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.game_ctx.canvas);
    })();
}

GameEngine.prototype.addEntity = function (entity) {
    console.log('added entity');
    this.entities.push(entity);
}

GameEngine.prototype.draw = function () {
    this.game_ctx.clearRect(0, 0, this.surfaceWidth, this.surfaceHeight);
    this.game_ctx.save();
    for (var i = 0; i < this.entities.length; i++) {
    	if (this.entities[i].removeMe) {
    		this.increment("score", this.entities[i].value);
    		entities.splice(i,1);
    	} else {
        	this.entities[i].draw(this.ctx);
        }
    }
    this.game_ctx.restore();
}

GameEngine.prototype.update = function () {
    var entitiesCount = this.entities.length;

    for (var i = 0; i < entitiesCount; i++) {
        var entity = this.entities[i];
        entity.update();
    }
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
}

GameEngine.prototype.getX = function(animation, x) {
	var width = 0;
	if (typeof animation === "image") {
		width = animation.width ;
	} else {
		width = animation.frameWidth;
	}
	return (this.surfaceWidth / 2) + x //- (width / 2);
	
}

GameEngine.prototype.getY = function(animation, y) {
	var height = 0;
	if (typeof animation === "image") {
		width = animation.height ;
	} else {
		width = animation.frameHeight;
	}
	return (this.surfaceHeight / 2) + y //- (animation.height / 2);
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
		angle = Math.random() * 2 * Math.PI;
		velx = this.getRandomInt(1,4);
		vely = this.getRandomInt(1,4);
		x = randOffScreenPoint();
		y = randOffScreenPoint();

		if (type - alienChance > 0) {
			velocity = {x: velx + 1, y: vely + 1};
			value = this.getRandomInt(2,4) * 10;
			this.addEntity(new AlienShip(this, angle, velocity, null, x, y, null, value));
			waveValue -= value;
		} else {
			size = this.getRandomInt(1,3);
			this.addEntity(new Asteroid(this, angle, velocity, x, y, size));
			waveValue -= size;
		}
		if (type - powerChance > 0) {
			this.addEntity(new PowerUp(this, angle, velocity, null, x, y, null));
		}
	}
}



GameEngine.prototype.randOffScreenPoint = function() {
	side = Math.round(Math.random());
	if (side === 0) {
		return 0 - this.getRandomInt(50, 100);
	} else {
		return 800 + this.getRandomInt(50, 100);
	}
}

GameEngine.prototype.makeProtoEnemies = function() {
	this.addEntity(new Asteroid(this, (Math.random() * 2 * Math.PI), 
									   {x: this.getRandomInt(1,4), y: this.getRandomInt(1,4)},
									   300, 500, 3));
	this.addEntity(new Asteroid(this, (Math.random() * 2 * Math.PI), 
									   {x: this.getRandomInt(1,4), y: this.getRandomInt(1,4)},
									   200, 200, 2));
	this.addEntity(new Asteroid(this, (Math.random() * 2 * Math.PI), 
									   {x: this.getRandomInt(1,4), y: this.getRandomInt(1,4)},
									   600, 700, 3));
	this.addEntity(new Asteroid(this, (Math.random() * 2 * Math.PI), 
									   {x: this.getRandomInt(1,4), y: this.getRandomInt(1,4)},
									   100, 600, 1));
}

GameEngine.prototype.getRandomInt = function(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
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
