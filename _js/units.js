UnitsClass = Class.extend({
	// Class that contains all of the units in the game
	units: new Array(),
	activeUnit: null,
	
	init: function () {
		this.allocateUnits();
	},
	
	allocateUnits: function () {
		this.units.push( new UnitClass('soldier', 0, 0) );
		this.units.push( new UnitClass('soldier', 0, 0) );
		this.units.push( new UnitClass('worker', 0, 0) );
		this.units.push( new UnitClass('worker', 0, 0) );
		this.units.push( new UnitClass('soldier', 1, 40) );
		this.units.push( new UnitClass('soldier', 1, 40) );
		this.units.push( new UnitClass('worker', 1, 40) );
		this.units.push( new UnitClass('worker', 1, 40) );
	},
	
	render: function () {
		// Render all of the units on the board
		cv.Unitslayer.clearRect(0, 0, cv.cnvUnits.width / cv.Scale, cv.cnvUnits.height / cv.Scale); // clear all of units layer
		for( i in this.units ) this.units[i].render(); // render every unit
	},
	
	scale: function () {
		// Calculate position of units after rescale
		for( i in this.units ) this.units[i].calcPos();
	},
	
	click: function (x,y) {
		// Deal with a click by checking if it hits any units
		var i = null;
		var unit = null;
		this.deactivate();
		this.activeUnit = null;
		for( i in this.units )
		{
			unit = this.units[i];
			if( unit.clickHit(x,y) && unit.side == game.turn && unit.remainingmoves > 0)
				{
					unit.activate();
					this.activeUnit = i;
				}
		}
	},
	
	move: function (keycode) {
		console.log(keycode);
		if( this.activeUnit == null ) return;
		else this.units[this.activeUnit].move(keycode);
	},
	
	deactivate: function () {
		if(this.activeUnit) this.units[this.activeUnit].deactivate(); // deactive active unit
	},

});


UnitClass = Class.extend({
	// Class that defines an individual unit
	type: '',
	side: '',
	colour: '',
	state: 'normal',
	loseeffect: null,
	tileid: null,
	slotid: null,
	ux: null,
	uy: null,
	maxmoves: 1,
	remainingmoves: 1,
	slotoffsetx: 0,
	slotoffsety: 0,
	spritewidth: 50,	// TODO: hardcoded
	spriteheight: 50,	// TODO: hardcoded
	
	init: function (type, side, tile) {
		this.type = type;
		this.side = side;
		if(this.side) this.colour = 'blue'; // Side 1 has blue units
		else this.colour = 'red';			// Side 0 has red units
		this.tileid = tile;
		this.slotid = this.findSlot(this.tileid);		// Find which slot on the tile is available
		if(this.type == 'soldier') this.loseeffect = 'explosion';
		else this.loseeffect = 'teleport';
	},
/*	
	toggle: function () {  // NOT USED ANY MORE??
		// toggle unit to being active state
		if(this.state == 'normal') this.state = 'active';
		else if(this.state == 'active') this.state = 'normal';
	},
*/
	activate: function () {
		this.state = 'active';
		this.redraw();
		effects.renderEffect('active', this.ux, this.uy);
	},
	
	deactivate: function () {
		this.state = 'normal';
		this.redraw();
		units.activeUnit = null;
		effects.deleteAnimation('active');
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
		var newtile = board.checkmove(tgt); // find the ID of the deired tile
		if( newtile ) // if the desired tile exists
		{
			var newslot = this.findSlot(newtile);		// Find which slot on the tile is available
			if( newslot )
			{
				this.tileid = newtile; 	// Set unit to new tile location
				this.slotid = newslot;	// set unit to new tile slot
				this.redraw();			// Wipe and redraw in new location
				effects.deleteAnimation('active');
				effects.renderEffect('active', this.ux, this.uy);
				if( --this.remainingmoves < 1) this.deactivate();
			}
			else sound.playSound(sound['doh']);
		}
		else sound.playSound(sound['doh']);
	},

	wipe: function (dir) {
		// wipe the units canvas to clear this unit off the board
		cv.Unitslayer.clearRect(this.ux-(this.spritewidth/2), this.uy-(this.spriteheight/2), this.spritewidth+2, this.spriteheight+2);
	},
	
	render: function () {
		// render this unit to the units canvas
		var spriteimg = this.colour+'-'+this.type
		if(this.remainingmoves == 0 || this.side != game.turn) spriteimg = spriteimg+'-grey';
		spriteimg = spriteimg+'.png';
		drawSprite(spriteimg, cv.Unitslayer, this.ux, this.uy)
	},
	
	calcPos: function () {
		// calculate the x,y position of the unit from the tile and slot
		var slots = board.tiles[this.tileid].slots;
		this.slotoffsetx = Math.max( -50, Math.min(50, slots[this.slotid].xoffset*(this.spritewidth*0.75))); // TODO: Hardcoded slot offset distance
		this.slotoffsety = Math.max( -50, Math.min(50, slots[this.slotid].yoffset*(this.spritewidth*0.75)));
		this.ux = board.tiles[this.tileid].center.x + cv.Offset.x + this.slotoffsetx;
		this.uy = board.tiles[this.tileid].center.y + cv.Offset.y + this.slotoffsety;
	},
	
	findSlot: function (tile) {
		// Find an available slot on a tile for the unit
		var slots = board.tiles[tile].slots;
		var i = null;
		for( i in slots){		
			if( ! slots[i].unit )
			{
				slots[i].unit = true;
				return i;
			}
		}
		return null;
	},
	
	clickHit: function (x,y) {
		// Return true if a click (x,y) hits this unit
		var sx = this.spritewidth/2;
		var sy = this.spriteheight/2;
		if (( x > ( this.ux - sx )) && ( x < this.ux + sx ) && ( y > (this.uy - sy ) ) && ( y < this.uy + sy ) ) return true;
		else return false;
	},
	
	lose: function () {
		// Deal with the unit losing a battle
		if(this.state == 'active') // if this was the active unit deactivate it
		{
			effects.deleteAnimation('active');
			units.activeUnit = null;
		}
		effects.renderEffect(this.loseeffect, this.ux, this.uy)	// render an explosion or teleport effect
		board.tiles[this.tileid].clearSlot(this.slotid); // Clear slot on board		
		this.wipe(); 		// wide the unit from the units cavas
		return 'delete';	// return 'delete' to trigger unit deletion
	},
	
});