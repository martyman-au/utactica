UnitsClass = Class.extend({
	// Class that contains all of the units in the game
	units: new Array(),
	activeUnit: null,
	
	init: function () {
		this.allocateUnits();
	},
	
	allocateUnits: function () {
		this.units.push( new UnitClass(0, 'soldier', 'blue', 4) );
		this.units.push( new UnitClass(1, 'worker', 'blue', 17) );
		this.units.push( new UnitClass(2, 'worker', 'blue', 12) );
		this.units.push( new UnitClass(3, 'worker', 'red', 10) );
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
		if(this.activeUnit) this.units[this.activeUnit].deactivate(); // deactive active unit
		this.activeUnit = null;
		for( i in this.units )
		{
			unit = this.units[i];
			if( unit.clickHit(x,y))
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
	}

});


UnitClass = Class.extend({
	// Class that defines an individual unit
	unitid: null,
	type: '',
	side: '',
	state: 'normal',
	tileid: null,
	ux: null,
	uy: null,
	maxmoves: 1,
	slotoffsetx: 0,
	slotoffsety: 0,
	spritewidth: 50,
	spriteheight: 50,
	activeAnim: {},
	
	init: function (unitid, type, side, tile) {
		this.unitid = unitid;
		this.type = type;
		this.side = side;
		this.tileid = tile;
	},
	
	toggle: function () {
		// toggle unit to being active state
		if(this.state == 'normal')
		{
			this.state = 'active';
		}
		else if(this.state == 'active')
		{
			this.state = 'normal';
		}
	},

	activate: function () {
		this.state = 'active';
		this.redraw();
		effects.renderEffect('active', this.ux, this.uy);
	},
	
	deactivate: function () {
		this.state = 'normal';
		this.redraw();
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
		var newtile = board.checkmove(tgt); // check if the deired move corresponds to a tile
		if( newtile != null ) 
		{
//			board.tiles[this.tileid].remUnit(this.unitid); // Clear slot on board
			this.tileid = newtile; 	// Set unit to new tile location
			this.findSlot();		// Find which slot on the tile is available
			this.redraw();			// Wipe and redraw in new location
			effects.deleteAnimation('active');
			effects.renderEffect('active', this.ux, this.uy);
		}
	},

	wipe: function (dir) {
		cv.Unitslayer.clearRect(this.ux-(this.spritewidth/2), this.uy-(this.spriteheight/2), this.spritewidth+2, this.spriteheight+2);
	},
	
	render: function () {
		var spriteimg = this.side+'-'+this.type+'.png';
		drawSprite(spriteimg, cv.Unitslayer, this.ux, this.uy)
	},
	
	calcPos: function () {

		this.slotoffsetx = 0; // reset to centered on the tile
		this.slotoffsety = 0;

		var slots = board.tiles[this.tileid].slots;
		var i = null;
		
		for( i in slots){
			if(slots[i].unit == this.unitid)
			{
				this.slotoffsetx = Math.max( -50, Math.min(50, slots[i].xoffset*(this.spritewidth*0.75)));
				this.slotoffsety = Math.max( -50, Math.min(50, slots[i].yoffset*(this.spritewidth*0.75)));
			}
		}
		this.ux = board.tiles[this.tileid].center.x + cv.Offset.x + this.slotoffsetx;
		this.uy = board.tiles[this.tileid].center.y + cv.Offset.y + this.slotoffsety;
	},
	
	findSlot: function () {
		var slots = board.tiles[this.tileid].slots;
		var i = null;
		for( i in slots){		
			if( slots[i].unit == null )
			{
				slots[i].unit = this.unitid;
				return;
			}
		}
	},
	
	clickHit: function (x,y) {
		var sx = this.spritewidth/2;
		var sy = this.spriteheight/2;
		
		if (( x > ( this.ux - sx )) && ( x < this.ux + sx ) && ( y > (this.uy - sy ) ) && ( y < this.uy + sy ) ) return true;
		else return false;
	},
	
	explode: function () {
		effects.deleteAnimation('active');
		units.activeUnit = null;
		effects.renderEffect('explosion', this.ux, this.uy)
		this.wipe();
		return 'delete';
	},
	
	teleport: function () {
		effects.deleteAnimation('active');
		units.activeUnit = null;
		effects.renderEffect('teleport', this.ux, this.uy)
		this.wipe();
		return 'delete';
	}
});