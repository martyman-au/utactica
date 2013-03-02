gameClass = Class.extend({
	turn: null,
	foodcash: [100,100],
	sciencecash: [100,100],

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

		this.turn = Math.floor((Math.random()*2)); // set this.turn to 0 or 1

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
	
	endTurn: function () {
		// Perform actions required to end a players turn
		// Deactivate current unit, collect resources
		// TODO: collect resources
		units.deactivate();
		for( i in units.units )
		{
			if(units.units[i].side == this.turn) units.units[i].remainingmoves = units.units[i].maxmoves;
		}
		if(this.turn) this.turn = 0;
		else this.turn = 1;
		this.redraw();
	},
	
	setupListners: function () {
		window.onkeydown = ui.keypress;	// TODO: best place for this?
		
		window.onresize = function(event) {  // on resize we should reset the canvas size and scale and redraw the board, ui and units
			cv.setScale();		// Scale canvases
			game.redraw();		// redraw canvases
			if(units.activeUnit) units.units[units.activeUnit].deactivate();  // Deactivate active unit on resize to avoid misplaced "active" effect
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