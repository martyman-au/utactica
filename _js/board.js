BoardClass = Class.extend({
	
	tiles: new Array(),

	init: function (pattern) {
		// Supply the board pattern for the hextiles
		// an array of arrays for each row of the board
		var tilenum = 0;
		var grididx = {};
		var position = {};
		var center = {};
//		console.log(Object.keys(pattern));
		for( i in pattern ) {
			var row = pattern[i];
			for( j in row )
			{
				posx = (row[j]*148);
				posy = (i*86);
				grididx.x = row[j];
				grididx.y = i;
				position.x = posx;
				position.y = posy;
				this.tiles[tilenum++] = new TileClass( tilenum, grididx, position, '');
			}	
		}

		this.distributeResources();
	},
	
	distributeResources: function () {
		// Seed tiles with resources
		fisherYates ( config.resources ); // shuffle resources
		for( i in config.resources )
		{
			if (config.resources.hasOwnProperty(i))
			{
				this.tiles[config.resourcedTiles[i]].resource = config.resources[i];
			}
		}
	},
	
	render: function () {
		//Render the background and playing board to the board canvas
		for( i in this.tiles ) {
			this.tiles[i].render();
		}

	},
	
	checkmove: function (tgt) {
		for( i in this.tiles )
		{
			if( (this.tiles[i].grididx.x == tgt.x) && (this.tiles[i].grididx.y == tgt.y))
			{
				return i;
			}
		}
		return null;
	}
});

TileClass = Class.extend({
	tilenum: null,					// ID of the tile number top down left to right
	grididx: {x: null, y: null},	// grid index of the tile
	position: {x: null, y: null},	// position of the top left corner of the tile (in scaled pixels)
	center: {x: null, y: null},		// position of the center of the tile (in scaled pixels)
	resource: null,					// resource location on the tile
	slots: {
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
		this.tilenum = tilenum;
		this.grididx = copy(grididx);
		this.position = copy(position);
		this.resource = resource;
		this.center.x = position.x+100;
		this.center.y = position.y+88;
	},
	
	render: function () {
//		cv.Boardlayer.drawImage(hextile,this.position.x + cv.Offset.x, this.position.y + cv.Offset.y);
		drawSprite('hextile.png', cv.Boardlayer, this.center.x + cv.Offset.x, this.center.y + cv.Offset.y)
		if(this.resource)
		{
			var resource = null;
			if(this.resource.substring(0,1) == 'f') resourceimg = 'food-resource.png';
			else resourceimg = 'science-resource.png';
			drawSprite(resourceimg, cv.Boardlayer, this.center.x + cv.Offset.x, this.center.y + cv.Offset.y);
			cv.Boardlayer.font = "normal 700 80px 'Roboto Condensed'";
//			cv.Boardlayer.font = "bold 80pt sans-serif";
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
		var i = null;
		for( i in this.slots )
		{
//			console.log(this.slots[i]);
			if(this.slots[i].unit == unitid) this.slots[i].unit = null;
		}
	}
});