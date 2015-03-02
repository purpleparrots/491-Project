var weapon_types = { default: {
							animation: "default",
							velocity: 3,
							radius: 7,
							height: 15,
							width: 12,
							shots: [0],
							effect: function() {
								//that.game.addEntity(new PowerUp(that.game, 2 * Math.PI,{x:0, y:0}, 100, 0, "bombPowerUp"));
							}
						},
					  alien: {
					  		animation: "weaponA",
					  		velocity: 3,
					  		radius: 7,
					  		height: 15,
					  		width: 12,
					  		shots:[0],
					  		effect: function() {

					  		}
					    },
					  doublegun: {
							animation: "double",
							velocity: 3,
							radius: 7,
							height: 15,
							width: 12,
							shots: [-5,5] 
						},
					  triplegun: {
							animation: "triple",
							velocity: 3,
							radius: 7,
							height: 15,
							width: 12,
							shots: [-15,0,15] 
						},
					  backgun: {
							animation: "default",
							velocity: 3,
							radius: 7,
							height: 15,
							width: 12,
							shots: [0,180] 
						},
					  bomb: {
							animation: "bomb",
							velocity: 3,
							radius: 7,
							height: 15,
							width: 12,
							uses: 0,
							shots: [0] 
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
		this.animation.drawFrame(this.game.clockTick, this.ctx, this.game.getX(drawWidth, this.x), 
			this.game.getY(drawHeight, this.y), drawWidth, drawHeight);
	};
} // end of Constructor

function AlienShip(game, velocity, x, y, weapon) {
	SpaceObject.call(this, game, 0, velocity, null, x, y, 25);

	this.state = "normal";
	//Animation(spriteSheet, startingX, startingY, frameWidth, frameHeight, frameDuration, columns, frames, loop, reverse)
	this.animations = {"exploding": new Animation(AM.getAsset("./images/alien_explosion.png"), 0, 0, 37, 37, 0.08, 8, 8, false, false),
					   "normal": AM.getAsset("./images/alienship.png")
					}
	this.animation = this.animations[this.state];
	// atan2 returns 0 for (0,1) and PI for (0,-1)
	// for negative y values, it returns the same values but negative
	this.angle = Math.atan2(velocity.y,velocity.x);
	if (this.angle >= 0 && this.angle <= Math.PI) {
		this.angle = (Math.PI / 2) - this.angle;
	} else if (this.angle < 0 && this.angle >= - Math.PI) {
		this.angle = -this.angle;
		this.angle += Math.PI / 2;
	} else if (this.angle >= -Math.PI / 2 && this.angle >= - Math.PI) {
		this.angle = -this.angle;
		this.angle += Math.PI;
	}

	this.weapon = weapon;
	// magic numbers! woohoo! 
	this.radius = 22;
	this.mass = 15;
	this.width = 50;
	this.height = 50;

	this.draw = function() {
		//this.ctx.drawImage(this.animation, game.getX(50, this.x), game.getY(50, this.y), 50, 50);
		if (this.state === "normal") {
			this.ctx.save();
			// move to the middle of where we want to draw our image
			this.ctx.translate(this.game.getX(this.width, Math.round(this.x)), this.game.getY(this.height, Math.round(this.y)));
			this.ctx.translate(this.width / 2, this.height / 2);
	 
			// rotate around that point, converting our 

			this.ctx.rotate(this.angle);//- (Math.PI / 2));

			// draw it up and to the left by half the width
			// and height of the image
			this.ctx.drawImage(this.animation, -25, -25, 50, 50);
			this.ctx.restore();
		} else {
			SpaceObject.prototype.draw.call(this, this.animation.frameWidth * 3, this.animation.frameHeight * 3);
		}
	};
	
	this.update = function() {
		this.animation = this.animations[this.state];
		
		if (this.state === "normal") {
			SpaceObject.prototype.update.call(this);
			if (this.game.waveTick % (40 - this.game.wave) === 0) {
				for (var shot in weapon_types[this.weapon]["shots"]) {
					this.game.addEntity(new Weapon(this.game, this.angle - Math.PI / 2, this.velocity, this.x, this.y, 0, this.weapon));
				}
			}
		} else {
			if (this.animation.isDone()) {
				this.removeMe = true;
			}
		}
		

	};

	this.collide = function(otherObject, notify) {
		if (this.state != "exploding") {
			if(otherObject instanceof PlayerShip) {
				this.takeHit();
				if (notify) otherObject.collide(this, false);
       		} else if (otherObject instanceof Weapon && otherObject.typeName != "alien") {
       			this.takeHit();
        		if (notify) otherObject.collide(this, false);
        	} else {
        	//ignores powerups, asteroids, and other aliens
        	}
        }
	}

	this.takeHit = function() {
		this.x -= 25;
		this.y += 25;
		this.state = "exploding";
	}

} // end of AlienShip

function PlayerShip(game, angle, velocity, animation, x, y, weapon) {
	SpaceObject.call(this, game, angle, velocity, animation, x, y, 0);

	this.weapon = weapon;
	this.sec_weapon = "none";
	this.radius = 22;
	this.shoot = false;
    this.rotateLeft = false;
    this.moveForward = false;
    this.rotateRight = false;
	this.width = 50;
	this.height = 50;
	this.mass = 15;
	this.lives = 0;
	this.shield = 100;
	this.state = "normal";

	this.animations = {"exploding": new Animation(AM.getAsset("./images/alien_explosion.png"), 0, 0, 37, 37, 0.08, 8, 8, false, false),
					   "normal": AM.getAsset("./images/playership.png")
					}
	this.animation = this.animations[this.state];

	this.setShield = function(amount) {
		if (this.state === "normal") {
			this.shield += amount;
			if (this.shield > 100) {
				this.shield = 100;
			} else if (this.shield <= 0) {
				this.shield = 100;
				this.setLives(-1);
				this.state = "exploding";
			}
			this.game.moveSlider(this.shield);
		}
	}
	
	this.setLives = function(lives) {
		this.lives += lives;
		this.game.drawLives(this.lives);
		if (this.lives <= 0) {
			this.game.die();
		}
	}
	
	this.setLives(3);
	this.setShield(100);
	
	this.update = function() {
		this.animation = this.animations[this.state];
		
		if (this.state === "normal") {
			if(this.game.upkey) this.moveForward = true;
			if(this.moveForward) {
				var thrustVel = this.game.resolveVec(this.angle, .2);
				this.setVelocity(this.game.resultVector(this.velocity, thrustVel));

				this.moveForward = false;
			}

			if(this.game.downkey) this.moveBackward = true;
			if(this.moveBackward) {
				var thrustVel = this.game.resolveVec(Math.PI + this.angle, .2);
				this.setVelocity(this.game.resultVector(this.velocity, thrustVel));
			
				//if the ship is slow enough, hitting back will stop it
				if (this.game.velocityMag(this.velocity) <= 2) {
					this.velocity = {x:0,y:0};
				}
				this.moveBackward = false;
			}

			if(this.game.leftkey) this.rotateLeft = true;
			if(this.rotateLeft) {
				this.angle -= 2 * Math.PI / 360 % 2 * Math.PI;
				this.rotateLeft = false;
			}
		
			if(this.game.rightkey) this.rotateRight = true;
			if(this.rotateRight) {
				this.angle += 2 * Math.PI / 360 % 2 * Math.PI;
				this.rotateRight = false;
			
			}
			if(this.game.spacebar && !this.game.fireLock) {
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
				this.game.fireLock = true;
			}
			/*
			if(this.game.spacebar) this.shoot = true;
			if(this.shoot && !this.game.fireLock) {
				for (var shot in weapon_types[this.weapon]["shots"]) {
					var weap_angle = weapon_types[this.weapon]["shots"][shot];
					weap_angle = game.toRadians(weap_angle);
					this.game.addEntity(new Weapon(this.game, this.angle + weap_angle, this.velocity, this.x, this.y, 0, this.weapon));
					this.game.addEntity(new PowerUp(this.game, 0, {x:0,y:0}, 100, 0, "bombPowerUp"));

				}
				var sec_effect = weapon_types[this.weapon]["effect"];
				if (typeof sec_effect === "function") {
					that = this;
					sec_effect();
				}
				this.shoot = false;
				this.game.fireLock = true;
			}
			*/
			if (this.sec_weapon != "none") {

				if(this.game.ctrlkey && weapon_types[this.sec_weapon]["uses"] > 0 && !this.game.secFireLock) {
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
					this.game.secFireLock = true;
					weapon_types[this.sec_weapon]["uses"] -= 1;
				} if (weapon_types[this.sec_weapon]["uses"] <= 0 ) {
					this.sec_weapon = "none";
				}
			}
			SpaceObject.prototype.update.call(this);
		} else {
			if (this.animation.isDone()) {
				this.state = "normal";
				this.animation = this.animations[this.state];
				this.animations["exploding"] = new Animation(AM.getAsset("./images/alien_explosion.png"), 0, 0, 37, 37, 0.08, 8, 8, false, false);
			}
		}
		

	};

	this.draw = function() {
		if (this.state === "normal") {
			// http://creativejs.com/2012/01/day-10-drawing-rotated-images-into-canvas/
			// we'll need to use this to make the ship rotate in place.
			// save the current co-ordinate system 
			// before we mess with it
		 	this.ctx.save();
			// move to the middle of where we want to draw our image
			this.ctx.translate(this.game.getX(this.width, Math.round(this.x)), this.game.getY(this.height, Math.round(this.y)));
			this.ctx.translate(this.width / 2, this.height / 2);
	 
			// rotate around that point
			this.ctx.rotate(this.angle);

			// draw it up and to the left by half the width
			// and height of the image
			this.ctx.drawImage(this.animation, -25, -25, 50, 50);
			this.ctx.restore();
		} else {
			SpaceObject.prototype.draw.call(this, 4 * this.animation.frameWidth, 4 * this.animation.frameHeight);
		}
	};

	this.collide = function(otherObject, notify) {
		if(otherObject instanceof Asteroid) {

			if (otherObject.state != "exploding") {
				this.setShield(-otherObject.size * 2);
				if (notify) {
					otherObject.collide(this, false);
				}
			}
        } else if (otherObject instanceof AlienShip) {
        		if (otherObject.state != "exploding") {
        		this.setShield(-50);
        		if (notify) {
        			otherObject.collide(this, false);
        		}
        	}
        } else if (otherObject instanceof PowerUp) {
        	that = this;
        	var doPowerUp = otherObject.getPowerUp;
        	doPowerUp();
			this.game.addEntity(new FloatingText(this.game.overlay_ctx, otherObject.text));
        	if (notify) otherObject.collide(this, false);
        } else if (otherObject instanceof Weapon && otherObject.typeName === "alien") {
        	this.setShield(-10);
        	if (notify) {
        		otherObject.collide(this, false);
        	}
        } else {
        	//ignores weapons and other playerships
        }   
	}

	this.setVelocity = function(newVelocity) {
		//var thrustVel = this.game.resultVector(this.velocity, this.game.resolveVec(this.angle, .2));
		if (this.game.velocityMag(newVelocity) > this.game.speedcap) {
			var tx = newVelocity.x / this.game.velocityMag(newVelocity);
			var ty = newVelocity.y / this.game.velocityMag(newVelocity);
			this.velocity = {x: tx * this.game.speedcap,
							 y: ty * this.game.speedcap};
		} else {
			this.velocity = newVelocity;
		}
	}

} // end of PlayerShip


function Asteroid(game, angle, velocity, x, y, size) {
	SpaceObject.call(this, game, angle, velocity, null,x, y, size * 2);
	this.size = size;
	this.hasSplit = false;
	
	if (Math.random() < .5) {
		this.state = "normal";
	} else {
		this.state = "reverse";
	}
	
	this.radius = 16 * size;
	this.mass = 10 * size;

	/*this.animations = {"normal": new Animation(AM.getAsset("./images/asteroid.png"), 8, 52, 32, 32, 0.01, 8, 64, true, false),
					   "reverse": new Animation(AM.getAsset("./images/asteroid.png"), 8, 52, 32, 32, 0.01, 8, 64, true, true),
					   "exploding": new Animation(AM.getAsset("./images/asteroid_explosion.png"), 2, 2, 85, 84, 0.03, 4, 16, false, false)};*/
	this.animations = {"normal": new Animation(AM.getAsset("./images/asteroid.png"), 0, 0, 190, 190, 0.05, 7, 64, true, false),
			           "reverse": new Animation(AM.getAsset("./images/asteroid.png"), 0, 0, 190, 190, 0.05, 7, 64, true, true),
			   "exploding": new Animation(AM.getAsset("./images/asteroid_explosion.png"), 2, 2, 85, 84, 0.03, 4, 16, false, false)};
	/*this.animations = {"normal": new Animation(AM.getAsset("./images/asteroid.png"), 0, 0, 128, 128, 0.01, 8, 64, true, false),
			   "reverse": new Animation(AM.getAsset("./images/asteroid.png"), 0, 0, 128, 128, 0.01, 8, 64, true, true),
			   "exploding": new Animation(AM.getAsset("./images/asteroid_explosion.png"), 2, 2, 85, 84, 0.03, 4, 16, false, false)};*/
	this.animation = this.animations[this.state];

	
	this.draw = function() {
	//	this.ctx.save();
	//	this.ctx.translate(this.game.getX(this.width/ 2, Math.round(this.x)), this.game.getY(this.height/2, Math.round(this.y)));
	//	this.ctx.translate(this.width / 2, this.height / 2);
	//	this.ctx.scale(this.size, this.size);
		SpaceObject.prototype.draw.call(this, size * 50, size * 50);
			if(this.debug) {
				this.ctx.beginPath();
	      		this.ctx.arc(this.game.getX(this.size * 50, this.x), 
					this.game.getY(this.size * 50, this.y), this.radius, 0, 2 * Math.PI, false);
	      		this.ctx.fillStyle = 'green';
	      		//this.ctx.fill();
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
			if (!this.hasSplit) {
				this.hasSplit = true;
				this.split();
			}
			if (this.animation.isDone()) {
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
		that = this;
		if(this.state != "exploding") {
			if(otherObject instanceof PlayerShip) {
				this.state = "exploding";
				if (notify) otherObject.collide(this, false);
      	  	} else if (otherObject instanceof Asteroid) {
       	 		if (notify) {
       	 			var newVels = this.game.resolveCollision(this.velocity, this.mass, otherObject.velocity, otherObject.mass);
       	 			this.velocity = newVels[0];
       	 			otherObject.velocity = newVels[1];
       	 			otherObject.collide(this, false);
       	 		}
        	} else if (otherObject instanceof Weapon && otherObject.typeName != "alien") {
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
				          that.setShield(100);
					  },
			text: "Shields Filled"
		},

		extraLifePowerUp : {
			animation: new Animation(AM.getAsset("./images/crystals.png"), 94, 0, 31, 29, .1, 3, 12, true, false),
			function: function extraLife() {
				          that.setLives(1);
					  },
			text: "+1 Life"
					
		},

		doubleGunPowerUp : {
			animation: new Animation(AM.getAsset("./images/crystals.png"), 187,116, 31, 29, .1, 3, 12, true, false),
			function: function doublegun(){ 
						  that.weapon = "doublegun";
			},
			text: "Two Shot"
		},

		tripleGunPowerUp : {
			animation: new Animation(AM.getAsset("./images/crystals.png"), 187,0, 31, 29, .1, 3, 12, true, false),
			function: function triplegun(){ 
						  that.weapon = "triplegun";
			},
			text: "Three Shot"
		},

		backGunPowerUp : {
			animation: new Animation(AM.getAsset("./images/crystals.png"), 0,116, 31, 29, .1, 3, 12, true, false),
			function: function backgun(){ 
						  that.weapon = "backgun";
			},
			text: "Rear Fire"
		},

		bombPowerUp : {
			animation: new Animation(AM.getAsset("./images/crystals.png"), 281,0, 31, 29, .1, 3, 12, true, false),
			function: function bomb(){ 
						  that.sec_weapon = "bomb";
						  weapon_types[that.sec_weapon]["uses"] += 1;
			},
			text: "+1 Bomb Use"
		},

		futurePowerUpOne : {
			animation: new Animation(AM.getAsset("./images/crystals.png"), 0,116, 31, 29, .1, 3, 12, true, false),
			function: function backgun(){ 
						  that.weapon = "backgun";
			},
			text: ""
		},

		futurePowerUpTwo : {
			animation: new Animation(AM.getAsset("./images/crystals.png"), 0,116, 31, 29, .1, 3, 12, true, false),
			function: function backgun(){ 
						  that.weapon = "backgun";
			},
			text: ""
		},
		//end powerup types	
	};

	this.animation = this.powerup_types[type]["animation"];
	this.getPowerUp = this.powerup_types[type]["function"];
	this.text = this.powerup_types[type]["text"];
	
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
	
	this.animations = {"default" : new Animation(AM.getAsset("./images/weapon3.png"), 0, 0, 31, 44, .02, 8, 80, false, false),
					   "double"  : new Animation(AM.getAsset("./images/weapon3.png"), 0, 0, 31, 44, .02, 8, 60, false, false),
					   "triple"  : new Animation(AM.getAsset("./images/weapon3.png"), 0, 0, 31, 44, .02, 8, 40, false, false),
					   "weaponA" : new Animation(AM.getAsset("./images/weaponA.png"), 0, 0, 31, 44, .02, 8, 144, false, false),
					   "bomb" : AM.getAsset("./images/weapon4.png")};

	this.type = weapon_types[type];	
	this.typeName = type;

	this.animation = this.animations[this.type["animation"]];
	
	if (this.typeName != "bomb") {
		this.velocity = {x: this.type["velocity"] * Math.cos(this.angle), y: this.type["velocity"] * -Math.sin(this.angle)};
		var vm = this.game.velocityMag(this.velocity);
		var vx = this.velocity.x / vm;
		var vy = this.velocity.y / vm;

		this.velocity.x = vx * (this.game.speedcap + 3);
		this.velocity.y = vy * (this.game.speedcap + 3);
	} else {
		this.velocity = {x:0,y:0};
	}

	this.height = this.type["height"];
	this.width = this.type["width"];
	this.radius = this.type["radius"];

	this.draw = function() {
		if ( this.animation instanceof Animation) {
			SpaceObject.prototype.draw.call(this, this.animation.frameWidth, this.animation.frameHeight);
		} else {
			this.ctx.drawImage(this.animation, this.game.getX(this.radius * 2, this.x), this.game.getY(this.radius * 2, this.y), 2 * this.radius, 2 * this.radius);
		}
	};
	
	this.update = function() {
		SpaceObject.prototype.update.call(this);
		if (this.animation instanceof Animation) {
			if (this.animation.isDone()) {
				this.removeMe = true;
			}
		} else {
			this.radius += 2;
			if (this.radius >= 300) {
				this.removeMe = true;
			}
		}
		

	};

	this.collide = function(otherObject, notify) {
		
		if(otherObject instanceof Asteroid && this.typeName != "alien") {
			if(otherObject.state != "exploding") {
				this.removeMe = true;
				if (notify) otherObject.collide(this, false);
			}
        } else if (otherObject instanceof AlienShip && this.typeName != "alien") {
        	this.removeMe = true;
        	if (notify) otherObject.collide(this, false);
        } else if (otherObject instanceof PlayerShip && this.typeName === "alien" ) {
        	this.removeMe = true;
        	if (notify) otherObject.collide(this, false);
        } else {
        	//ignores playerships, powerups, and other weapons
        }
        
		if (this.typeName == "bomb") {
			this.removeMe = false;
		}
	}

}

function FloatingText(ctx, str) {
	this.timer_start = new Date().getTime();
	this.str = str;
	this.ctx = ctx;
	this.font_size = 8;
	this.font_string = null;

	//this.ctx.font = "48px serif";
	this.update = function() {
		timer_curr = new Date().getTime();
		if (timer_curr - this.timer_start < 1200) {
			this.font_size += 2;
			this.font_string = this.font_size + "px Impact";
		} else {
			this.removeMe = true;
			this.ctx.clearRect(this.ctx.canvas.width / 2 - this.text_measure.width / 2 , this.ctx.canvas.height / 2 - this.font_size, 
				this.text_measure.width, this.font_size + 5);
		}	
	}
	
	this.draw = function() {
		this.ctx.save();
		this.ctx.font = this.font_string;
		this.text_measure = this.ctx.measureText(this.str);	
		this.ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
		this.ctx.strokeStyle = "rgba(255,255, 255, 0.5)";
		this.ctx.clearRect(this.ctx.canvas.width / 2 - this.text_measure.width / 2 , this.ctx.canvas.height / 2 - this.font_size, this.text_measure.width, this.font_size + 5);
		this.ctx.fillText(this.str, this.ctx.canvas.width / 2 - this.text_measure.width / 2 , this.ctx.canvas.height / 2);
		this.ctx.restore();
		
	}

};




