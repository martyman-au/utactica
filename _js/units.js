UnitsClass = Class.extend({
	// Class that contains all of the units in the game
	units: new Array(),
	activeUnit: null,
	translations: [],
	drag: false,
	dragoffset: {x:null, y:null},
	
	init: function () {
		this.allocateUnits();
	},
	
	allocateUnits: function () {
		this.units.push( new SoldierUnitClass(0, config.homeTile[0]) );
		this.units.push( new SoldierUnitClass(0, config.homeTile[0]) );
		this.units.push( new WorkerUnitClass(0, config.homeTile[0]) );
		this.units.push( new WorkerUnitClass(0, config.homeTile[0]) );
		this.units.push( new SoldierUnitClass(1, config.homeTile[1]) );
		this.units.push( new SoldierUnitClass(1, config.homeTile[1]) );
		this.units.push( new WorkerUnitClass(1, config.homeTile[1]) );
		this.units.push( new WorkerUnitClass(1, config.homeTile[1]) );
		this.units.push( new WorkerUnitClass(1, 1) );
		this.units.push( new SoldierUnitClass(1, 1) );
	},
	
	animFrame: function () {
		for( i in this.translations )	{
			if( this.translations[i].animFrame() == 'done') delete this.translations[i];
		}
		this.redraw();
	},
	
	redraw: function () {
		this.destroy(); // delete dead units
		this.wipe();	// clear the board
		this.render();	// redraw existing units
	},
	
	render: function () {
		// Render all of the units on the board
		for( i in this.units ) this.units[i].render(); // render every unit
	},

	wipe: function () {
		// wipe the units layer
		cv.layers['units'].context.clearRect(0, 0, cv.layers['units'].canvas.width / cv.scale, cv.layers['units'].canvas.height / cv.scale); // clear all of units layer
	},
	
	scale: function () {
		// Calculate position of units after rescale
		for( i in this.units ) this.units[i].calcPos();
	},
	
	mouse: function (event, x, y) {
		var i = null;
		var unit = null;
		if(event === 'mousedown') {
			this.deactivate();
			this.activeUnit = null;
			this.drag = true;
			for( i in this.units ) {
				unit = this.units[i];
				if( unit.clickHit(x,y) && unit.side == game.turn && unit.remainingmoves > 0) {
					unit.activate();
					this.activeUnit = i;
					this.dragoffset.x = this.units[this.activeUnit].ux - x;
					this.dragoffset.y = this.units[this.activeUnit].uy - y;
				}
			}
		}
		else if( event === 'mousemove') {
			if(this.activeUnit && this.drag) {
				this.units[this.activeUnit].ux = x + this.dragoffset.x;
				this.units[this.activeUnit].uy = y + this.dragoffset.y;
				var newtile = board.clickhit(x,y);
				board.moveHighlight(this.units[this.activeUnit].tileid,newtile,this.units[this.activeUnit].remainingmoves);
			}
		}
		else if( event === 'mouseup') {
			if( this.activeUnit ) this.dragmove(x,y);
			this.drag = false;
			board.unHighlight();
		}
	},
	
	dragmove: function (x,y) {
		var newtile = board.clickhit(x,y);
		if(newtile && newtile.state !== 2 ) { this.units[this.activeUnit].actualMove(newtile,'slot0'); }
		else this.units[this.activeUnit].actualMove(this.units[this.activeUnit].tileid,this.units[this.activeUnit].slotid);
	},
	
	isMovePossible: function (newtile) {
		var oldtile = board.tiles[this.units[this.activeUnit].tileid].grididx;
		var possibles = [];
		var tgt = {};
		directions = [{x:-1,y:-1},{x:1,y:-1},{x:-1,y:1},{x:1,y:1},{x:0,y:-2},{x:0,y:2}];
		for( i in directions ) {
			tgt.x = parseInt(oldtile.x) + directions[i].x;
			tgt.y = parseInt(oldtile.y) + directions[i].y;
			console.log(tgt);
			var tile = board.checkmove(tgt);
			if(tile == newtile) return true;
		}
		return false;	
	},
	
	move: function (keycode) {
		// move the active unit
		if( this.activeUnit == null ) {
			sound.playSound('doh');
			effects.renderText('NO UNIT SELECTED',{center:true});
			return;
		}
		else this.units[this.activeUnit].move(keycode);
	},	
	
	teleport: function () {
		// teleport the active unit
		if( this.activeUnit == null ) {
			sound.playSound('doh');
			effects.renderText('NO UNIT SELECTED',{center:true});
		}
		else if( this.units[this.activeUnit].tileid == config.homeTile[game.turn] ) {
			sound.playSound('doh');
			effects.renderText('YOU ARE ALREADY AT YOUR HOME BASE',{center:true});
		}
		else this.units[this.activeUnit].teleport();
	},
	
	getEnemies: function (tile) {
		// get array of enemies located on a tile
		var enemies = { units: [], soldier: 0, worker: 0};
		for( i in units.units ) // count how many soldiers exist on a tile
		{
			if( units.units[i].tileid == tile && units.units[i].side != game.turn )
			{
				enemies.units.push( i ); 
				enemies[units.units[i].type]++; // if the tile has soldiers
			}
		}
		return enemies;
	},
	
	deactivate: function () {
		if(this.activeUnit) this.units[this.activeUnit].deactivate(); // deactive active unit
	},

	destroy: function () {
		for( i in this.units )
		{
			if(units.units[i].state == 'dead' ) delete units.units[i];
		}
	},

});


UnitClass = Class.extend({
	// Class that defines an individual unit
	side: '',
	colour: '',
	state: 'normal',
	tileid: null,
	slotid: null,
	ux: null,
	uy: null,
	maxmoves: 2,
	remainingmoves: 2,
	slotoffsetx: 0,
	slotoffsety: 0,
	spritewidth: 50,	// TODO: hardcoded
	spriteheight: 50,	// TODO: hardcoded
	
	init: function (side, tile) {
		this.side = side;
		if(this.side) this.colour = 'blue'; // Side 1 has blue units
		else this.colour = 'red';			// Side 0 has red units
		this.tileid = tile;
		this.slotid = board.allocateSlot(this.tileid);		// Find which slot on the tile is available
	},

	activate: function () {
//		units.activeUnit = this;	// TODO need to set units.activeUnit to this unit's ID...
		this.state = 'active';
		this.redraw();
//		effects.renderEffect('active', this.ux, this.uy);
	},
	
	deactivate: function () {
		if(this.state == 'active')
		{
			this.state = 'normal';
			this.redraw();
			units.activeUnit = null;
			effects.deleteAnimation('active');
		}
	},
	
	redraw: function () {
		this.wipe();
		this.calcPos();			// calculate new canvas location
		this.render();
	},
	
	move: function (code) {
		var tgt = {}; 	// Target tile x and y indexes
		tgt.x = parseInt(board.tiles[this.tileid].grididx.x) + config.movekeys[code].x;
		tgt.y = parseInt(board.tiles[this.tileid].grididx.y) + config.movekeys[code].y;
		
		var newtile = board.checkmove(tgt); 			// find the ID of the deired tile
		if( newtile ) { 								// if the desired tile exists check if this is a move or attack
			var enemies = units.getEnemies(newtile);	// Check for enemies on teh target tile
			if(enemies.units.length > 0) { 				// if there was at least one enemy on the target tile
				if( this.canAttack ) this.attack(newtile, enemies);	// If this unit is a soldier then attack
				else {
					effects.renderText('WORKERS CAN\'T ATTACK',{center:true});
					sound.playSound('doh');				// If this unit is worker don't move
				}
			}
			else {	// There was no enemies lets see if we can move there
				var newslot = board.allocateSlot(newtile);			// Allocate a slot on the target tile
				if( newslot ) { this.actualMove(newtile,newslot); }	// animate the actual move
				else {
					effects.renderText('THERE IS NO ROOM FOR THAT',{center:true});
					sound.playSound('doh');
				}
			}
		}
		else {
			effects.renderText('YOU CAN\'T MOVE THAT DIRECTION',{center:true});
			sound.playSound('doh');
		}
	},
	
	actualMove: function (newtile,newslot) {
		var newloc = {};
		var slots = board.tiles[newtile].slots;
		var slotoffsetx = Math.max( -50, Math.min(50, slots[newslot].xoffset*(this.spritewidth*0.75))); // TODO: Hardcoded slot offset distance
		var slotoffsety = Math.max( -50, Math.min(50, slots[newslot].yoffset*(this.spritewidth*0.75))); // TODO: Hardcoded slot offset distance
		newloc.x = board.tiles[newtile].center.x + cv.Offset.x + slotoffsetx;
		newloc.y = board.tiles[newtile].center.y + cv.Offset.y + slotoffsety;
		units.translations.push( new TranslateClass(units.units[units.activeUnit], newloc));
		board.tiles[this.tileid].clearSlot(this.slotid); // Clear old slot on board	
		this.tileid = newtile; 	// Set unit to new tile location
		this.slotid = newslot;	// set unit to new tile slot
	},
	
	wipe: function () {
		// wipe the units canvas to clear this unit off the board
		cv.layers['units'].context.clearRect(this.ux-(this.spritewidth/2), this.uy-(this.spriteheight/2), this.spritewidth+2, this.spriteheight+2);
	},
	
	render: function () {
		// render this unit to the units canvas
		var spriteimg = this.colour+'-'+this.type
		if(this.remainingmoves == 0 || this.side != game.turn) spriteimg = spriteimg+'-grey';
		spriteimg = spriteimg+'.png';
		drawSprite(spriteimg, cv.layers['units'].context, this.ux, this.uy)
	},
	
	calcPos: function () {
		// calculate the x,y position of the unit from the tile and slot
		var slots = board.tiles[this.tileid].slots;
		this.slotoffsetx = Math.max( -50, Math.min(50, slots[this.slotid].xoffset*(this.spritewidth*0.75))); // TODO: Hardcoded slot offset distance
		this.slotoffsety = Math.max( -50, Math.min(50, slots[this.slotid].yoffset*(this.spritewidth*0.75))); // TODO: Hardcoded slot offset distance
		this.ux = board.tiles[this.tileid].center.x + cv.Offset.x + this.slotoffsetx;
		this.uy = board.tiles[this.tileid].center.y + cv.Offset.y + this.slotoffsety;
	},
	
	clickHit: function (x,y) {
		// Return true if a click (x,y) hits this unit
		var sx = this.spritewidth/2;
		var sy = this.spriteheight/2;
		if (( x > ( this.ux - sx )) && ( x < this.ux + sx ) && ( y > (this.uy - sy ) ) && ( y < this.uy + sy ) ) return true;
		else return false;
	},
	
	teleport: function (slot) {
		var hometile = config.homeTile[this.side];
		if(slot == undefined )	var slot = board.allocateSlot(hometile);	// find a free slot at the home tile
		if( slot ) // Free slot means that we can teleport home
		{
			this.remainingmoves--;	// decrease the remaining moves of this unit
			board.tiles[this.tileid].clearSlot(this.slotid); // Clear slot on board	
			this.deactivate();
			effects.renderEffect('teleport', this.ux, this.uy)	// render an explosion or teleport effect
			var start = { x: this.ux, y: this.uy };
			this.tileid = hometile;
			this.slotid = slot;
			this.redraw();
			effects.renderEffect('teleport', this.ux, this.uy)	// render an explosion or teleport effect
			var end = { x: this.ux, y: this.uy };
			effects.renderBeam('beam',start,end);
		}
		else { // No free slot means we can't teleport home 
			effects.renderText('THERE IS NO ROOM FOR THAT',{center:true});
			sound.playSound('doh');
		}
	},
});
	
SoldierUnitClass = UnitClass.extend({
	// Class for soldier units
	canDefend: true,
	canAttack: true,
	type: 'soldier',

	attack: function (tile, enemies) {
		game.controlLock = true;				// Lock control input TODO: Need to make this more formalized and robust
		sound.playSound('battle');				// play attack sound effect
		
		var attack = Math.floor((Math.random()*100)+1);	// roll for attackers
		var defend = Math.floor((Math.random()*100)+1);	// roll for defenders
		if( enemies.soldier == 0 ) defend = -1000; 		// If no soldiers, workers get no defence
		console.log('attack roll: '+attack);
		console.log('defend roll: '+defend);
		console.log('raw result: '+(attack-defend));
		var result = attack - defend + game.attack[game.turn] - game.defence[(1-game.turn)];	// Apply upgrade multipliers
		// TODO: multi unit defence bonus, home base defence bonus

		console.log('attack result: '+result);	// DEBUG: output attack result

		if( result < -16 ) { // The attacking unit is destroyed
			effects.renderText('YOUR UNIT WAS DESTOYED IN THE BATTLE',{center:true});
			setTimeout( function () {units.units[units.activeUnit].lose(); game.controlLock = false; }, 1500 );
		}
		else if( result > 16 ) { // A defending unit is destroyed
			effects.renderText('YOUR ATTACK WAS SUCCESSFUL',{center:true});
			// TODO: mark only one soldier dead
			setTimeout( function () {
				if( enemies.soldier > 1 ) { // If more than one soldier then only destroy one
					for( i in enemies.units ) {
						var unit = units.units[enemies.units[i]];
						if( unit.type == 'soldier' ) {
							unit.lose();
							break;
						}
					}
					units.units[units.activeUnit].remainingmoves--;
					units.units[units.activeUnit].deactivate();
					game.controlLock = false;
				}
				else { // If one soldier or less, then destroy all units
					for( i in enemies.units ) {
						units.units[enemies.units[i]].lose(); // TODO: make only one unit die and deal with remaining workers
					}
					setTimeout( function () { // after a delay move the attacking unit
					    units.units[units.activeUnit].actualMove(tile,board.allocateSlot(tile)); // move the unit to it's new location
						game.controlLock = false;
					}, 400 );
				}
			}, 1500 );
		}
		else { // a stalemate
			this.remainingmoves--;
			setTimeout( function () {
				effects.renderText('UNFORTUNATELY YOUR ATTACK WAS UNSUCCESSFUL',{center:true});
				game.controlLock = false;
			}, 1500);
			this.deactivate();
			this.redraw();
		}		
	},

	lose: function () {
		// Deal with a unit losing a battle
		this.deactivate();
		board.tiles[this.tileid].clearSlot(this.slotid); // Clear slot on board	
		this.wipe(); 		// wipe the unit from the units cavas

		effects.renderEffect('explosion', this.ux, this.uy)	// render an explosion
		this.state = 'dead';
		units.redraw();
	},
});

WorkerUnitClass = UnitClass.extend({
	// Class for worker units
	canDefend: false,
	canAttack: false,
	type: 'worker',
	
	lose: function () {
		// Deal with the unit losing a battle
		var slot;
		var hometile = config.homeTile[this.side];	// target for teleport
		
		this.deactivate();
		board.tiles[this.tileid].clearSlot(this.slotid); // Clear slot on board	
		this.wipe(); 		// wide the unit from the units cavas
		
		if(this.tileid !== hometile) { slot = board.allocateSlot(hometile); }	// If we aren't already home see if we can find a slot to teleport to
		
		if( slot ) this.teleport(slot); // if there is a free home slot teleport there
		else	// else die
		{
			effects.renderEffect('explosion', this.ux, this.uy)	// render an explosion or teleport effect
			this.state = 'dead';
			units.redraw();
		}
	},
});


TranslateClass = Class.extend({
	unit: {},
	start: {x:0,y:0},	// starting position of translation
	end: {x:0,y:0},
	length: 10,	// number of frames to run the animation
	count: 0,	// Frame counter
	
	init: function (unit, end) {
		this.unit = unit;
		this.start.x = unit.ux;
		this.start.y = unit.uy;
		this.end = end;
		this.unit.deactivate();
	},
	
	interpolate: function (fraction) {
		// Simple linear interpolation a "fraction" of the distance between two points
		var x = this.start.x + (this.end.x - this.start.x) * fraction;
		var y = this.start.y + (this.end.y - this.start.y) * fraction;
		return { x: x, y: y};
	},
	
	animFrame: function () {
		// Calculate new unit position and update
		this.count++;
		var fraction = this.count/this.length		// calculate how far through the animation we are
		var newloc = this.interpolate(fraction);
		this.unit.ux = newloc.x;
		this.unit.uy = newloc.y;
		if(this.count == this.length) // end translation
		{
			this.unit.remainingmoves--; // TODO this isn't were we should do this.
			this.unit.redraw();
			if(this.unit.remainingmoves > 0) this.unit.activate(); // deactivate unit if moves are up
			return 'done';
		}
	}
});