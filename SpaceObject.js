//initial angle given in radians, velocity is [x,y] vector
//x, y given in game coords

function SpaceObject(game, angle, velocity, animation, x, y) {

	this.animation = animation;
	this.game = game;
	this.x = x;
	this.y = y;
	this.velocty = velocity;
	this.angle = angle;
	this.removeMe = false;
	

	this.draw() {
		this.animation.drawFrame(this.game.clockTick, this.ctx, 
								game.getX(this.animation, this.x), 
								game.getY(this.animation, this.y));
	}

}

function AlienShip(game, angle, velocity, animation, x, y, weapon) {
	this.weapon = weapon;
	this.prototype = new SpaceObject(game, angle, velocity, animation,x, y);
	
}

function PlayerShip(game, angle, velocity, animation, x, y, weapon) {
	this.shield = 100;
	this.lives = 3;
	this.weapon = weapon;
	this.sec_weapon = [];
	this.prototype = new SpaceObject(game, angle, velocity, animation,x, y);
	
}

function Asteroid(game, angle, velocity, animation, x, y, size) {
	this.size = size;
	this.prototype = new SpaceObject(game, angle, velocity, animation,x, y);
	
	this.split = function() {
	}
	
}

function PowerUp(game, angle, velocity, animation, x, y, weapon) {
	this.getPowerUp() {
		return function();
	}
}




