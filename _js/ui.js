UIClass = Class.extend({
	tiles: new Array(),
	bannerheight: 100,
	popup: false,
	widgets: {},
	
	init: function () {
		//fixes a problem where double clicking causes text to get selected on the canvas
		cv.cnvUI.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
		
		// add a listner for mouse clicks
		cv.cnvUI.addEventListener('mousedown', function(e) {
			var mouse = cv.getMouse(e);
			ui.click(mouse.x,mouse.y,mouse.sx,mouse.sy);  	// send click to UI click handling code
//			units.click(mouse.sx,mouse.sy);	// send scaled click to Units
		});
		
		// Initialise User Interface widgets
		// TODO: fix the fact the positoin does not change when window width or heigh changes... need to use a html style "left: 50" type notation?
		this.widgets.speaker = new ButtonClass( {x:40,y:window.innerHeight-this.bannerheight+50}, ['speaker.png', 'speaker_mute.png']);
		this.widgets.endturn = new ButtonClass( {x:window.innerWidth-122,y:window.innerHeight-this.bannerheight+50}, ['end-turn-button.png']);	
		this.widgets.upright = new ButtonClass( {x:window.innerWidth-40,y:40}, ['arrows/up-right.png','arrows/up-right-highlighted.png']);
		this.widgets.up = new ButtonClass( {x:window.innerWidth-100,y:40}, ['arrows/up.png','arrows/up-highlighted.png']);
		this.widgets.upleft = new ButtonClass( {x:window.innerWidth-160,y:40}, ['arrows/up-left.png','arrows/up-left-highlighted.png']);
		this.widgets.downright = new ButtonClass( {x:window.innerWidth-40,y:120}, ['arrows/down-right.png','arrows/down-right-highlighted.png']);
		this.widgets.down = new ButtonClass( {x:window.innerWidth-100,y:120}, ['arrows/down.png','arrows/down-highlighted.png']);
		this.widgets.downleft = new ButtonClass( {x:window.innerWidth-160,y:120}, ['arrows/down-left.png','arrows/down-left-highlighted.png']);
	},
	
	render: function () {
		// Render UI elements
		if(cv.screenMode == 'landscape') this.bannerheight = 100;
		else this.bannerheight = 200;
		
		this.renderBanner();
		this.renderArrows();
	},
	
	redraw: function () {
		// Wipe the whole UI layer and render all UI elements
		this.wipe();
		this.render();
	},
	
	wipe: function (dir) {
		// Clear the UI layer
		cv.UIlayer.clearRect(0, 0, window.innerWidth, window.innerHeight);
	},
	
	renderBanner: function () {
		//Render the ui banner
		cv.UIlayer.fillStyle = config.styles.bannerbg; // set banner colour
		cv.UIlayer.fillRect  (0, window.innerHeight - this.bannerheight, window.innerWidth, this.bannerheight);  // now fill the canvas
		cv.UIlayer.fillStyle = config.styles.bannerhigh1; // set banner colour
		cv.UIlayer.fillRect  (0, window.innerHeight - this.bannerheight, window.innerWidth / cv.Scale, this.bannerheight/20);  // now fill the canvas
		cv.UIlayer.fillStyle = config.styles.bannerhigh2; // set banner colour
		cv.UIlayer.fillRect  (0, window.innerHeight - this.bannerheight, window.innerWidth, this.bannerheight/80);  // now fill the canvas
		this.widgets.endturn.render();
		this.widgets.speaker.render();
	},
	
	renderArrows: function () {
		this.widgets.upright.render();
		this.widgets.up.render();
		this.widgets.upleft.render();
		this.widgets.downright.render();
		this.widgets.down.render();
		this.widgets.downleft.render();
	},

	click: function (x,y,sx,sy) {
		// Deal with a click by checking if it hits any UI elements
		if(this.popup) // If there is a popup then close it and exit
		{
			this.popup = false;
			this.redraw();
			return;
		}		
		else if( y > (window.innerHeight - this.bannerheight)) console.log('banner click');
		else
		{
			units.click(sx,sy);	// send scaled click to Units
			// Check if the click hits any widgets
			var i = null;
			for( i in this.widgets )
			{
				this.widgets[i].click(x,y);
			}
		}
	},
	
	keypress: function (e) {
		// deal with all keypresses here
		if(this.popup) // If there is a popup then close it and exit
		{
			this.popup = false;
			this.redraw();
			return;
		}	
		var code = 'kc'+e.keyCode;
		if( code in config.movekeys )
		{
			// animate on screen arrow?
			units.move(code); 				// This is a move command
		}
		if( code == 'kc72' ) ui.renderpopup('blank');   				// "h" will bring up a popup
		if( code == 'kc88' )
		{
			if( units.units[units.activeUnit].type == 'soldier') units.units[units.activeUnit].explode();   // "x" will explode the active unit (for testing)
			else units.units[units.activeUnit].teleport();   // "x" will teleport the active unit (for testing)
		}
	},
	
	renderpopup: function (name) {
		var popheight = 300;
		var popwidth = 500;
		var radius = 30;
		
		this.popup = true;
		this.redraw();
		
		cv.UIlayer.fillStyle = config.styles.popupgreyout;
		cv.UIlayer.fillRect(0,0,window.innerWidth,window.innerHeight);
		cv.UIlayer.fillStyle = config.styles.popupbg;
		cv.UIlayer.roundRect((window.innerWidth-popwidth)/2 , (window.innerHeight-popheight)/2, popwidth, popheight, radius, config.styles.bannerbg )
	}
});


ButtonClass = Class.extend({
	// Used to create buttons for the UTACTICA UI
	position: {x: null, y: null},
	artwork: new Array(),
	state: 0,
	callback: null,
	
	init: function (position, artwork) {
		this.position = position;
		this.artwork = artwork;
	},
	
	render: function () {
		drawSprite(this.artwork[this.state], cv.UIlayer, this.position.x, this.position.y);
	},
	
	toggleState: function () {
		this.state = this.state % 2;
	},
	
	click: function (x,y) {
		this.toggleState();
	},
});