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
			var uihit = ui.click(mouse.x,mouse.y,mouse.sx,mouse.sy);  	// send click to UI click handling code
			if(!uihit) units.click(mouse.sx,mouse.sy);	// send scaled click to Units
		});
		
		// Initialise User Interface widgets
		// TODO: fix the fact the positoin does not change when window width or height changes... need to use a html style "left: 50" type notation?
		this.widgets.speaker = new ButtonClass( {left:40,bottom:50}, ['speaker.png', 'speaker_mute.png']);
		this.widgets.speaker.action = function (){this.toggleState(); sound.toggleMute(); };

		this.widgets.endturn = new ButtonClass( {right:122,bottom:50}, ['end-turn-button.png']);	

		this.widgets.upright = new ButtonClass( {right:40,top:40}, ['arrows/up-right.png','arrows/up-right-highlighted.png']);
		this.widgets.upright.action = function (){ units.move('kc33');  this.pulse() };

		this.widgets.up = new ButtonClass( {right:100,top:40}, ['arrows/up.png','arrows/up-highlighted.png']);
		this.widgets.up.action = function (){ units.move('kc38');  this.pulse() };

		this.widgets.upleft = new ButtonClass( {right:160,top:40}, ['arrows/up-left.png','arrows/up-left-highlighted.png']);
		this.widgets.upleft.action = function (){ units.move('kc36');  this.pulse() };

		this.widgets.downright = new ButtonClass( {right:40,top:120}, ['arrows/down-right.png','arrows/down-right-highlighted.png']);
		this.widgets.downright.action = function (){ units.move('kc34');  this.pulse() };

		this.widgets.down = new ButtonClass( {right:100,top:120}, ['arrows/down.png','arrows/down-highlighted.png']);
		this.widgets.down.action = function (){ units.move('kc40');  this.pulse() };

		this.widgets.downleft = new ButtonClass( {right:160,top:120}, ['arrows/down-left.png','arrows/down-left-highlighted.png']);
		this.widgets.downleft.action = function (){ units.move('kc35');  this.pulse() };
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
//		console.log(x,y);
		if(this.popup) // If there is a popup then close it and exit
		{
			this.popup = false;
			this.redraw();
			return true;
		}		
//		else if( y > (window.innerHeight - this.bannerheight)) console.log('banner click');
		
		// Check if the click hits any widgets
		var i = null;
		for( i in this.widgets )
		{
			if( this.widgets[i].clickhit(x,y) )
			{
				this.widgets[i].action();
				return true;
			}
		}
		return false;
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
			ui.moveIconFlash(code);
			units.move(code); 				// This is a move command
		}
		if( code == 'kc72' ) ui.renderpopup('blank');   				// "h" will bring up a popup
		if( code == 'kc88' )
		{
			var unit = units.activeUnit;
			if( units.units[units.activeUnit].type == 'soldier')
			{
				if(units.units[unit].explode()) delete units.units[unit];   // "x" will explode the active unit (for testing)
			}
			else
			{
				if(units.units[unit].teleport()) delete units.units[unit];   // "x" will teleport the active unit (for testing)
			}
		}
	},
	
	moveIconFlash: function (code) {
//			console.log(config.movekeys[code]);
			x = config.movekeys[code].x;
			y = config.movekeys[code].y;
			if(y == 1)
			{
				if( x == 1 ) this.widgets.downright.pulse();
				else this.widgets.downleft.pulse();
			}
			else if( y == -1 )
			{
				if( x == 1 ) this.widgets.upright.pulse();
				else this.widgets.upleft.pulse();
			}
			else if( y == -2) this.widgets.up.pulse();
			else this.widgets.down.pulse();
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
	// TODO: need to extend this class into specific button classes for specific functionality?
	position: {top: null, right: null, bottom: null, left: null},
	artwork: new Array(),
	state: 0,
	callback: null,
	edges: {top: 0, bottom: 0, right: 0, left: 0},
	
	init: function (position, artwork) {
		this.position = position;
		this.artwork = artwork;
	},
	
	render: function () {
		//Renders the button to the screen in it's defined location (position need to be recalculated to take into account screen resizing)
		if(this.position.left) this.position.x = this.position.left; 	// calc the x position based on right or left screen edge offsets
		else this.position.x = window.innerWidth-this.position.right;
		if(this.position.top) this.position.y = this.position.top;		// calc the y position based on top or bottom screen edge offsets
		else this.position.y = window.innerHeight-this.position.bottom;		
		drawSprite(this.artwork[this.state], cv.UIlayer, this.position.x, this.position.y);	// draw the button sprite at the calculated position
		
		this.edges.top = this.position.y - (sprites.getStats(this.artwork[this.state]).h / 2);		//calculate edges for click hit matching
		this.edges.bottom = this.position.y + (sprites.getStats(this.artwork[this.state]).h / 2);
		this.edges.left = this.position.x - (sprites.getStats(this.artwork[this.state]).w / 2);
		this.edges.right = this.position.x + (sprites.getStats(this.artwork[this.state]).w / 2);
	},
	
	toggleState: function () {
		if( this.state == 0) this.state = 1;
		else this.state = 0;
		ui.redraw(); 			// TODO: need to chaneg this to only wipe and redraw the button
	},
	
	pulse: function () {
		this.toggleState();
		var tmp = this;
		window.setTimeout( function(){tmp.toggleState()}, 150);
	},
	
	clickhit: function (x,y) {
		if( x >= this.edges.left && x <= this.edges.right && y >= this.edges.top && y <= this.edges.bottom)
		{
			return true;
		}
	},
});