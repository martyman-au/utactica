gameClass = Class.extend({

	init: function () {
		// Start loading sprites, fonts, etc
		loadfonts();		
		sprites = new SpriteSheetClass();
		sprites.load('http://people.physics.anu.edu.au/~martin/utactica/_media/sprites.png');

		// now load json defining the sprite sheet
		var spritejson = new XMLHttpRequest();
		jsonURL = 'http://people.physics.anu.edu.au/~martin/utactica/_media/sprites.json';
		spritejson.open("GET", jsonURL, true);
		spritejson.onload = function() {
						sprites.parseAtlasDefinition(this.responseText);
						game.setupGame();							// TODO: Probably not the best spot to be calling this code?
					};
		spritejson.send();
	},

	setupGame: function () {
		// Create objects to look after game output, data and logic
		cv = new CanvasClass();  						// canvas layers and contexts
		board = new BoardClass(config.boardPattern);	// board and tiles
		units = new UnitsClass();						// units
		effects = new EffectsClass(sprites); 			// effects (animations, etc)			
		ui = new UIClass();								// user interface
		sound = new SoundClass();						// all sound output (music, effects)
		
		this.setupListners();			// Add some listner code
		cv.setScale();					// TODO: not sure about this line and the next
		this.redraw();					// ditto
	},
	
	setupListners: function () {
		window.onkeydown = ui.keypress;	// TODO: best place for this?

		
		window.onresize = function(event) {  // on resize we should reset the canvas size and scale and redraw the board, ui and units
			cv.setScale();
			board.render();
			units.render();
			ui.render();
		}
	},
	
	redraw: function () {
		// re-draw all of the game layers
		// TODO: should we be wiping here, or calling built in redraw funcitons?
		board.render(); // render the playing board
		units.render(); // render the playing board
		ui.render();	// render the user interface	
	},

});

// variables used to hold main game objects
var sprites = {};
var cv = {};
var board = {};
var units = {};
var effects = {};
var ui = {};
var sound = {};
var game = new gameClass();