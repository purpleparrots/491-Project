

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
        if (this.loop) this.elapsedTime = 0;
    } 
    var frame = this.currentFrame() % this.frames;
	
    var xindex = 0;
    var yindex = this.startingY;
    var xstart = this.startingX;
    xindex = frame % this.columns;
	if (Array.isArray(this.frameWidth)) {
		currentFrameWidth = this.frameWidth[xindex];
		for(var i = 0; i < xindex;i++) {
			xstart += this.frameWidth[i];
		}
	} else {
		xstart = xindex * currentFrameWidth
		currentFrameWidth = this.frameWidth;
	}
    

  // console.log(frame + " "+currentFrameWidth+" "+xstart+ " "+ yindex)

    ctx.drawImage(this.spriteSheet,
                 xstart, yindex,  // selection start point
                 currentFrameWidth, this.frameHeight, //selection rect
                 x, y, //image placement
                 currentFrameWidth, //drawing window
                 this.frameHeight); //drawing height

}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}
