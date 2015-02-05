// Main starts here
var AM = new AssetManager();


AM.queueDownload("./images/playership.png");
AM.queueDownload("./images/asteroid.png");
AM.queueDownload("./images/asteroid_explosion.png");
AM.queueDownload("./images/alienship.png");
AM.queueDownload("./images/background1.jpg");
AM.queueDownload("./images/weapon2.png");


AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");
	
    var bkgrndCtx = document.getElementById("background").getContext("2d");
	bkgrndCtx.drawImage(AM.getAsset("./images/background1.jpg"), 0,0, bkgrndCtx.canvas.width, bkgrndCtx.canvas.height);
    var game = new GameEngine();
	
    //var playerShip = new PlayerShip(game, 0, {x:0,y:0}, AM.getAsset("./images/playership.png"), 0, 0, null);
    //game.addEntity(playerShip);
    
	game.init(document.getElementById("gameWorld").getContext("2d"), 
		  	document.getElementById("background").getContext("2d"),
			document.getElementById("overlay").getContext("2d"));
    game.start();
	game.addEntity(new PlayerShip(game, 0, {x:0,y:0}, 
		AM.getAsset("./images/playership.png"), 0,0, null));
});

