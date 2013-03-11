var gameClass = Class.extend({
	ready: false,
	turn: null,
	foodcash: [250,250],
	sciencecash: [100,100],
	production: [1,1],
	attack: [10,10],
	defence: [10,10],
	initcheck: null,
	controlLock: false,

	init: function () {
		// Start loading sprites, fonts, etc
//		loadfonts();		
		sprites = new SpriteSheetClass();
		sprites.load('_media/sprites.png');
		

		// now load json defining the sprite sheet
		var spritejson = new XMLHttpRequest();
		jsonURL = '_media/sprites.json';
		spritejson.open("GET", jsonURL, true);
		spritejson.onload = function() {
						sprites.parseAtlasDefinition(this.responseText);
					};
		spritejson.send();
		
		this.initcheck = setInterval( function () {
				if ( sprites.fullyLoaded && sprites.fullyParsed ) {
					game.setupGame();
					window.clearInterval(game.initcheck);
				}
				else console.log('not ready yet'); // DEBUG: debug code
			}, 50 );
	},

	setupGame: function () {
		// Create objects to look after game output, data and logic

		this.turn = Math.floor((Math.random()*2)); // set this.turn to 0 or 1

		cv = new CanvasClass();  							// canvas layers and contexts
		board = new BoardClass(config.boardPattern);		// board and tiles
		units = new UnitsClass();							// units
		effects = new EffectsClass(sprites); 				// effects (animations, etc)			
		ui = new UIClass();									// user interface
		sound = new SoundClass();							// all sound output (music, effects)
		
		this.setupListners();			// Add some listner code
		cv.setScale();					// TODO: not sure about this line and the next
		this.redraw();					// ditto
		this.ready = true;
		requestAnimationFrame( game.animFrame );	// Start animation loop
	},
	

	animFrame: function(){
		// Animation loop
		requestAnimationFrame( game.animFrame ); 	// continue loop
		effects.animFrame();						// render any currrent effects
		units.animFrame();							// render any unit changes
	},
	
	setupListners: function () {
		window.onkeydown = game.keypress;	// TODO: best place for this?
		
		window.onresize = function(event) {  // on resize we should reset the canvas size and scale and redraw the board, ui and units
			cv.setScale();		// Scale canvases
			game.redraw();		// redraw canvases
			if(units.activeUnit) units.units[units.activeUnit].deactivate();  // Deactivate active unit on resize to avoid misplaced "active" effect
		}
	},
	
	keypress: function (e) {
		// Deal with keypresses
		if(ui.popup)	// If there is a popup then close it and exit
		{
			ui.popup = false;
			ui.redraw();
			return;
		}	
		var code = e.keyCode;
//		console.log(code);
		if( code in config.movekeys )	// This is a move command
		{
			ui.moveIconFlash(code);		// Animate on screen arrow button
			units.move(code); 			// attempt to move the active unit
		}
		else if( code == '72' ) ui.widgets.helppopup.render();   				// "h" will bring up a help popup

		else if (code == '32' ) {												// Space bar ends turn
			ui.widgets.endturn.pulse(200);
			game.endTurn();	
		}
		else if (code == '77' ) ui.widgets.speaker.action();					// "m" Toogle mute status
		else if (code == '84' ) {												// "t" Teleport a unit home
			ui.widgets.teleport.pulse(200);
			units.teleport();
		}
		else if (code == '80' ) units.translations.push( new TranslateClass(units.units[units.activeUnit], {x:20, y:20}));
	},
	
	redraw: function () {
		// re-draw all of the game layers
		// TODO: should we be wiping here, or calling built in redraw funcitons?
		board.render(); // render the playing board
		units.redraw(); // render the playing board
		ui.redraw();	// render the user interface
	},
	
	endTurn: function () {
		// Perform actions required to end a players turn
		units.deactivate();			// Deactivate current unit
		for( i in units.units )		// Run through all the units in the game
		{
			var unit = units.units[i];				
			unit.remainingmoves = unit.maxmoves;	// reset remaining moves
			if(unit.side == this.turn && unit.type == 'worker') this.collectResource(board.tiles[unit.tileid].resource);	// collect resources
		}
		this.turn = 1 - this.turn;	// switch to other player's turn
		ui.greyWidgets(); // grey out any widgets that are too expensive
		this.redraw();
	},
	
	collectResource: function (resource) {
		// Allocate any occupied resources to that team
		// TODO: trigger resource collection animation "text effect"
		if( resource.substring(0,1) == 'f') {
			this.foodcash[this.turn] = this.foodcash[this.turn] + this.production[this.turn] * Number(resource.substring(1));
			effects.renderText(resource.substring(1)+' food resouces collected',{center:true});
		}
		else if( resource.substring(0,1) == 's') {
			this.sciencecash[this.turn] = this.sciencecash[this.turn] + this.production[this.turn] * Number(resource.substring(1));
			effects.renderText(resource.substring(1)+' science resouces collected',{center:true});
		}
	},
	
	buyUnit: function (type) {
		var cost = config.unitCosts[type];
		if( board.tiles[config.homeTile[this.turn]].checkSlots() ) { // check for available home slot
			this.foodcash[this.turn] = this.foodcash[this.turn] - cost;
			if( type == 'soldier') units.units.push( new SoldierUnitClass(this.turn, config.homeTile[this.turn]) );
			else units.units.push( new WorkerUnitClass(this.turn, config.homeTile[this.turn]) );
			units.scale(); // cause the calculation the new unit's location
			ui.greyWidgets(); // grey out any widgets that are too expensive
		}
		else {
			sound.playSound('doh');
			effects.renderText('YOU DON\'T HAVE ROOM FOR THIS',{center:true});			
		}
	}
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