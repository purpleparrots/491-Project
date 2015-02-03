// Main starts here
var AM = new AssetManager();
var game = new GameEngine();

game.init(document.getElementById("gameWorld"), 
		  	document.getElementById("background"),
			document.getElementById("overlay"));




AM.downloadAll(game.start());

