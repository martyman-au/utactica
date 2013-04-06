var gameClass = Class.extend({
	ready: false,			// Used in the game initialisation phase TODO: Is this needed?
	turn: null,				// Tracks which player's turn it is
	foodcash: [250,250],	// Food resources for each side
	sciencecash: [100,100],	// Science resources for each side
	production: [1,1],		// Production rate for each side
	attack: [0,0],			// Attack bonus for each side
	defence: [0,0],			// Defence bonus for each side
	initcheck: null,		// TODO: ?????
	controlLock: false,		// Lock controls while an animation is running TODO: fix this up?
	battle:  null,

	init: function () {
		// Start loading sprites, fonts, etc
		sprites = new SpriteSheetClass();
		sprites.load('_media/sprites.png');

		// now load json defining the sprite sheet
		var spritejson = new XMLHttpRequest();
		jsonURL = '_media/sprites.json';
		spritejson.open("GET", jsonURL, true);
		spritejson.onload = function() {
						sprites.parseAtlasDefinition(this.responseText);
						if(game.ready) { game.redraw();	}
					};
		spritejson.send();
	},

	setupGame: function () {
		// Create objects to look after game output, data and logic
		
		var front = document.getElementById('front');
		front.parentNode.removeChild(front);
		
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
		ui.widgets.intropopup.render();
	},
	

	animFrame: function(){
		// Animation loop
		requestAnimationFrame( game.animFrame ); 	// continue loop
		board.animFrame();
		effects.animFrame();						// render any currrent effects
		units.animFrame();							// render any unit changes
		if(game.battle) {
			if(game.battle.done) {
				game.battle = null;
			}
			else {
				game.battle.animFrame();	// process any running battle
			}
		}
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
			if( ui.popup.div ) {
				var div = document.getElementById('popupdiv')
				div.parentNode.removeChild(div);
			}
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
		else if( code == '72' ) ui.widgets.intropopup.render();   				// "h" will bring up a help popup

		else if (code == '32' ) {												// Space bar ends turn
			ui.widgets.endturn.pulse(200);
			game.endTurn();	
		}
		else if (code == '77' ) {												// "m" Toogle mute status
			ui.widgets.speaker.toggleState();
			ui.widgets.speaker.action();
		}
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
		units.deactivate();	// Deactivate current unit
		
		for( i in units.units )			// Run through all the units in the game
		{
			var unit = units.units[i];
			if( unit.tileid == config.homeTile[1-unit.side]) {	// A home base has been occupied soemone has won the game
				console.log('win');
			}
			unit.remainingmoves = unit.maxmoves;	// reset remaining moves
			if(unit.side == this.turn && unit.type == 'worker') this.collectResource(board.tiles[unit.tileid].resource);	// collect resources
			if(unit.side == this.turn && unit.type == 'soldier' && unit.tileid == config.homeTile[this.turn]) unit.regen();	// collect resources
		}
		this.turn = 1 - this.turn;	// switch to other player's turn
		ui.greyWidgets(); 			// grey out any widgets that are too expensive
		this.redraw();
	},
	
	collectResource: function (resource) {
		// Allocate any occupied resources to that team
		if( resource.substring(0,1) == 'f') {
			var food = parseInt(this.production[this.turn] * Number(resource.substring(1)));
			this.foodcash[this.turn] = parseInt(this.foodcash[this.turn] + food);
			effects.renderText(food+' food resouces collected',{center:true});
		}
		else if( resource.substring(0,1) == 's') {
			var science = parseInt(this.production[this.turn] * Number(resource.substring(1)));
			this.sciencecash[this.turn] = parseInt(this.sciencecash[this.turn] + science);
			effects.renderText(science+' science resouces collected',{center:true});
		}
	},
	
	buyUnit: function (type) {
		// Buy a new unit and debit food resources
		var cost = config.unitCosts[type];
		if( board.tiles[config.homeTile[this.turn]].checkSlots() ) { // check for available home slot
			this.foodcash[this.turn] = parseInt(this.foodcash[this.turn] - cost);
			if( type == 'soldier') units.units.push( new SoldierUnitClass(this.turn, config.homeTile[this.turn]) );
			else units.units.push( new WorkerUnitClass(this.turn, config.homeTile[this.turn]) );
			units.scale(); // cause the calculation the new unit's location
			ui.greyWidgets(); // grey out any widgets that are too expensive
		}
		else {
			sound.playSound('doh');
			effects.renderText('YOU DON\'T HAVE ROOM FOR THIS',{center:true});			
		}
	},
	
	buyUpgrade: function (type) {
		// Buy an upgrade and debit science resources
		var cost = config.upgradeCosts[type];
		this.sciencecash[this.turn] = parseInt(this.sciencecash[this.turn] - cost);
		if(type == 'attack') this.attack[this.turn] = parseInt(this.attack[this.turn] + 20);
		else if(type == 'defence') this.defence[this.turn] = parseInt(this.defence[this.turn] + 20);
		else if(type == 'production') this.production[this.turn] = this.production[this.turn] + 0.1;
		ui.greyWidgets(); // grey out any widgets that are too expensive
	},
	
	setControlLock: function (value) {
		if( value ) {
			document.body.style.cursor = 'wait';
			this.controlLock = value;
		}
		else {
			document.body.style.cursor = 'default';
			this.controlLock = value;
		}
	}
});

// variables used to hold main game objects
var sprites = {};	// Sprites class
var cv = {};		// Canvas class
var board = {};		// Board class
var units = {};		// Units class
var effects = {};	// Effects class
var ui = {};		// User interface class
var sound = {};		// Sound class
var game = new gameClass();	// Overall game class