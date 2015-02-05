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
	
	SpaceObject.prototype.update = function() {
		var border = .05 * Math.max(game.surfaceHeight, game.surfaceWidth);
		this.x += this.velocity.x;
		this.y += this.velocity.y;
		if (this.y >= game.surfaceHeight + border) {
			this.y = -game.surfaceHeight - border;
		} 
		if (this.x >= game.surfaceWidth + border) {
			this.x = -game.surfaceWidth - border;
		}
		if (this.y < -game.surfaceHeight - border) {
			this.y = game.surfaceHeight + border;
		}
		if (this.x < -game.surfaceWidth - border) {
			this. x = game.surfaceWidth + border;
			
		}
	};
	
	SpaceObject.prototype.draw = function() {
		this.animation.drawFrame(this.game.clockTick, this.ctx, this.game.getX(this.animation, this.x), 
			this.game.getY(this.animation, this.y));
	};
}

function AlienShip(game, angle, velocity, animation, x, y, weapon, value) {
	SpaceObject.call(this, game, angle, velocity, animation,x, y, value);
	
	this.weapon = weapon;

	this.draw = function() {
		//this.ctx.rotate(angle);
		this.ctx.drawImage(this.animation, game.getX(this.animation, this.x), 
			game.getY(this.animation, this.y), 50, 50);
		//this.ctx.restore();
	};
	
	this.update = function() {
		SpaceObject.prototype.update.call(this);
	};
}

function PlayerShip(game, angle, velocity, animation, x, y, weapon) {
	SpaceObject.call(this, game, angle, velocity, animation, x, y, 0);
	
	this.shield = 100;
	this.lives = 3;
	this.weapon = weapon;
	this.sec_weapon = [];
	
	this.shoot = false;
    this.rotateLeft = false;
    this.moveForward = false;
    this.rotateRight = false;
	
	this.update = function() {
		
		if(this.game.upkey) this.moveForward = true;
		if(this.moveForward) {
			var thrustVel = this.game.resolveVec(this.angle, 1);
			this.velocity = this.game.resultVector(this.velocity, thrustVel);
			this.moveForward = false;
		}

		if(this.game.downkey) this.moveBackward = true;
		if(this.moveBackward) {
			var thrustVel = this.game.resolveVec(Math.PI + this.angle, 1);
			this.velocity = this.game.resultVector(this.velocity, thrustVel);
			this.moveBackward = false;
		}

		if(this.game.leftkey) this.rotateLeft = true;
		if(this.rotateLeft) {
			this.angle -= 4 * Math.PI / 360 % 2 * Math.PI;
			this.rotateLeft = false;
		}
		
		if(this.game.rightkey) this.rotateRight = true;
		if(this.rotateRight) {
			this.angle += 4 * Math.PI / 360 % 2 * Math.PI;
			this.rotateRight = false;
			
		}
		if(this.game.spacebar) this.shoot = true;
		if(this.shoot) {
			null;
		}
		
		SpaceObject.prototype.update.call(this);
	};

	this.draw = function() {
		// http://creativejs.com/2012/01/day-10-drawing-rotated-images-into-canvas/
		// we'll need to use this to make the ship rotate in place.
		//console.log(typeof this.animation);
		// save the current co-ordinate system 
		// before we mess with it
	 	this.ctx.save();
		// move to the middle of where we want to draw our image
		this.ctx.translate(this.game.getX(null, Math.round(this.x)), this.game.getY(null, Math.round(this.y)));
		this.ctx.translate(25, 25);
	 
		// rotate around that point, converting our 

		this.ctx.rotate(this.angle);

		// draw it up and to the left by half the width
		// and height of the image
		this.ctx.drawImage(this.animation, -25, -25, 50, 50);
		this.ctx.restore();
	};

}


function Asteroid(game, angle, velocity, x, y, size) {
	SpaceObject.call(this, game, angle, velocity, null,x, y, size * 2);
	
	if (Math.random() < .5) {
		this.state = "normal";
	} else {
		this.state = "reverse";
	}

	this.animations = {"normal": new Animation(AM.getAsset("./images/asteroid.png"), 8,52, 32, 32,.01,8, 64, true, false),
					   "reverse": new Animation(AM.getAsset("./images/asteroid.png"), 8,52, 32, 32,.01,8, 64, true, true),
						"exploding": new Animation(AM.getAsset("./images/asteroid_explosion.png"), 2,2, 85, 84,.2,4, 16, false, false)};
	this.animation = this.animations[this.state];
	this.size = size;
	
	this.draw = function() {
		this.ctx.save();
		this.ctx.scale(size, size);
		SpaceObject.prototype.draw.call(this);
		this.ctx.restore();
	};
	
	this.update = function() {
		this.animation = this.animations[this.state];
		if (this.state != "exploding") {
			SpaceObject.prototype.update.call(this);
		} else {
			if (this.animation.isDone()) {
				this.removeMe = true;
				if (this.size > 1) {
					this.split();
				}
				
			}
		}
		
		//remove this code after prototyping
		if (Math.random() < .005) {
			this.state = "exploding";
		}
	};
	
	this.split = function() {
		var available_size = this.size;
		while (available_size >= 1) {
			new_size = this.game.getRandomInt(1, available_size);
			available_size -= new_size;
			if (new_size > 0) {
				this.game.addEntity(new Asteroid(this.game, 0, {x: this.game.getRandomInt(-4,4), y: this.game.getRandomInt(-4,4)},  this.x, this.y, 
				new_size));
			}
			
		}
	};
}

function PowerUp(game, angle, velocity, animation, x, y, weapon) {
	SpaceObject.call(this, game, angle, velocity, animation,x, y, 0);
	
	this.getPowerUp = function() {
	};

	this.update = function() {
		SpaceObject.prototype.update.call(this);
	};
	
	this.draw = function() {
		SpaceObject.prototype.draw.call(this);
	};
}

function Weapon(game, angle, velocity, animation, x, y) {
	SpaceObject.call(this, game, angle, velocity, animation, x, y, 0);
	// Animation(spriteSheet, startingX, startingY, frameWidth, frameHeight, frameDuration, columns, frames, loop, reverse) {
	this.animation = new Animation(animation, 0, 0, 31, 44, .4, 10, 10, true, false);
	//this.animation = new Animation(animation, 105, 2, 23.5, 33, .4, 4, 4, true, false);
	//this.animation = new Animation(animation, 8, 10, 17, 20, .05, 8, 8, true, false);
	//this.animation = new Animation(animation, 7, 4, [19, 17, 20, 19, 22, 24, 23, 21, 29, 34], 30, .05, 10, 10, true, false);


	
	this.draw = function() {
		//this.ctx.save();
		//this.ctx.scale(10, 10);
		SpaceObject.prototype.draw.call(this);
		//this.ctx.restore();
	};
	
	this.update = function() {
		SpaceObject.prototype.update.call(this);
	};
}







