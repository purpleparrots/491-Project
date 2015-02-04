//initial angle given in radians, velocity is {x: , y: } vector
//x, y given in game coords
function SpaceObject(game, angle, velocity, animation, x, y, value) {

	this.animation = animation;
	this.game = game;
	this.ctx = this.game.game_ctx;
	this.x = x;
	this.y = y;
	this.velocity = velocity;
	this.angle = angle;
	this.removeMe = false;
	this.value = value;
	
	this.update = function() {
		this.x += this.velocity.x;
		this.y += this.velocity.y;
		if (this.y >= game.surfaceHeight + 50) {
			this.y = -game.surfaceHeight - 50;
		} 
		if (this.x >= game.surfaceWidth + 50) {
			this.x = -game.surfaceWidth - 50;
		}
		if (this.y < -game.surfaceHeight - 50) {
			this.y = game.surfaceHeight + 50;
		}
		if (this.x < -game.surfaceWidth - 50) {
			this. x = game.surfaceWidth + 50;
			
		}
	}
	
	SpaceObject.prototype.draw = function() {
		this.animation.drawFrame(this.game.clockTick, this.ctx, game.getX(this.animation, this.x), 
			game.getY(this.animation, this.y));
	}

}

function AlienShip(game, angle, velocity, animation, x, y, weapon, value) {
	SpaceObject.call(this, game, angle, velocity, animation,x, y, value);
	
	this.weapon = weapon;
	
	
}

function PlayerShip(game, angle, velocity, animation, x, y, weapon) {
	SpaceObject.call(this, game, angle, velocity, animation,x, y, 0);
	
	this.shield = 100;
	this.lives = 3;
	this.weapon = weapon;
	this.sec_weapon = [];
	this.shoot = false;
    this.rotateLeft = false;
    this.moveforward = false;
    this.rotateright = false;
	
	PlayerShip.prototype.update = function() {
		if (this.game.upkey) this.moveforward = true;
		if(moveforward) {
			this.y = -5;
		}
	}

	this.draw = function() {
		//this.ctx.rotate(angle);
		this.ctx.drawImage(this.animation, game.getX(this.animation, this.x), 
			game.getY(this.animation, this.y), 50, 50);
		//this.ctx.restore();
	}
}


function Asteroid(game, angle, velocity, x, y, size) {
	SpaceObject.call(this, game, angle, velocity, null,x, y, size * 2);
	
	this.state = "normal";
	this.animations = {"normal": new Animation(AM.getAsset("./images/asteroid.png"), 8,52, 32, 32,.01,8, 64, true, false),
					   "exploding": new Animation(AM.getAsset("./images/asteroid_explosion.png"), 
												2,2, 85, 84,.2,4, 16, false, false)};
	this.animation = this.animations[this.state];
	this.size = size;
	
	this.draw = function() {
		this.ctx.save();
		this.ctx.scale(size, size);
		SpaceObject.prototype.draw.call(this);
		this.ctx.restore();
	}
	
	this.split = function() {
	}
}

function PowerUp(game, angle, velocity, animation, x, y, weapon) {
	SpaceObject.call(this, game, angle, velocity, animation,x, y, 0);
	
	this.getPowerUp = function() {
	}

}







