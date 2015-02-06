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
		this.animation.drawFrame(this.game.clockTick, this.ctx, this.game.getX(this.animation.frameWidth, this.x), 
			this.game.getY(this.animation.frameHeight, this.y));
	};
}

function AlienShip(game, angle, velocity, animation, x, y, weapon, value) {
	SpaceObject.call(this, game, angle, velocity, animation,x, y, value);
	
	this.weapon = weapon;
	// magic numbers! woohoo! 
	this.radius = 22;

	this.draw = function() {
		//this.ctx.rotate(angle);
		this.ctx.drawImage(this.animation, game.getX(25, this.x), game.getY(25, this.y), 50, 50);
		//this.ctx.restore();
	};
	
	this.update = function() {
		SpaceObject.prototype.update.call(this);
	};

	this.collide = function(otherObject, notify) {
		
		if(otherObject instanceof PlayerShip) {
			this.removeMe = true;
			if (notify) otherObject.collide(this, false);
        } else if (otherObject instanceof Weapon) {
        	this.removeMe = true;
        	if (notify) otherObject.collide(this, false);
        } else {
        	//ignores powerups, asteroids, and other aliens
        }
        
	}
}

function PlayerShip(game, angle, velocity, animation, x, y, weapon) {
	SpaceObject.call(this, game, angle, velocity, animation, x, y, 0);
	
	this.shield = 100;
	this.lives = 3;
	this.weapon = weapon;
	this.sec_weapon = [];
	this.radius = 22;
	this.shoot = false;
    this.rotateLeft = false;
    this.moveForward = false;
    this.rotateRight = false;
	this.width = 50;
	this.height = 50;
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
			this.game.addEntity(new Weapon(this.game, this.angle, this.velocity, AM.getAsset("./images/weapon3.png"), this.x , this.y));
			this.shoot = false;
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
		this.ctx.translate(this.game.getX(this.width/ 2, Math.round(this.x)), this.game.getY(this.height/2, Math.round(this.y)));
		this.ctx.translate(this.width / 2, this.height / 2);
	 
		// rotate around that point, converting our 

		this.ctx.rotate(this.angle);

		// draw it up and to the left by half the width
		// and height of the image
		this.ctx.drawImage(this.animation, -25, -25, 50, 50);
		this.ctx.restore();
	};

	this.collide = function(otherObject, notify) {
		if(otherObject instanceof Asteroid) {

			if (otherObject.state != "exploding") {
				if (notify) {
					otherObject.collide(this, false);
				} else {
					this.damage(otherObject.size * 10);
				}
			}
        } else if (otherObject instanceof AlienShip) {
        	// take damage
        	if (notify) {
        		otherObject.collide(this, false);
        	} else {
        		this.damage(50);
        	}
        } else if (otherObject instanceof PowerUp) {
        	var doPowerUp = otherObject.getPowerUp();
        	this.doPowerUp();
        	if (notify) otherObject.collide(this, false);
        } else {
        	//ignores weapons and other playerships
        }
        
	}

	this.damage = function(amount) {
		this.shield -= amount;
		if(this.shield <= 0) {
			this.lives -= 1;
		}
	}

}


function Asteroid(game, angle, velocity, x, y, size) {
	SpaceObject.call(this, game, angle, velocity, null,x, y, size * 2);

	this.radius = 3 * size;
	
	if (Math.random() < .5) {
		this.state = "normal";
	} else {
		this.state = "reverse";
	}

	this.animations = {"normal": new Animation(AM.getAsset("./images/asteroid.png"), 8, 52, 32, 32, 0.01, 8, 64, true, false),
					   "reverse": new Animation(AM.getAsset("./images/asteroid.png"), 8, 52, 32, 32, 0.01, 8, 64, true, true),
						"exploding": new Animation(AM.getAsset("./images/asteroid_explosion.png"), 2, 2, 85, 84, 0.03, 4, 16, false, false)};
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
		
		/*remove this code after prototyping
		if (Math.random() < .005) {
			this.state = "exploding";
		}
		*/
	};
	
	this.split = function() {
		var available_size = this.size;
		while (available_size > 1) {
			new_size = this.game.getRandomInt(1, available_size);
			available_size -= new_size;
			if (new_size > 0) {
				this.game.addTempEntity(new Asteroid(this.game, 0, {x: this.game.getRandomInt(-4,4), y: this.game.getRandomInt(-4,4)},  this.x, this.y, 
				new_size));
			}
			
		}
	};
	
	this.collide = function(otherObject, notify) {
		if(this.state != "exploding") {
			if(otherObject instanceof PlayerShip) {
				if (notify) otherObject.collide(this, false);
      	  	} else if (otherObject instanceof Asteroid) {
       	 		if (notify) otherObject.collide(this, false);
        	} else if (otherObject instanceof Weapon) {
        		if (this.size > 1) {
        			this.split();
        		} else {
        			this.state = "exploding";
        		}
        		if (notify) otherObject.collide(this, false);
        	} else {
        		//ignores alienships and powerups
        	}
        
		}
	}

}

function PowerUp(game, angle, velocity, animation, x, y, weapon) {
	SpaceObject.call(this, game, angle, velocity, animation,x, y, 0);
	
	this.radius = 10;
	this.type = game.typeMap[game.getRandomInt(0,100);

	this.getPowerUp = function() {
	};

	this.update = function() {
		SpaceObject.prototype.update.call(this);
	};
	
	this.draw = function() {
		SpaceObject.prototype.draw.call(this);
	};

	this.collide = function(otherObject, notify) {
		
		if(otherObject instanceof PlayerShip) {
			if (notify) otherObject.collide(this, false);
        } else {
        	//ignores alienships, asteroids, weapons, and other powerups
        }
        
	}
}

function Weapon(game, angle, velocity, animation, x, y) {
	SpaceObject.call(this, game, angle, velocity, animation, x, y, 0);
	this.x = x + 50 * Math.cos(angle);
	this.y = y + 50 * Math.sin(angle);
	this.animation = new Animation(animation, 0, 0, 31, 44, .4, 10, 10, false, false);
	this.velocity = {x: 3 * Math.cos(this.angle) + velocity.x, y: 3 * Math.sin(this.angle) + velocity.y};
	this.radius = 3;
	
	this.draw = function() {
		//this.ctx.save();
		//this.ctx.scale(10, 10);
		SpaceObject.prototype.draw.call(this);
		//this.ctx.restore();
	};
	
	this.update = function() {
		SpaceObject.prototype.update.call(this);
		if (this.animation.isDone()) {
			this.removeMe = true;
		}
	};

	this.collide = function(otherObject, notify) {
		
		if(otherObject instanceof Asteroid) {
			if(otherObject.state != "exploding") {
				this.removeMe = true;
				if (notify) otherObject.collide(this, false);
			}
        } else if (otherObject instanceof AlienShip) {
        	this.removeMe = true;
        	if (notify) otherObject.collide(this, false);
        } else {
        	//ignores playerships, powerups, and other weapons
        }
        
	}

}







