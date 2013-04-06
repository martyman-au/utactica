UnitsClass = Class.extend({
	// Class that contains all of the units in the game
	units: new Array(),				// Array of game units
	activeUnit: null,				// The currently active unit
	translations: [],				// Any currently running unit translation (movement animation)
	down: false, 					// Keep track if the mouse button is currently down
	dragoffset: {x:null, y:null},	// The offset from the center of the current unit to the click location
	
	init: function () {
		this.allocateUnits();
	},
	
	allocateUnits: function () {
		// give out the starting units
		this.units.push( new SoldierUnitClass(0, config.homeTile[0]) );
		this.units.push( new SoldierUnitClass(0, config.homeTile[0]) );
		this.units.push( new WorkerUnitClass(0, config.homeTile[0]) );
		this.units.push( new WorkerUnitClass(0, config.homeTile[0]) );
		this.units.push( new SoldierUnitClass(1, config.homeTile[1]) );
		this.units.push( new SoldierUnitClass(1, config.homeTile[1]) );
		this.units.push( new WorkerUnitClass(1, config.homeTile[1]) );
		this.units.push( new WorkerUnitClass(1, config.homeTile[1]) );
	},
	
	animFrame: function () {
		// called every animation frame
		for( i in this.translations ) {
			if( this.translations[i].animFrame() == 'done') delete this.translations[i];
		}
		this.redraw();
	},
	
	redraw: function () {
		// Redraw all the units at their current location
		this.destroy(); // delete dead units
		this.wipe();	// clear the board
		this.render();	// redraw existing units
	},
	
	render: function () {
		// Render all of the units on the board
		for( i in this.units ) this.units[i].render();	// render every unit
		
		if(this.activeUnit) {
			this.activeUnit.render(); 					// render active unit again so that it does not end up behind other units
		}
	},

	wipe: function () {
		// wipe the units layer
		cv.layers['units'].context.clearRect(0, 0, cv.layers['units'].canvas.width / cv.scale, cv.layers['units'].canvas.height / cv.scale); // clear all of units layer
	},
	
	scale: function () {
		// Calculate position of units after a window rescale
		for( i in this.units ) this.units[i].calcPos();
	},
	
	mouse: function (event, x, y) {
		// Deal with a mouse event
		var i = null;
		var unit = null;
		if(event === 'mousedown') { // If the event is a down click
			if( this.activeUnit ) {
				this.activeUnit.deactivate();
				this.activeUnit = null;
			}
			this.down = true;
			this.drag = false;
			for( i in this.units ) {
				unit = this.units[i];
				if( unit.clickHit(x,y) && unit.side == game.turn && unit.remainingmoves > 0) {
					this.activeUnit = this.units[i];
					this.activeUnit.origpos = {x:this.activeUnit.ux, y:this.activeUnit.uy};
					this.dragoffset.x = this.activeUnit.ux - x;
					this.dragoffset.y = this.activeUnit.uy - y;
				}
			}
		}
		else if( event === 'mousemove') { // If the event is a mouse move
			if(this.activeUnit && this.down) {
				var offset = {x:0, y:0};
				offset.x = (x  + this.dragoffset.x - this.activeUnit.origpos.x) * (x  + this.dragoffset.x - this.activeUnit.origpos.x);
				offset.y = (y  + this.dragoffset.y - this.activeUnit.origpos.y) * (y  + this.dragoffset.y - this.activeUnit.origpos.y);
				var distance = Math.sqrt(offset.x + offset.y);
				if( distance > 3 ) {
					this.drag = true;
					this.activeUnit.ux = x + this.dragoffset.x;
					this.activeUnit.uy = y + this.dragoffset.y;
					var newtile = board.clickhit(x,y);
					board.moveHighlight(this.activeUnit.tileid,newtile,this.activeUnit.remainingmoves); // grey out unreachable tiles
				}
			}
		}
		else if( event === 'mouseup') {  // If the event is an up click
			if( this.activeUnit) {
				if( this.drag ) { // If we have dragged somewhere we are either moving or attacking
					this.activeUnit.dragmove(x,y);
				}
				else if(this.activeUnit.remainingmoves > 0) this.activeUnit.activate();
			}
			this.down = false;
			board.unHighlight();
		}
	},

	teleport: function () {
		// teleport the active unit
		if( this.activeUnit == null || this.activeUnit.remainingmoves < 1 ) {
			sound.playSound('doh');
			effects.renderText('NO UNIT SELECTED',{center:true});
		}
		else if( this.activeUnit.tileid == config.homeTile[game.turn] ) {
			sound.playSound('doh');
			effects.renderText('YOU ARE ALREADY AT YOUR HOME BASE',{center:true});
		}
		else this.activeUnit.teleport();
	},
	
	getEnemies: function (tile) {
		// get array of enemies located on a tile
		var enemies = { units: [], soldier: 0, worker: 0, bestunit: {}};
		var besthp = 0;
		var bestunit = {};
		var unit;
		for( i in units.units ) // count how many soldiers exist on a tile
		{
			if( units.units[i].tileid == tile && units.units[i].side != game.turn )
			{
				unit = units.units[i];
				if( unit.hp > besthp ) {
					besthp = unit.hp;
					bestunit = unit;
				}
				enemies.units.push( unit ); 
				enemies[unit.type]++; // if the tile has soldiers
			}
		}
		enemies.bestunit = bestunit;
		return enemies;
	},
	
	deactivate: function () {
		// simply call deactivate() if there is an active unit, avoid having to check if there is an active unit
		if(this.activeUnit) this.activeUnit.deactivate(); // deactive active unit
	},

	destroy: function () {
		// delete any "dead" units
		for( i in this.units ) {
			if(units.units[i].state == 'dead' ) {
				if(units.units[i] == this.activeUnit) this.activeUnit = null;
				delete units.units[i];
			}
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
	origpos: {x:null, y:null},
	maxmoves: 1,
	remainingmoves: 1,
	slotoffsetx: 0,
	slotoffsety: 0,
	spritewidth: null,
	spriteheight: null,
	hp: 0,							// Hit points for damage tracking
	type: '',
	
	init: function (side, tile) {
		this.side = Number(side);
		if(this.side) this.colour = 'blue'; // Side 1 has blue units
		else this.colour = 'red';			// Side 0 has red units
		this.tileid = tile;
		this.slotid = board.allocateSlot(this.tileid);		// Find which slot on the tile is available
		var stats = sprites.getStats(this.colour+'-'+this.type+'.png');
		this.spriteheight = stats.h;
		this.spritewidth = stats.w;
		this.hp = config.Unithp[this.type];
	},

	activate: function () {
//		units.activeUnit = this;	// TODO need to set units.activeUnit to this unit's ID...
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
	
	regen: function () {
		this.hp = config.Unithp[this.type];
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
				if( newslot ) { 
					board.tiles[this.tileid].clearSlot(this.slotid); 	// release old slot
					this.actualMove(newtile,newslot);					// animate the actual move
				}	
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
	
	dragmove: function (x,y) {
		var newtile = board.clickhit(x,y);
		if(newtile == this.tileid) { // If we haven't moved out of our original tile
			this.actualMove(this.tileid,this.slotid); // Move back where we came from
		}
		else if(newtile && board.tiles[newtile].state !== 2 ) { // If this isn't a greyed tile them make a move
			// TODO: check if it is an attack
			var enemies = units.getEnemies(newtile);	// Check for enemies on the target tile
			if(enemies.units.length > 0) { 				// if there was at least one enemy on the target tile
				if( this.canAttack ) {
					this.redraw();
					this.attack(newtile, enemies);	// If this unit is a soldier then attack
				}
			}
			else {
				var newslot = board.allocateSlot(newtile);			// Allocate a slot on the target tile
				if( newslot ) { // animate the actual move
					this.remainingmoves -= board.tileDistance(this.tileid,newtile);		// Decrement remaining moves count
					board.tiles[this.tileid].clearSlot(this.slotid); // Clear old slot on board	
					this.actualMove(newtile,newslot);			// Move the unit to the new tile and slot
				}
				else {
					this.actualMove(this.tileid,this.slotid);	// Move back to where we came from
					effects.renderText('THERE IS NO ROOM FOR THAT',{center:true});
					sound.playSound('doh');
				}
			}
		}
		else {
			this.actualMove(this.tileid,this.slotid);		// Move back to where we came from
			effects.renderText('YOU CAN\'T MOVE THERE',{center:true});
			sound.playSound('doh');		}
	},
		
	actualMove: function (newtile,newslot) {
		var newloc = {};
		var slots = board.tiles[newtile].slots;
		var slotoffsetx = slots[newslot].xoffset*(this.spritewidth*0.55);		// calculate the position for this slot
		var slotoffsety = slots[newslot].yoffset*(this.spritewidth*0.55)-10; 	// calculate the position for this slot
		newloc.x = board.tiles[newtile].center.x + cv.Offset.x + slotoffsetx;
		newloc.y = board.tiles[newtile].center.y + cv.Offset.y + slotoffsety;
		units.translations.push( new TranslateClass(this, newloc));
//		board.tiles[this.tileid].clearSlot(this.slotid); // Clear old slot on board	
		this.tileid = newtile; 	// Set unit to new tile location
		this.slotid = newslot;	// set unit to new tile slot
	},
	
	wipe: function () {
		// wipe the units canvas to clear this unit off the board
		cv.layers['units'].context.clearRect(this.ux-(this.spritewidth/2), this.uy-(this.spriteheight/2), this.spritewidth+2, this.spriteheight+2);
	},
	
	render: function () {
		// render this unit to the units canvas
		var ctx = cv.layers['units'].context;
		var spriteimg = this.colour+'-'+this.type;
		var healthcolor = null; 
		
		if(this.remainingmoves == 0 || this.side != game.turn) spriteimg = spriteimg+'-grey';
		spriteimg = spriteimg+'.png';

		drawSprite(spriteimg, ctx, this.ux, this.uy)
		
		if(this.type == 'soldier') { // Only soldiers get a health bar
			//Set the colour of teh health bar
			if(this.hp >= 35) { healthcolor = config.styles.healthbargood; }
			else {
				if(this.hp >= 15) { healthcolor = config.styles.healthbarmid; }
				else { healthcolor = config.styles.healthbarbad; }
			}
			
			ctx.fillStyle = healthcolor; 
			
			//ctx.font = "normal 700 20px 'Roboto Condensed'";
			//ctx.fillText(this.hp, this.ux-10, this.uy); //TODO: remove debug code
			
			ctx.shadowColor = '#ffffff';
			shadowOffsetX = 0;
			ctx.shadowOffsetY = 0;
			ctx.shadowBlur = 6;
			
			var xoffset = -25;
			var yoffset = 38;
			ctx.fillRect(this.ux + xoffset, this.uy + yoffset, Math.max(0,this.hp), 4);
			ctx.shadowColor = "transparent";
		}
	},
	
	calcPos: function () {
		// calculate the x,y position of the unit from the tile and slot
		var slots = board.tiles[this.tileid].slots;
		this.slotoffsetx = slots[this.slotid].xoffset*(this.spritewidth*0.55);		// calculate the position for this slot
		this.slotoffsety = slots[this.slotid].yoffset*(this.spriteheight*0.6);	// calculate the position for this slot
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
		if(slot == undefined )	var slot = board.allocateSlot(hometile);	// find a free slot at the home tile if one not provided
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
		game.battle = new BattleClass(this, tile);
	},

	lose: function () {
		// Deal with a unit losing a battle
		this.deactivate();									// Deactivate the unit in case it is the active unit
		effects.renderEffect('explosion', this.ux, this.uy)	// render an explosion
		board.tiles[this.tileid].clearSlot(this.slotid); 	// Clear slot on board	
		this.state = 'dead';								// Set state to dead so that it is deleted
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
			this.unit.redraw();
			if(this.unit.remainingmoves > 0) this.unit.activate(); // deactivate unit if moves are up
			return 'done';
		}
	}
});

BattleClass = Class.extend({
	attacker: {},
	defender: {},
	target: {},
	start: null,
	done: false,
	totaltime: 2500,
	progress: 0,
	enemies: {},
	attackerstarthp: null,
	defenderstarthp: null,
	defenderdamage: 0,
	attackerdamage: 0,
	results: null,
	
	init: function (unit, target) {
		game.setControlLock(true);	// Lock control input TODO: Need to make this more formalized and robust
		this.start = Date.now();
		this.attacker = unit;
		this.target = Number(target);
		this.enemies = units.getEnemies(target);
		this.defender = this.enemies.bestunit;
		
		this.attackerstarthp = this.attacker.hp;
		this.defenderstarthp = this.defender.hp;
		
		// BATTLE CALCULATIONS
		// Attack damage is a rnd(0-100) + attacker's attack upgrades - defender's defence upgrades
		// Retaliation damage is a rnd(0-100) + defender's attack upgrades - attacker's attack upgrades
		var attackscore = Math.floor((Math.random()*100)+1) + game.attack[game.turn] - game.defence[(1-game.turn)];
		if( this.defender.type == 'soldier' ) {	// Only soldiers can retaliate
			var defendscore = Math.floor((Math.random()*100)+1) + game.attack[(1-game.turn)] - game.defence[game.turn];
		}
		else defendscore = 0; // workers are unable to retaliate
		
//		console.log('attack score = '+attackscore); // DEBUG CODE
//		console.log('defend score = '+defendscore); // DEBUG CODE
		
		// Apply a multiple defender bonus of 10% per extra soldier
		var multidefenderbonus = 0;
		if(this.enemies.soldier > 1) { multidefenderbonus = (this.enemies.soldier - 1) * 10; } 
		defendscore += multidefenderbonus; // increase the defend score by the multiple unit bonus
		attackscore -= multidefenderbonus; // decrease the attack score by the multiple unit bonus
		
		// Apply a home base defence bonus of 10%
		var homebasebonus = 0;
		if(this.target == config.homeTile[this.defender.side]) { homebasebonus = 10; } 	
		defendscore += homebasebonus; // increase the defend score by the home base bonus
		attackscore -= homebasebonus; // decrease the attack score by the home base bonus	
		
		var maxdefenderdamage = Math.max( 0, attackscore);  // Don't allow negative damage!
		var maxattackerdamage = Math.max( 0, defendscore);	// Don't allow negative damage!

//		console.log('max attacker damage = '+maxattackerdamage); // DEBUG CODE
//		console.log('max defender damage = '+maxdefenderdamage); // DEBUG CODE
		
		// deal out damage in discrete chunks and stop when the first unit dies, fewer chunks leads to more coincidental mutual destruction
		for( var i = 1; i <= 10; i++ ) {
			this.defenderdamage += maxdefenderdamage/10;
			this.attackerdamage += maxattackerdamage/10;
			if( this.defenderdamage >= this.defenderstarthp || this.attackerdamage >= this.attackerstarthp)	break;
		}
		sound.playSound('battle');	// Play the battle sound effect
	},
	
	animFrame: function () {
		this.progress = ( Date.now() - this.start ) / this.totaltime;
		if(this.progress < 0.75) { 						// shooting phase first 75% of battle time (make noises, decrease unit's hp)
			var battleprogress = this.progress / 0.75;	// calculate progress through the shooting phase
			if( Math.random() < 0.08 ) this.attacker.hp = this.attackerstarthp - this.attackerdamage * battleprogress; // randomly apply damage to the units
			if( Math.random() < 0.08 ) this.defender.hp = this.defenderstarthp - this.defenderdamage * battleprogress; // randomly apply damage to the units
		}
		else {
			if( this.progress > 0.75 && !this.results ) { // Results stage (blow up units)
				this.attacker.hp = this.attackerstarthp - this.attackerdamage;	// Reduce units to their final hp level
				this.defender.hp = this.defenderstarthp - this.defenderdamage;	// Reduce units to their final hp level
				if( this.attacker.hp < 1 ) {
					this.attacker.lose();	// destroy losing attacker
					this.attacker = null;	// remove local reference
				}
				if( this.defender.hp < 1 ) { 
					this.defender.lose();	// destroy losing defender
					this.defender = null;	// remove local reference
				}
				units.destroy();
				this.enemies = units.getEnemies(this.target);
				
				if(this.enemies.soldier < 1 && this.attacker) {
					for(i in this.enemies.units) {
						this.enemies.units[i].lose();
					}
					board.tiles[this.attacker.tileid].clearSlot(this.attacker.slotid); // Clear old slot on board	
					this.attacker.actualMove(this.target,board.allocateSlot(this.target)); // move the unit to it's new location
				}
				
				
				this.results = true; 					// Mark results stage done
			}
			else {
				if( this.progress >= 1) {				// End of the battle
					game.setControlLock(false);			// release the control lock
					if(this.attacker) { 
						this.attacker.remainingmoves--; 		// decrement remaining moves of the attacker if it wasn't destroyed
						this.attacker.deactivate();
					}
					this.done = true;					// mark the battle done (will be deleted)
				}
			}
		}
	}

});