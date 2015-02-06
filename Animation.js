

/* Animation Class. This has been modified from the code provided in class so that it can handle almost any sprite sheet.
startingX - the x pixel that is in the upper left hand corner of the first frame
startingY - the y pixel that is in the upper left hand corner of the first frame
frameWidth - the width of a frame in pixels. This can be a single integer or a list. If it is a list, you     must speficiy a width for each frame in the animation.
frameHeight - the height of a frame in pixels
frameDuration - the duration of a frame in seconds
columns - the number of frames in a single row of the sprite sheet
frames - the total number of frames to draw
loop - should the animation loop at the end
reverse - should it go in reverse
*/

function Animation(spriteSheet, startingX, startingY, frameWidth, frameHeight, frameDuration, columns, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
	this.startingY = startingY;
	this.startingX = startingX;
	this.columns = columns;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y) {
    this.elapsedTime += tick;
    if (this.isDone()) {
        if (this.loop) {
			this.elapsedTime = 0;
		}else{
			return;
		}

    } 
    var frame = this.currentFrame() % this.frames;
	
    var xindex = 0;
	var yindex = 0;
	if (this.frames != this.columns) {
	    yindex = Math.floor(frame / (this.frames / this.columns));
		
	}
	var ystart = yindex * this.frameHeight +  this.startingY;
	var xstart = this.startingX;
    xindex = frame % this.columns;
	var currentFrameWidth = this.frameWidth;
	if (Array.isArray(this.frameWidth)) {
		currentFrameWidth = this.frameWidth[xindex];
		for(var i = 0; i < xindex;i++) {
			xstart += this.frameWidth[i];
		}
	} else {	
		xstart = xindex * currentFrameWidth + xstart;
	}
    

// console.log(frame + " "+currentFrameWidth+" "+xstart+ " "+ ystart)
    
    //void ctx.drawImage(image, 
    //                   sx, sy, 
    //                   sWidth, sHeight, 
    //                   dx, dy, 
    //                   dWidth, 
    //                   dHeight);
  //console.log(frame + " "+currentFrameWidth+" "+xstart+ " "+ ystart)

    ctx.drawImage(this.spriteSheet,
                 xstart, ystart,  // selection start point
                 currentFrameWidth, this.frameHeight, //selection rect
                 x, y, //image placement
                 this.frameWidth, //drawing window
                 this.frameHeight); //drawing height

}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}