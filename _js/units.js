UnitsClass = Class.extend({
	// Class that contains all of the units in the game
	units: new Array(),
	activeUnit: null,
	
	init: function () {
		this.allocateUnits();
	},
	
	allocateUnits: function () {
		this.units.push( new UnitClass('soldier', 0, config.homeTile[0]) );
		this.units.push( new UnitClass('soldier', 0, config.homeTile[0]) );
		this.units.push( new UnitClass('worker', 0, config.homeTile[0]) );
		this.units.push( new UnitClass('worker', 0, config.homeTile[0]) );
		this.units.push( new UnitClass('soldier', 1, config.homeTile[1]) );
		this.units.push( new UnitClass('soldier', 1, config.homeTile[1]) );
		this.units.push( new UnitClass('worker', 1, config.homeTile[1]) );
		this.units.push( new UnitClass('worker', 1, config.homeTile[1]) );
		this.units.push( new UnitClass('worker', 1, 1) );
		this.units.push( new UnitClass('soldier', 1, 1) );
	},
	
	redraw: function () {
		this.destroy();
		this.wipe();
		this.render();
	},
	
	render: function () {
		// Render all of the units on the board
		for( i in this.units ) this.units[i].render(); // render every unit
	},

	wipe: function () {
		// wipe the units layer
		cv.layers['units'].context.clearRect(0, 0, cv.layers['units'].canvas.width / cv.Scale, cv.layers['units'].canvas.height / cv.Scale); // clear all of units layer
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
		// move a unit
//		console.log(keycode);
		if( this.activeUnit == null ) return;
		else this.units[this.activeUnit].move(keycode);
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
	}
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

	activate: function () {
		this.state = 'active';
		this.redraw();
		effects.renderEffect('active', this.ux, this.uy);
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
		var newtile = board.checkmove(tgt); // find the ID of the deired tile
		
		if( newtile ) // if the desired tile exists check if this is a move or attack
		{
			var enemies =  units.getEnemies(newtile);

//			for( i in units.units ) // count how many enemies exist in the target tile
//			{
//				if( units.units[i].tileid == newtile && units.units[i].side != this.side ) enemies.push( i ); // if the new tile has enemies on it collect them
//			}
			if(enemies.units.length > 0) // if there was at least one enemy on the target tile
			{
				if( this.type == 'soldier' ) this.attack(newtile, enemies);	// If this unit is a soldier then attack
				else sound.playSound(sound['doh']);					// If this unit is worker don't move
			}
			else	// There was no enemies lets see if we can move there
			{
				console.log('no enemies, try move');
				var newslot = this.findSlot(newtile);		// Find which slot on the tile is available
				if( newslot )
				{
					board.tiles[this.tileid].clearSlot(this.slotid); // Clear slot on board	
					this.tileid = newtile; 	// Set unit to new tile location
					this.slotid = newslot;	// set unit to new tile slot
					this.redraw();			// Wipe and redraw in new location
					effects.deleteAnimation('active');
					effects.renderEffect('active', this.ux, this.uy);
					if( --this.remainingmoves < 1) this.deactivate();
				}
				else sound.playSound(sound['doh']);
			}
		}
		else sound.playSound(sound['doh']);
	},
	
	attack: function (tile, enemies) {
		this.remainingmoves--;
		var attack = Math.floor((Math.random()*100)+1); // roll for attackers
		var defend = Math.floor((Math.random()*100)+1); // roll for defenders
		if( enemies.soldier == 0 ) defend = -1000; // Workers get no defence
		var result = attack - defend + game.attack[game.turn] - game.defence[game.turn];
		console.log('attack result: '+result);
		if( result >= -15 && result <= 15 )
		{
			console.log('DRAW');
		}
		else if( result < -15 ) this.lose();
		else if( result > 15 )
		{
			// must mark one dead
			for( i in enemies.units ) units.units[enemies.units[i]].lose(); // TODO: make only one unit die and deal with remaining workers
			
			enemies = units.getEnemies(tile); // count the new number of enemies
			if( enemies.units.length == 0 )
			{
				this.tileid = tile;
				this.slotid = this.findSlot(tile);
				this.deactivate();
				this.redraw();
			}
		}
		
	},

	wipe: function (dir) {
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
		this.deactivate();
		board.tiles[this.tileid].clearSlot(this.slotid); // Clear slot on board	
		this.wipe(); 		// wide the unit from the units cavas
		if( this.loseeffect == 'teleport')			// If it is a worker we will try to teleport home
		{
			var tile = config.homeTile[this.side];	// target for teleport
			var slot = this.findSlot(tile);			// find slot at target
			if( slot )
			{
				this.teleport();
			}
			else
			{
				effects.renderEffect('explosion', this.ux, this.uy)	// render an explosion or teleport effect
				this.state = 'dead';
				units.redraw();
			}
		}
		else
		{
			effects.renderEffect(this.loseeffect, this.ux, this.uy)	// render an explosion or teleport effect
			this.state = 'dead';
			units.redraw();
		}
	},
	
	teleport: function () {
		var tile = config.homeTile[this.side];	// target for teleport
		var slot = this.findSlot(tile);			// find slot at target
		if( slot )
		{
			board.tiles[this.tileid].clearSlot(this.slotid); // Clear slot on board	
			this.deactivate();
			effects.renderEffect('teleport', this.ux, this.uy)	// render an explosion or teleport effect
			var start = { x: this.ux, y: this.uy };
			this.tileid = tile;
			this.slotid = slot;
			this.redraw();
			effects.renderEffect('teleport', this.ux, this.uy)	// render an explosion or teleport effect
			var end = { x: this.ux, y: this.uy };
			effects.renderVector('beam',start,end);
		}
		else
		{
			sound.playSound(sound['doh']);
		}
	},
});