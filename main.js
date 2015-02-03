// Main starts here
var AM = new AssetManager();
var game = new GameEngine();



AM.queueDownload("./images/playership.png");



AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");
	
    var game = new GameEngine();
	
	game.init(document.getElementById("gameWorld").getContext("2d"), 
		  	document.getElementById("background").getContext("2d"),
			document.getElementById("overlay").getContext("2d"));
    game.start();
	game.addEntity(new PlayerShip(game, 0, {x:0,y:0}, 
		AM.getAsset("./images/playership.png"), 0,0, null));

};

