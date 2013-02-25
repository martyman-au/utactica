UnitsClass = Class.extend({
	
	units: new Array(),
	activeUnit: null,
	
	init: function () {
		this.units[0] = new UnitClass(0, 'soldier', 'blue', 4);
		this.units[1] = new UnitClass(1, 'worker', 'blue', 17);
		this.units[2] = new UnitClass(2, 'worker', 'blue', 12);
		this.units[3] = new UnitClass(3, 'worker', 'red', 10);
	},
	
	render: function () {
		cv.Unitslayer.clearRect(0, 0, cv.cnvUnits.width / cv.Scale, cv.cnvUnits.height / cv.Scale);
		for( i in this.units )
		{
			this.units[i].render();
		}
//		console.log('full units render');
	},
	
	scale: function () {
		for( i in this.units )
		{
			this.units[i].calcPos();	
		}
	},
	
	click: function (x,y) {
		// Deal with a click by checking if it hits any units
		var i = null;
		var unit = null;
		this.activeUnit = null;
		for( i in this.units )
		{
//			console.log(this.units);
			unit = this.units[i];
			unit.dactivate();
//			console.log(unit);

			if( unit.clickHit(x,y))
			{
				unit.activate();
				this.activeUnit = i;
			}
//			else console.log('miss: '+x+' <> '+this.units[i].ux+' and '+y+' <> '+this.units[i].uy);
		}
	},
	
	move: function (keycode) {
		if( this.activeUnit == null ) return;
		else this.units[this.activeUnit].move(keycode);
	}

});


UnitClass = Class.extend({
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



	
	init: function (unitid, type, side, tile) {
		this.unitid = unitid;
		this.type = type;
		this.side = side;
		this.tileid = tile;
	},
	
	toggle: function () {
//		console.log('hit');
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
	},
	
	dactivate: function () {
		this.state = 'normal';
		this.redraw();
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
			board.tiles[this.tileid].remUnit(this.unitid);
			this.tileid = newtile; 	// Set unit to new tile location
			this.findSlot();		// Find which slot on the tile is available
			this.redraw();			// Wipe and redraw in new location
		}
	},

	wipe: function (dir) {
		cv.Unitslayer.clearRect(this.ux-(this.spritewidth/2), this.uy-(this.spriteheight/2), this.spritewidth+2, this.spriteheight+2);
	},
	
	render: function () {
		var spriteimg = {};
		if( this.side == 'blue' )
		{
			if( this.type == 'worker' && this.state == 'active' ) spriteimg = 'blue-worker.png';
			else if( this.type == 'worker' && this.state == 'normal' ) spriteimg = 'blue-worker-grey.png';
			else if( this.type == 'soldier' && this.state == 'active' ) spriteimg = 'blue-soldier.png';
			else if( this.type == 'soldier' && this.state == 'normal' ) spriteimg = 'blue-soldier-grey.png';
		}
		else
		{
			if( this.type == 'worker' && this.state == 'active' ) spriteimg = 'red-worker.png';
			else if( this.type == 'worker' && this.state == 'normal' ) spriteimg = 'red-worker-grey.png';
			else if( this.type == 'soldier' && this.state == 'active' ) spriteimg = 'red-soldier.png';
			else if( this.type == 'soldier' && this.state == 'normal' ) spriteimg = 'red-soldier-grey.png';
		}
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
		if (( x > ( this.ux - this.spritewidth/2 )) && ( x < this.ux + this.spritewidth/2 ) && ( y > (this.uy - this.spriteheight/2 ) ) && ( y < this.uy + this.spriteheight/2 ) )
		{
			return true;
		}
		else return false;
	},
	
	explode: function () {
		effects.runExplosion(this.ux, this.uy);
//		effects.runTeleport(this.ux, this.uy);
		this.wipe();
		delete units.units[this.unitid];
	}
});