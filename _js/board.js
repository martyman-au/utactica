BoardClass = Class.extend({
	
	tiles: new Array(),	// Array to store board tile objects
	ctx: null,			// Reference to the board 2D canvas context
	tilestates: null,	// Stores an indication of the last tile state so that we don't have to redraw the board unless it changes
	stats: {},		// Stores the stats of the standard board tile

	init: function (pattern) {
		// Supply the board pattern for the hextiles
		// an array of arrays for each row of the board
		// fills this.tiles with tile objects
		this.stats = sprites.getStats('hextile.png'); // TODO: tile name hard coded
		this.ctx = cv.layers['board'].context; // TODO: Hardcoded?
		var grididx = {};
		var position = {};
		var index = 0;
		for( i in pattern ) { 				// for each row on the board
			var row = pattern[i];			// grab that row
			for( j in row )					// for each tile in the row
			{
				grididx.x = row[j];			// calculate a grid index for the tile
				grididx.y = Number(i);		//
				position.x = (row[j]*this.stats.w*0.75);	// calculate the x position of the tile (top left)
				position.y = (i*this.stats.h*0.495);		// calculate the y position of the tile (top left)
				this.tiles[index] = new TileClass( this.ctx, index, grididx, position, this.stats); // create and save new tile object
				index++;
			}	
		}
		this.distributeResources();			// seed resources across the completed board
	},
	
	distributeResources: function () {
		// Seed tiles with randomly chosen resources
		fisherYates ( config.resources ); 	// shuffle resources array (includes "resources" and "no resources" to be dealt out across the board
		for( i in config.resources )		// for each resource
		{
			if (config.resources.hasOwnProperty(i))
			{
				this.tiles[config.resourcedTiles[i]].resource = config.resources[i];	// save resource to tile object
			}
		}
	},
	
	render: function () {
		//Render the board tiles to the board canvas
		for( i in this.tiles ) {
			this.tiles[i].render();
		}
	},

	redraw: function () {
		// Wipe the whole UI layer and render all UI elements
		this.wipe();
		this.render();
	},
	
	wipe: function (dir) {
		// Clear the UI layer
		this.ctx.clearRect(0, 0, window.innerWidth / cv.scale, window.innerHeight / cv.scale);
	},
	
	animFrame: function () {
		// Update called by requestAnimationFrame
		// TODO: Can we update soemthing when changing states so that we don't have to lookup the tile states every frame?
		if( this.tilestates !== this.tilesGetStates() ) { // Only redraw board if a tile has changed state
			this.tilestates = this.tilesGetStates();
			this.redraw();
		}
	},
	
	tilesGetStates: function () {
		var states = '';
		for( i in this.tiles ) {
			states += this.tiles[i].state;
		}
		return states;
	},
	
	clickhit: function (x,y) {
		// check which tile an x,y position cosresonds to
		var xoff = null;
		var yoff = null;
		var besttile = null;
		var bestdist = 100000; // TODO: This is not nice
		for( i in this.tiles )
		{
			xoff = Math.abs((this.tiles[i].center.x + cv.Offset.x) - x);
			yoff = Math.abs((this.tiles[i].center.y + cv.Offset.y) - y);
			if((xoff + yoff) < bestdist) {
				besttile = i;
				bestdist = xoff + yoff;
			}
		}
		if( bestdist < 130 ) return besttile;  // TODO: can we do better than this?
		return null;
	},
	
	checkmove: function (tgt) {
		// given a target {x,y} board index, run through the tiles and check if one exists at that location
		for( i in this.tiles )
		{
			if( (this.tiles[i].grididx.x == tgt.x) && (this.tiles[i].grididx.y == tgt.y))
			{
				return i; // return the tilenumber of the tile at that requested grid reference
			}
		}
		return null;	// else return null
	},

	allocateSlot: function (tile) {
		// Find an available slot on a tile for the unit
		var slots = this.tiles[tile].slots;
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
	
	moveHighlight: function (tile1,tile2,max) {
		// Given a starting tile, currently hoveredover tile and maximum move distance grey out unreachable tiles, highlight current tile
		// This is then used by game logic to allow/disallow moves
		var enemies;
		for( j in this.tiles) {
			var distance = this.tileDistance(tile1,this.tiles[j].tilenum);
			if( distance > max ) this.tiles[j].state = 2;
			else this.tiles[j].state = 0;
			if(!units.activeUnit.canAttack) { // If the current unit is not able to attack
				enemies = units.getEnemies(j);
				if(enemies.units.length > 0) { this.tiles[j].state = 2;	} // Grey out any tile with enemies
			}
		}
		if(tile2 !== null) { // If the dragged piece is over a valid tile we want to highlight it
			if( this.tiles[tile2].state == 0 ) this.tiles[tile2].state = 1; // If we haven't greyed out the moused over tile then highlight it
		}
	},
	
	unHighlight: function () {
		// After moveHighlighting above return all tiles to their standard state
		for( i in this.tiles) {
			this.tiles[i].state = 0;
		}
	},
	
	tileDistance: function (tile1,tile2) {
		// Given two tile idxs calculate the distance between them
		return config.distances[Math.abs(this.tiles[tile1].grididx.y - this.tiles[tile2].grididx.y)][Math.abs(this.tiles[tile1].grididx.x - this.tiles[tile2].grididx.x)];
	}
});

TileClass = Class.extend({
	tilenum: null,					// ID of the tile number top down left to right
	ctx: null,
	grididx: {x: null, y: null},	// grid index of the tile
	position: {x: null, y: null},	// position of the top left corner of the tile (in scaled pixels)
	center: {x: null, y: null},		// position of the center of the tile (in scaled pixels)
	resource: '',					// resource location on the tile
	state: 0,						// 0 = std, 1 = actived, 3 = grey
	stats: {},
	slots: {						// slots that can hold units on a tile TODO: seems messy
		slot0: { unit: false,
				xoffset: -1,
				yoffset: -1},
		slot1: { unit: false,
				xoffset: 1,
				yoffset: -1},
		slot2: { unit: false,
				xoffset: -1,
				yoffset: 1},
		slot3: { unit: false,
				xoffset: 1,
				yoffset: 1}
		},
				
	init: function (ctx, tilenum, grididx, position, stats) {
		// Initialise a tile object with a tilenumber, grid index, x and y pixel position
		this.ctx = ctx;
		this.tilenum = tilenum;
		this.grididx.x = grididx.x;
		this.grididx.y = grididx.y;
		this.position = copy(position);		// TODO: is this the best way to do this?
		this.stats = stats;
		this.center.x = position.x+(this.stats.w/2);
		this.center.y = position.y+(this.stats.h/2);
	},
	
	render: function () {
		// render a tile and it's resource (if exists)
		if( this.state == 0 ) {
			drawSprite('hextile.png', this.ctx, this.center.x + cv.Offset.x, this.center.y + cv.Offset.y)
		}
		else if( this.state == 1 ) {
			drawSprite('hextile-active.png', this.ctx, this.center.x + cv.Offset.x, this.center.y + cv.Offset.y)
		}
		else if( this.state == 2 ) {
			drawSprite('hextile-grey.png', this.ctx, this.center.x + cv.Offset.x, this.center.y + cv.Offset.y)
		}
		
		if(this.resource)  
		{
			var resourceimg = '';
			if(this.resource.substring(0,1) == 'f') resourceimg = 'food-resource.png';
			else resourceimg = 'science-resource.png';
			drawSprite(resourceimg, this.ctx, this.center.x + cv.Offset.x, this.center.y + cv.Offset.y);
			this.ctx.font = "normal 700 50px 'Roboto Condensed'";
			this.ctx.fillStyle = config.styles.resourcetext; 
			this.ctx.shadowOffsetX = 1;
			this.ctx.shadowOffsetY = 1;
			this.ctx.shadowBlur = 6;
			this.ctx.shadowColor = config.styles.resourcetextshadow;
			this.ctx.fillText(this.resource.substring(1), this.center.x - 28 + cv.Offset.x, this.center.y + 20 + cv.Offset.y);
			this.ctx.shadowColor = "transparent";
		}
		for( i in config.homeTile ) { // Render home base
			if( this.tilenum == config.homeTile[i] ) {
				if( i == 0 ) { drawSprite('base2.png', this.ctx, this.center.x + cv.Offset.x, this.center.y + cv.Offset.y) }
				else { drawSprite('base1.png', this.ctx, this.center.x + cv.Offset.x, this.center.y + cv.Offset.y) };
			}
		}

	},

	clearSlot: function (slot) {
		this.slots[slot].unit = false;
	},
	
	checkSlots: function () {
		for( i in this.slots ) {
			if( this.slots[i].unit == false ) return true;
		}
		return false;
	}
});