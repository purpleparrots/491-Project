//initial angle given in radians, velocity is {x: , y: } vector
//x, y given in game coords
function SpaceObject(game, angle, velocity, animation, x, y) {

	this.animation = animation;
	this.game = game;
	this.ctx = this.game.game_ctx;
	this.x = x;
	this.y = y;
	this.velocty = velocity;
	this.angle = angle;
	this.removeMe = false;
	
	this.update = function() {
		
	}
	
	this.draw = function() {
		this.animation.drawFrame(this.game.clockTick, this.ctx, 
								game.getX(this.animation, this.x), 
								game.getY(this.animation, this.y));
	}

}

function AlienShip(game, angle, velocity, animation, x, y, weapon) {
	SpaceObject.call(this, game, angle, velocity, animation,x, y);
	
	this.weapon = weapon;
	
	
}

function PlayerShip(game, angle, velocity, animation, x, y, weapon) {
	SpaceObject.call(this, game, angle, velocity, animation,x, y);
	
	this.shield = 100;
	this.lives = 3;
	this.weapon = weapon;
	this.sec_weapon = [];
	

	this.draw = function() {
		this.ctx.rotate(angle);
		this.ctx.drawImage(animation, game.getX(this.animation, this.x), 
			game.getY(this.animation, this.y));
		this.ctx.restore();
	}
}


function Asteroid(game, angle, velocity, animation, x, y, size) {
	SpaceObject.call(this, game, angle, velocity, animation,x, y);
	
	
	this.size = size;
	
	this.split = function() {
	}

	
}

function PowerUp(game, angle, velocity, animation, x, y, weapon) {
	SpaceObject.call(this, game, angle, velocity, animation,x, y);
	
	this.getPowerUp = function() {
	}

}





