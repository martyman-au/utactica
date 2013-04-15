var gameClass = Class.extend({
	ready: false,			// Used in the game initialisation phase TODO: Is this needed?
	turn: null,				// Tracks which player's turn it is
	foodcash: [250,250],	// Food resources for each side
	sciencecash: [100,100],	// Science resources for each side
	production: [1,1],		// Production rate for each side
	attack: [0,0],			// Attack bonus for each side
	defence: [0,0],			// Defence bonus for each side
	unitmaxmoves: {worker:[1,1], soldier:[1,1]},		// Keep track of how many moves each side gets (so we can upgrade it)
	controlLock: false,		// Lock controls while an animation is running
	battle:  null,			// Stores the currently running battle
	turnnotes: [],			// store a list of the currently running notifications
	turnchange: false,		// Flag indicating the period between turns

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
		sound = new SoundClass();						// all sound output (music, effects)
	},

	setupGame: function () {
		// Create objects to look after game output, data and logic
		var front = document.getElementById('front');
		front.parentNode.removeChild(front);			// remove front screen text
		
		this.turn = Math.floor((Math.random()*2)); 		// set this.turn to 0 or 1

		cv = new CanvasClass();  						// canvas layers and contexts
		board = new BoardClass(config.boardPattern);	// board and tiles
		units = new UnitsClass();						// units
		effects = new EffectsClass(sprites); 			// effects (animations, etc)			
		ui = new UIClass();								// user interface
		sound.startGame();								// stop menu music and start game soundtrack
		
		this.setupListners();			// Add some listners
		cv.setScale();					// TODO: not sure about this line and the next
		this.redraw();					// ditto
		this.ready = true;				
		requestAnimationFrame( game.animFrame );		// Start animation loop
		ui.widgets.intropopup.render();					// Display introduction popup
	},
	

	animFrame: function(){
		// Animation loop
		requestAnimationFrame( game.animFrame ); 		// continue loop
		board.animFrame();
		effects.animFrame();							// render any currrent effects
		units.animFrame();								// render any unit changes
		if(game.battle) {								// We have a battle to run
			if(game.battle.done) {						// Clear finished battle
				game.battle = null;
			}
			else {
				game.battle.animFrame();				// Process the running battle
			}
		}
		if(game.turnchange) {							// End of turn period
		
			if( game.turnnotes.length > 0 ) {			//	Display turn notifications
				if( game.turnnotes[0].drawFrame() == 'done')  game.turnnotes.shift();					// if the animation is done, delete it
			}
			else {										// Finish the end turn period
				for( i in units.units )	{				// Run through all the units in the game
					units.units[i].remainingmoves = game.unitmaxmoves[units.units[i].type][units.units[i].side];	// reset remaining moves to the unit's max moves
				}
				game.turnchange = false;
				game.turn = 1 - game.turn;				// switch to other player's turn
				ui.greyWidgets(); 						// grey out any widgets that are too expensive
				units.prerender();
				game.redraw();							// redraw everything
				game.setControlLock(false); 			// Enable user input
			}
		}
	},
	
	setupListners: function () {
		window.onkeydown = game.keypress;	// send keypresses to this.keypress();
		
		window.onresize = function(event) {  	// on resize we should reset the canvas size and scale and redraw the board, ui and units
			cv.setScale();						// Scale canvases
			game.redraw();						// redraw all canvases
			if(units.activeUnit) units.units[units.activeUnit].deactivate();  // Deactivate active unit on resize to avoid misplaced "active" effect
		}
	},
	
	keypress: function (e) {
		// Deal with keypresses
		if(!game.controlLock) {
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

			if( code == '72' ) {   						// "h" will bring up a help popup
				ui.widgets.intropopup.render();
			}
			else if (code == '32' ) {					// Space bar ends turn
				ui.widgets.endturn.pulse(200);
				game.endTurn();	
			}
			else if (code == '77' ) {					// "m" Toogle mute status
				ui.widgets.speaker.toggleState();
				ui.widgets.speaker.action();
			}
			else if (code == '84' ) {					// "t" Teleport a unit home
				ui.widgets.teleport.pulse(200);
				units.teleport();
			}
		}
	},
	
	redraw: function () {
		// re-draw all of the game layers
		board.render(); // render the playing board
		units.redraw(); // render the playing board
		ui.redraw();	// render the user interface
	},
	
	endTurn: function () {
		// Perform actions required to end a players turn
		units.deactivate();				// Deactivate current unit
		this.setControlLock(true); 		// Lock out user input
		for( i in units.units )			// Run through all the units in the game
		{
			var unit = units.units[i];
			if( unit.tileid == config.homeTile[1-unit.side]) {	// A home base has been occupied someone has won the game
				ui.widgets.winnerpopup.render();
				sound.endGame();
			}
			if(unit.side == this.turn && unit.type == 'worker') this.collectResource(board.tiles[unit.tileid]);				// collect resources
			if(unit.side == this.turn && unit.type == 'soldier' && unit.tileid == config.homeTile[this.turn]) unit.regen();	// regenerate units if located at home base
		}
		this.turnnotes.push( new TextEffectClass(config.sides[game.turn].name+'\'s turn', {center:true}));
		this.turnchange = true;		// Set end of turn period
	},
	
	collectResource: function (tile) {
		// Allocate any occupied resources to that team
		if( tile.resource.substring(0,1) == 'f') {
			var food = parseInt(this.production[this.turn] * Number(tile.resource.substring(1)));
			this.foodcash[this.turn] = parseInt(this.foodcash[this.turn] + food);
			this.turnnotes.push( new ResourceEffectClass(food, tile.center) );
		}
		else if( tile.resource.substring(0,1) == 's') {
			var science = parseInt(this.production[this.turn] * Number(tile.resource.substring(1)));
			this.sciencecash[this.turn] = parseInt(this.sciencecash[this.turn] + science);
			this.turnnotes.push( new ResourceEffectClass(science, tile.center) );
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
		else if(type == 'workermovement') this.unitmaxmoves.worker[this.turn] += 1;
		ui.greyWidgets(); // grey out any widgets that are too expensive
		units.prerender();
	},
	
	setControlLock: function (value) {
		// set control lock to true or false
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