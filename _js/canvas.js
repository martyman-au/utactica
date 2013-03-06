CanvasClass = Class.extend({
	// Class for the canvases used to render the game
	Offset: {x:0, y:0},	// Offset required to center rendering in canvas
	Scale: null,		// Scale required to fit board into canvas
	screenRatio: null,	// Apect ratio of the dipslay window
	screenMode: null,	// sreen mode setting used to switch UI layout for portrait layout
	layers: {},

	init: function () {
		// Create canvases for the various game layers
		var body = document.getElementById("body"), layer; 
		
		for( i in config.layers )
		{
			name = config.layers[i].name;
			this.layers[name] = {};
			this.layers[name].canvas = document.createElement("canvas");
			this.layers[name].canvas.style.position=config.layers[i].position;
			this.layers[name].canvas.style.top=config.layers[i].top;
			this.layers[name].canvas.style.left=config.layers[i].left;
			body.appendChild(this.layers[name].canvas);
			this.layers[name].context = this.layers[name].canvas.getContext('2d');
		}
	},
	
	getMouse: function(e) {
		// return an object with sx and sy being the X and Y position of the click on the scaled canvases and x and y being the unscaled canvas click location
		// TODO: Is this the best place for this
		return {sx: e.pageX / this.Scale, sy: e.pageY / this.Scale, x: e.pageX, y: e.pageY };
	},
 
	
	setSize: function (width, height) {
		// Sets the size of all of the cavases to the window size
		var i;
		for( i in config.layers )
		{
			this.layers[config.layers[i].name].canvas.width = width;
			this.layers[config.layers[i].name].canvas.height = height;
		}
	},
	
	setScale: function () {
		// Calculate the scale and offset needed to correctly align canvas elements to screen size
		
		var boardheight = config.boardPattern.length * 92;
		
		this.Scale = Math.min(window.innerWidth / 1385, ((window.innerHeight - ui.bannerheight) / boardheight)); // Scale needed to fit board in canvas
		this.screenRatio = window.innerWidth / window.innerHeight;
		
		this.Offset.x = ((window.innerWidth - (1385 * this.Scale))/2)/this.Scale; 						// Offset needed to center board in canvas X
		this.Offset.y = (((window.innerHeight - ui.bannerheight) - (boardheight * this.Scale))/2)/this.Scale; 						// Offset needed to center board in canvas X

//		this.Offset.y = Math.max( 0, ( (window.innerHeight - ui.bannerheight) /this.Scale - boardheight ));	// Offset needed to center board in canvas Y
		
		this.setSize( window.innerWidth, window.innerHeight ); // canvas = full window size
		
		// Apply scale to canvases
		this.layers['board'].context.scale(this.Scale,this.Scale);
		this.layers['units'].context.scale(this.Scale,this.Scale);
		this.layers['effects'].context.scale(this.Scale,this.Scale);
		
		if( this.screenRatio < 0.7 ) this.screenMode = 'portrait';
		else this.screenMode = 'landscape'
		
		units.scale();	// calculate new unit positions
		
//		if( this.screenMode == 'landscape')	document.getElementById("GameTitle").style.fontSize = (window.innerWidth*0.08)+"px";
//		else document.getElementById("GameTitle").style.fontSize = (window.innerWidth*0.2)+"px";
	}
	
});