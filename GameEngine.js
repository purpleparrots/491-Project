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
    this.game_ctx = null;
	this.background_ctx = null;
	this.overlay_ctx = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
    this.wave = 0;
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
    if (this.entities.length < 5) {
    	this.increment("wave",1);
    	this.generateWave();
    }
    this.update();
    this.draw();
}

GameEngine.prototype.getX = function(animation, x) {
	return (this.surfaceWidth / 2) + x //- (animation.frameWidth / 2);
	
}

GameEngine.prototype.getY = function(animation, y) {
	return (this.surfaceHeight / 2) + y //- (animation.frameHeight / 2);
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
	waveValue = this.wave * 110;
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
