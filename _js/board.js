BoardClass = Class.extend({
	
	tiles: new Array(), // Array to store board tile objects

	init: function (pattern) {
		// Supply the board pattern for the hextiles
		// an array of arrays for each row of the board
		// fills this.tiles with tile objects
		var tilenum = 0;
		var grididx = {};
		var position = {};
		for( i in pattern ) { 				// for each row on the board
			var row = pattern[i];			// grab that row
			for( j in row )					// for each tile in the row
			{
				grididx.x = row[j];			// calculate a grid index for the tile
				grididx.y = i;				//
				position.x = (row[j]*148);	// calculate the x position of the tile (top left)  TODO: fix hard coding
				position.y = (i*86);		// calculate the y position of the tile (top left)  TODO: fix hard coding
				this.tiles[tilenum++] = new TileClass( tilenum, grididx, position, ''); // create and save new tile object
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
	
	checkmove: function (tgt) {
		// given a target x and y board index, run through the tiles and check if one exists at that location
		// TODO: game logic needed here, to track attacks etc?
		for( i in this.tiles )
		{
			if( (this.tiles[i].grididx.x == tgt.x) && (this.tiles[i].grididx.y == tgt.y))
			{
				return i; // return the tilenumber of the tile at that requested grid reference
			}
		}
		return null;	// else return null
	}
});

TileClass = Class.extend({
	tilenum: null,					// ID of the tile number top down left to right
	grididx: {x: null, y: null},	// grid index of the tile
	position: {x: null, y: null},	// position of the top left corner of the tile (in scaled pixels)
	center: {x: null, y: null},		// position of the center of the tile (in scaled pixels)
	resource: null,					// resource location on the tile
	slots: {						// slots that can hold units on a tile TODO: seems messy
		slot0: { unit: null,
				xoffset: -1,
				yoffset: -1},
		slot1: { unit: null,
				xoffset: 1,
				yoffset: -1},
		slot2: { unit: null,
				xoffset: -1,
				yoffset: 1},
		slot3: { unit: null,
				xoffset: 1,
				yoffset: 1},
		slot4: { unit: null,
				xoffset: 0,
				yoffset: 0}
		},
				
	init: function (tilenum, grididx, position, resource) {
		// Initialise a tile object with a tilenumber, grid index, x and y pixel position and resource (if exists)
		this.tilenum = tilenum;
		this.grididx = copy(grididx);		// TODO: is this the best way to do this?
		this.position = copy(position);		// TODO: is this the best way to do this?
		this.resource = resource;
		this.center.x = position.x+100;		// TODO: hard coded
		this.center.y = position.y+88;		// TODO: hard coded
	},
	
	render: function () {
		// render a tile and it's resource (if exists)
		drawSprite('hextile.png', cv.Boardlayer, this.center.x + cv.Offset.x, this.center.y + cv.Offset.y)
		if(this.resource)
		{
			var resourceimg = '';
			if(this.resource.substring(0,1) == 'f') resourceimg = 'food-resource.png';
			else resourceimg = 'science-resource.png';
			drawSprite(resourceimg, cv.Boardlayer, this.center.x + cv.Offset.x, this.center.y + cv.Offset.y);
			cv.Boardlayer.font = "normal 700 80px 'Roboto Condensed'";
			cv.Boardlayer.fillStyle = config.styles.resourcetext; 
			cv.Boardlayer.shadowOffsetX = 2;
			cv.Boardlayer.shadowOffsetY = 2;
			cv.Boardlayer.shadowBlur = 10;
			cv.Boardlayer.shadowColor = config.styles.resourcetextshaddow;
			cv.Boardlayer.fillText(this.resource.substring(1,2), this.center.x - 20 + cv.Offset.x, this.center.y + 25 + cv.Offset.y);
			cv.Boardlayer.shadowColor = "transparent";
		} 
	},
	
	remUnit: function (unitid) {
		// remove reference to a unit from a tile slot location
		// TODO: this seems messy
		var i = null;
		for( i in this.slots )
		{
			if(this.slots[i].unit == unitid) this.slots[i].unit = null;
		}
	}
});