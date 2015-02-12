var weapon_types = { default: {
							animation: "weapon3",
							velocity: 3,
							radius: 7,
							height: 15,
							width: 12,
							shots: [0],
							effect: function() {
								//that.game.addEntity(new PowerUp(that.game, 2 * Math.PI,{x:0, y:0}, 100, 0, "bombPowerUp"));
							}
						},
					  doublegun: {
							animation: "weapon3",
							velocity: 3,
							radius: 7,
							height: 15,
							width: 12,
							shots: [-5,5] 
						},
					  triplegun: {
							animation: "weapon3",
							velocity: 3,
							radius: 7,
							height: 15,
							width: 12,
							shots: [-15,0,15] 
						},
						backgun: {
							animation: "weapon3",
							velocity: 3,
							radius: 7,
							height: 15,
							width: 12,
							shots: [0,180] 
						},
						bomb: {
							animation: "weapon3",
							velocity: 3,
							radius: 7,
							height: 15,
							width: 12,
							uses: 0,
							shots: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 
									110, 120, 130, 140, 150, 160, 170, 180, 190, 
									200, 210, 220, 230, 240, 250, 260, 270, 280, 
									290, 300, 310, 320, 330, 340, 350] 
						}

};


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
	this.debug = false;
	
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
	
	SpaceObject.prototype.draw = function(drawWidth, drawHeight) {
		this.animation.drawFrame(this.game.clockTick, this.ctx, this.game.getX(this.animation.frameWidth, this.x), 
			this.game.getY(this.animation.frameHeight, this.y), drawWidth, drawHeight);
	};
} // end of Constructor

function AlienShip(game, angle, velocity, animation, x, y, weapon, value) {
	SpaceObject.call(this, game, angle, velocity, animation,x, y, value);
	
	this.weapon = weapon;
	// magic numbers! woohoo! 
	this.radius = 22;
	

	this.draw = function() {
		//this.ctx.rotate(angle);
		// explosion width: 36 height: 38
		this.ctx.drawImage(this.animation, game.getX(50, this.x), game.getY(50, this.y), 50, 50);
		if(this.debug){
		this.ctx.beginPath();
      		this.ctx.arc(this.game.getX(50, this.x), 
				this.game.getY(50, this.y), this.radius, 0, 2 * Math.PI, false);
      		this.ctx.fillStyle = 'green';
      		this.ctx.fill();
      		this.ctx.lineWidth = 5;
      		this.ctx.strokeStyle = '#003300';
      		this.ctx.stroke();
      	}
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
} // end of AlienShip

function PlayerShip(game, angle, velocity, animation, x, y, weapon) {
	SpaceObject.call(this, game, angle, velocity, animation, x, y, 0);

	this.shield = 100;
	this.lives = 3;
	this.weapon = weapon;
	this.sec_weapon = "none";
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
			for (var shot in weapon_types[this.weapon]["shots"]) {
				var weap_angle = weapon_types[this.weapon]["shots"][shot];
				weap_angle = game.toRadians(weap_angle);
				this.game.addEntity(new Weapon(this.game, this.angle + weap_angle, this.velocity, this.x, this.y, 0, this.weapon));
			}
			var sec_effect = weapon_types[this.weapon]["effect"];
			if (typeof sec_effect === "function") {
				that = this;
				sec_effect();
			}
			this.shoot = false;
		}
		console.log(this.sec_weapon);
		if (this.sec_weapon != "none") {
			if(this.game.ctrlkey) this.sec_shoot = true;

			if(this.sec_shoot && weapon_types[this.sec_weapon]["uses"] > 0) {
				for (var shot in weapon_types[this.sec_weapon]["shots"]) {
					var weap_angle = weapon_types[this.sec_weapon]["shots"][shot];
					weap_angle = game.toRadians(weap_angle);
					this.game.addEntity(new Weapon(this.game, this.angle + weap_angle, this.velocity, this.x, this.y, 0, this.sec_weapon));
				}
				var sec_effect = this.sec_weapon.effect;
				if (typeof sec_effect === "function") {
					that = this;
					sec_effect();
				}
				this.sec_shoot = false;
				weapon_types[this.sec_weapon]["uses"] -= 1;
			} if (weapon_types[this.sec_weapon]["uses"] <= 0 ) {
				this.sec_weapon = "none";
			}
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
		this.ctx.translate(this.game.getX(this.width, Math.round(this.x)), this.game.getY(this.height, Math.round(this.y)));
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
        	that = this;
        	var doPowerUp = otherObject.getPowerUp;
        	doPowerUp();
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

} // end of PlayerShip


function Asteroid(game, angle, velocity, x, y, size) {
	SpaceObject.call(this, game, angle, velocity, null,x, y, size * 2);
	this.size = size;
	this.debug = false;	
	
	if (Math.random() < .5) {
		this.state = "normal";
	} else {
		this.state = "reverse";
	}
	
	this.radius = 16 * size;

	this.animations = {"normal": new Animation(AM.getAsset("./images/asteroid.png"), 8, 52, 32, 32, 0.01, 8, 64, true, false),
					   "reverse": new Animation(AM.getAsset("./images/asteroid.png"), 8, 52, 32, 32, 0.01, 8, 64, true, true),
						"exploding": new Animation(AM.getAsset("./images/asteroid_explosion.png"), 2, 2, 85, 84, 0.03, 4, 16, false, false)};
	this.animation = this.animations[this.state];

	
	this.draw = function() {
	//	this.ctx.save();
	//	this.ctx.translate(this.game.getX(this.width/ 2, Math.round(this.x)), this.game.getY(this.height/2, Math.round(this.y)));
	//	this.ctx.translate(this.width / 2, this.height / 2);
	//	this.ctx.scale(this.size, this.size);
		SpaceObject.prototype.draw.call(this, this.size * this.animation.frameWidth, this.size * this.animation.frameHeight);
		if(this.debug) {
			this.ctx.beginPath();
      		this.ctx.arc(this.game.getX(this.animation.frameWidth, this.x), 
				this.game.getY(this.animation.frameHeight, this.y), this.radius, 0, 2 * Math.PI, false);
      		this.ctx.fillStyle = 'green';
      		this.ctx.fill();
      		this.ctx.lineWidth = 5;
      		this.ctx.strokeStyle = '#003300';
      		this.ctx.stroke();
      	}
	//	this.ctx.restore();
	};
	
	this.update = function() {
		this.animation = this.animations[this.state];
		if (this.state != "exploding") {
			SpaceObject.prototype.update.call(this);
		} else {
			if (this.animation.isDone()) {
				if (this.size > 1) {
					this.split();
				}
				this.removeMe = true;
				
				
			}
		}
		
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
        		otherObject.removeMe = true;
        		this.state = "exploding";
			}
        	if (notify) otherObject.collide(this, false);
		}
	}

}; // end of Asteroid

function PowerUp(game, angle, velocity, x, y, type) {

	this.powerup_types = {
		//start powerup types
		fillShieldPowerUp : {
			animation: new Animation(AM.getAsset("./images/crystals.png"), 0, 0, 31, 29, .1, 3, 12, true, false),
			function: function fillShield() {
				          that.shield = 100;
					  }
		},

		extraLifePowerUp : {
			animation: new Animation(AM.getAsset("./images/crystals.png"), 94, 0, 31, 29, .1, 3, 12, true, false),
			function: function extraLife() {
				          that.lives += 1;
					  }
		},

		doubleGunPowerUp : {
			animation: new Animation(AM.getAsset("./images/crystals.png"), 187,116, 31, 29, .1, 3, 12, true, false),
			function: function doublegun(){ 
						  that.weapon = "doublegun";
			}
		},

		tripleGunPowerUp : {
			animation: new Animation(AM.getAsset("./images/crystals.png"), 187,0, 31, 29, .1, 3, 12, true, false),
			function: function triplegun(){ 
						  that.weapon = "triplegun";
			}
		},

		backGunPowerUp : {
			animation: new Animation(AM.getAsset("./images/crystals.png"), 0,116, 31, 29, .1, 3, 12, true, false),
			function: function backgun(){ 
						  that.weapon = "backgun";
			}
		},

		bombPowerUp : {
			animation: new Animation(AM.getAsset("./images/crystals.png"), 281,0, 31, 29, .1, 3, 12, true, false),
			function: function bomb(){ 
						  that.sec_weapon = "bomb";
						  weapon_types[that.sec_weapon]["uses"] += 1;
			}
		},

		futurePowerUpOne : {
			animation: new Animation(AM.getAsset("./images/crystals.png"), 0,116, 31, 29, .1, 3, 12, true, false),
			function: function backgun(){ 
						  that.weapon = "backgun";
			}
		},

		futurePowerUpTwo : {
			animation: new Animation(AM.getAsset("./images/crystals.png"), 0,116, 31, 29, .1, 3, 12, true, false),
			function: function backgun(){ 
						  that.weapon = "backgun";
			}
		},
		//end powerup types	
	};

	this.animation = this.powerup_types[type]["animation"];
	this.getPowerUp = this.powerup_types[type]["function"];
	
	
	SpaceObject.call(this, game, angle, velocity, this.animation,x, y, 0);

	this.radius = 10;

	this.update = function() {
		SpaceObject.prototype.update.call(this);

	};
	
	this.draw = function() {
		SpaceObject.prototype.draw.call(this, this.animation.frameWidth, this.animation.frameHeight);
	};

	this.collide = function(otherObject, notify) {
		
		if(otherObject instanceof PlayerShip) {
			this.removeMe = true;
			if (notify) otherObject.collide(this, false);
        } else {
        	//ignores alienships, asteroids, weapons, and other powerups
        }
        
	}
} // end of PowerUp


			
function Weapon(game, angle, velocity, x, y, radius, type) {
	SpaceObject.call(this, game, angle, velocity,null, x, y, 0);
	
	this.animations = {"weapon3" : new Animation(AM.getAsset("./images/weapon3.png"), 0, 0, 31, 44, .02, 8, 144, false, false)};

	this.type = weapon_types[type];	

	this.x = x;
	this.y = y;

	this.animation = this.animations[this.type["animation"]];
	this.velocity = {x: this.type["velocity"] * Math.cos(this.angle) + velocity.x, y: this.type["velocity"] * -Math.sin(this.angle) + velocity.y};
	this.height = this.type["height"];
	this.width = this.type["width"];
	this.radius = this.type["radius"];

	this.draw = function() {
		//this.ctx.save();
		//this.ctx.scale(10, 10);
		SpaceObject.prototype.draw.call(this, this.animation.frameWidth, this.animation.frameHeight);
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






