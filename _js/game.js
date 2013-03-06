var gameClass = Class.extend({
	turn: null,
	foodcash: [250, 250],
	sciencecash: [100, 100],
	production: [1, 1],
	attack: [10, 10],
	defence: [10, 10],

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
		tab = new TabClass(cv.layers['unitstab'].context);
		
		this.setupListners();			// Add some listner code
		cv.setScale();					// TODO: not sure about this line and the next
		this.redraw();					// ditto
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
		units.redraw(); // render the playing board
		ui.redraw();	// render the user interface
		tab.render();
	},
	
	endTurn: function () {
		// Perform actions required to end a players turn
		// Deactivate current unit, collect resources
		// TODO: collect resources
		units.deactivate();
		for( i in units.units )
		{
			var unit = units.units[i];
			if(unit.side == this.turn)
			{
				if(unit.type == 'worker') this.collectResource(board.tiles[unit.tileid].resource);
				unit.remainingmoves = unit.maxmoves;
			}
		}
		if(this.turn) this.turn = 0;
		else this.turn = 1;
		this.redraw();
	},
	
	collectResource: function (resource) {
		// Allocate any occupied resources to that team
		// TODO: trigger resource collection animation
		if( resource.substring(0,1) == 'f') this.foodcash[this.turn] = this.foodcash[this.turn] + this.production[this.turn] * Number(resource.substring(1));
		else if( resource.substring(0,1) == 's') this.sciencecash[this.turn] = this.sciencecash[this.turn] + this.production[this.turn] * Number(resource.substring(1));
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