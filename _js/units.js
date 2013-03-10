UnitsClass = Class.extend({
	// Class that contains all of the units in the game
	units: new Array(),
	activeUnit: null,
	
	init: function () {
		this.allocateUnits();
	},
	
	allocateUnits: function () {
		this.units.push( new SoldierUnitClass('soldier', 0, config.homeTile[0]) );
		this.units.push( new SoldierUnitClass('soldier', 0, config.homeTile[0]) );
		this.units.push( new WorkerUnitClass('worker', 0, config.homeTile[0]) );
		this.units.push( new WorkerUnitClass('worker', 0, config.homeTile[0]) );
		this.units.push( new SoldierUnitClass('soldier', 1, config.homeTile[1]) );
		this.units.push( new SoldierUnitClass('soldier', 1, config.homeTile[1]) );
		this.units.push( new WorkerUnitClass('worker', 1, config.homeTile[1]) );
		this.units.push( new WorkerUnitClass('worker', 1, config.homeTile[1]) );
		this.units.push( new WorkerUnitClass('worker', 1, 1) );
		this.units.push( new SoldierUnitClass('soldier', 1, 1) );
	},
	
	animFrame: function () {
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
			return;
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
	}
});


UnitClass = Class.extend({
	// Class that defines an individual unit
	type: '',
	side: '',
	colour: '',
	state: 'normal',
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
		this.slotid = board.allocateSlot(this.tileid);		// Find which slot on the tile is available
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
			var enemies = units.getEnemies(newtile);

			if(enemies.units.length > 0) // if there was at least one enemy on the target tile
			{
				if( this.canAttack ) this.attack(newtile, enemies);	// If this unit is a soldier then attack
				else {
					effects.renderText('WORKERS CAN\'T ATTACK',{center:true});
					sound.playSound('doh');					// If this unit is worker don't move
				}
			}
			else	// There was no enemies lets see if we can move there
			{
//				console.log('no enemies, try move');
				var newslot = board.allocateSlot(newtile);		// Find which slot on the tile is available
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
				else {
					effects.renderText('THERE IS NO SPACE AVAILABLE',{center:true});
					sound.playSound('doh');
				}
			}
		}
		else {
			effects.renderText('YOU CAN\'T MOVE THAT DIRECTION',{center:true});
			sound.playSound('doh');
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
			this.remainingmoves--;
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
			effects.renderText('THERE IS NO SPACE AVAILABLE',{center:true});
			sound.playSound('doh');
		}
	},
});
	
SoldierUnitClass = UnitClass.extend({
	// Class for soldier units
	canDefend: true,
	canAttack: true,

	attack: function (tile, enemies) {
		game.controlLock = true;						// Lock control input TODO: Need to make this more formalized and robust
		this.remainingmoves--;
		var attack = Math.floor((Math.random()*100)+1);	// roll for attackers
		var defend = Math.floor((Math.random()*100)+1);	// roll for defenders
		if( enemies.soldier == 0 ) defend = -1000; 		// If no soldiers, workers get no defence
		var result = attack - defend + game.attack[game.turn] - game.defence[game.turn];	// Apply upgrade multipliers
		// TODO: multi unit defence bonus, home base defence bonus
		console.log('attack result: '+result);	// DEBUG: output attack result
		sound.playSound('battle');				// play attack sound effect
		if( result >= -15 && result <= 15 )	
		{
			setTimeout( function () {
				effects.renderText('UNFORTUNATELY YOUR ATTACK WAS UNSUCCESSFUL',{center:true});
				game.controlLock = false;
			}, 1500);
			this.deactivate();
			this.redraw();
		}
		else if( result < -15 ) {
			effects.renderText('YOUR UNIT WAS DESTOYED IN THE BATTLE',{center:true});
			setTimeout( function () {units.units[units.activeUnit].lose(); game.controlLock = false; }, 1500 );
		}
		else if( result > 15 )
		{
			effects.renderText('YOUR FORCES WERE VICTORIOUS',{center:true});
			// TODO: mark only one soldier dead
			setTimeout( function () {
				for( i in enemies.units ) units.units[enemies.units[i]].lose(); // TODO: make only one unit die and deal with remaining workers
				
				enemies = units.getEnemies(tile); // count the new number of enemies
				if( enemies.units.length == 0 )		// TODO: if these are only workers we need to lose() them
				{
					setTimeout( function () {	// TODO: Animate unit movement??
						var unit = units.units[units.activeUnit]
						unit.tileid = tile;
						unit.slotid = board.allocateSlot(tile);
						unit.deactivate();
						unit.redraw();
						game.controlLock = false;
					}, 400 );
				}
			}, 1500 );
		}
		
	},

	lose: function () {
		// Deal with the unit losing a battle
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