CanvasClass = Class.extend({
	
	Boardlayer: null,	// Context used for rendering board and background
	Unitslayer: null,	// Context used for rendering units
	Efectslayer: null,	// Context used for rendering units
	UIlayer: null,		// Context used for the user interface
	Offset: {x:0, y:0},		// Offset required to center rendering in canvas
	Scale: null,		// Scale required to fit board into canvas
	LayoutUnit: null,	// A layout unit equal to 1% of the screen height
	cnvBoard: {},
	cnvUnits: {},
	cnvUI: {},
	screenRatio: null,
	screenMode: null,

	init: function (pattern) {	
		var body = document.getElementById("body"); 
		this.cnvBoard = document.createElement("canvas");
		this.cnvBoard.style.position="absolute";
		this.cnvBoard.style.top="0px";
		this.cnvBoard.style.left="0px";
		body.appendChild(this.cnvBoard);
		this.Boardlayer = this.cnvBoard.getContext('2d');	
		
		this.cnvUnits = document.createElement("canvas");
		this.cnvUnits.style.position="absolute";
		this.cnvUnits.style.top="0px";
		this.cnvUnits.style.left="0px";
		body.appendChild(this.cnvUnits);	
		this.Unitslayer = this.cnvUnits.getContext('2d');
		
		this.cnvEffects = document.createElement("canvas");
		this.cnvEffects.style.position="absolute";
		this.cnvEffects.style.top="0px";
		this.cnvEffects.style.left="0px";
		body.appendChild(this.cnvEffects);	
		this.Effectslayer = this.cnvEffects.getContext('2d');
		
		this.cnvUI = document.createElement("canvas");
		this.cnvUI.style.position="absolute";
		this.cnvUI.style.top="0px";
		this.cnvUI.style.left="0px";
		body.appendChild(this.cnvUI);	
		this.UIlayer = this.cnvUI.getContext('2d');

	},
	
	getMouse: function(e) {
		// return an object with sx and sy being the X and Y position of the click on the scaled canvases and x and y being the unscaled canvas click location
		return {sx: e.pageX / this.Scale, sy: e.pageY / this.Scale, x: e.pageX, y: e.pageY };
	},
 
	
	setSize: function (width, height) {
		this.Boardlayer.canvas.width = width;
		this.Boardlayer.canvas.height = height;
		this.Unitslayer.canvas.width = width;
		this.Unitslayer.canvas.height = height;
		this.Effectslayer.canvas.width = width;
		this.Effectslayer.canvas.height = height;
		this.UIlayer.canvas.width = width;
		this.UIlayer.canvas.height = height;
	},
	
	setScale: function () {
		// Calculate the scale and offset needed to correctly align canvas elements to screen size
		this.Scale = Math.min(window.innerWidth / 1385, ((window.innerHeight - ui.bannerheight) / 1210)); // Scale needed to fit board in canvas

		this.screenRatio = window.innerWidth / window.innerHeight;
		
		this.Offset.x = ((window.innerWidth - (1385 * this.Scale))/2)/this.Scale; 						// Offset needed to center board in canvas X
		this.Offset.y = Math.max( 0, ( (window.innerHeight - ui.bannerheight) /this.Scale - 1210 ));	// Offset needed to center board in canvas Y
		
		this.setSize( window.innerWidth, window.innerHeight ); // canvas = full window size
		
		// Apply scale to canvases
		this.Boardlayer.scale(this.Scale,this.Scale);
		this.Unitslayer.scale(this.Scale,this.Scale);
		this.Effectslayer.scale(this.Scale,this.Scale);
//		this.UIlayer.scale(this.Scale,this.Scale); // UI Canvas does not need to rescale for screen size
		
		if( this.screenRatio < 0.7 ) this.screenMode = 'portrait';
		else this.screenMode = 'landscape'
		
		units.scale();	// calculate new unit positions
//		effects.scale();

//		ui.scale(); 	// notify ui that the screen size has changed
		
		
//		if( this.screenMode == 'landscape')	document.getElementById("GameTitle").style.fontSize = (window.innerWidth*0.08)+"px";
//		else document.getElementById("GameTitle").style.fontSize = (window.innerWidth*0.2)+"px";

	}
	
});