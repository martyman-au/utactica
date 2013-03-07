UIClass = Class.extend({
	tiles: new Array(),
	bannerheight: 100,
	popup: false,
	widgets: {},
	
	init: function () {
		//fixes a problem where double clicking causes text to get selected on the canvas
		cv.layers['ui'].canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
		
		// add a listner for mouse clicks
		cv.layers['ui'].canvas.addEventListener('mousedown', function(e) {
			var mouse = cv.getMouse(e);
			var uihit = ui.mouse('mousedown',mouse.x,mouse.y,mouse.sx,mouse.sy);  	// send click to UI click handling code
			if(!uihit) units.click(mouse.sx,mouse.sy);	// send scaled click to Units if UI failed to hit
		});
		
		cv.layers['ui'].canvas.addEventListener('mouseup', function(e) {
			var mouse = cv.getMouse(e);
			var uihit = ui.mouse('mouseup',mouse.x,mouse.y,mouse.sx,mouse.sy);  	// send click to UI click handling code
			//if(!uihit) units.click(mouse.sx,mouse.sy);	// send scaled click to Units if UI failed to hit
		});		
		
		// Initialise User Interface widgets
		// TODO: fix the fact the positoin does not change when window width or height changes... need to use a html style "left: 50" type notation?
		this.widgets.speaker = new ImageButtonClass( {left:30,bottom:50}, ['speaker.png', 'speaker_mute.png'], true);
		this.widgets.speaker.action = function (){sound.toggleMute(); };

//		this.widgets.endturn = new ButtonClass( {right:122,bottom:50}, ['end-turn-button.png', 'end-turn-button-active.png']);	
//		this.widgets.endturn.action = function (){ game.endTurn(); this.pulse(250) };

		this.widgets.upright = new ImageButtonClass( {right:40,top:40}, ['arrows/up-right.png','arrows/up-right-highlighted.png']);
		this.widgets.upright.action = function (){ units.move('kc33'); };
		this.widgets.up = new ImageButtonClass( {right:100,top:40}, ['arrows/up.png','arrows/up-highlighted.png']);
		this.widgets.up.action = function (){ units.move('kc38'); };
		this.widgets.upleft = new ImageButtonClass( {right:160,top:40}, ['arrows/up-left.png','arrows/up-left-highlighted.png']);
		this.widgets.upleft.action = function (){ units.move('kc36'); };
		this.widgets.downright = new ImageButtonClass( {right:40,top:120}, ['arrows/down-right.png','arrows/down-right-highlighted.png']);
		this.widgets.downright.action = function (){ units.move('kc34'); };
		this.widgets.down = new ImageButtonClass( {right:100,top:120}, ['arrows/down.png','arrows/down-highlighted.png']);
		this.widgets.down.action = function (){ units.move('kc40'); };
		this.widgets.downleft = new ImageButtonClass( {right:160,top:120}, ['arrows/down-left.png','arrows/down-left-highlighted.png']);
		this.widgets.downleft.action = function (){ units.move('kc35'); };
		
		this.widgets.teleport = new VectorButtonClass( {left:20,top:180}, 'Teleport', 110);
		this.widgets.teleport.action = function (){
			if(units.activeUnit !== null) units.units[units.activeUnit].teleport();
			else sound.playSound(sound['doh']);
		};

		this.widgets.buyunits = new VectorButtonClass( {left:20,top:240}, 'Buy Units', 110);
		this.widgets.buyunits.action = function (){  };

		this.widgets.upgrades = new VectorButtonClass( {left:20,top:300}, 'Upgrades', 110);
		this.widgets.upgrades.action = function (){  };

		this.widgets.endturn = new VectorButtonClass( {left:20,top:360}, 'End turn', 110);
		this.widgets.endturn.action = function (){ game.endTurn(); };
	},
	
	render: function () {
		// Render UI elements
		var i;
		if(cv.screenMode == 'landscape') this.bannerheight = 100;
		else this.bannerheight = 200;
		
		this.wipe();
		this.renderPlayerTurn();
		this.renderGameTitle();
		this.renderBanner();
//		this.renderArrows();
		for( i in this.widgets) // render all widgets
		{
			this.widgets[i].render();
		}

	},
	
	redraw: function () {
		// Wipe the whole UI layer and render all UI elements
		this.wipe();
		this.render();
	},
	
	wipe: function (dir) {
		// Clear the UI layer
		cv.layers['ui'].context.clearRect(0, 0, window.innerWidth, window.innerHeight);
	},
	
	renderBanner: function () {
		//Render the ui banner
		cv.layers['ui'].context.fillStyle = config.styles.bannerbg; // set banner colour
		cv.layers['ui'].context.fillRect  (0, window.innerHeight - this.bannerheight, window.innerWidth, this.bannerheight);  // now fill the canvas
		cv.layers['ui'].context.fillStyle = config.styles.bannerhigh1; // set banner colour
		cv.layers['ui'].context.fillRect  (0, window.innerHeight - this.bannerheight, window.innerWidth / cv.Scale, 6);  // now fill the canvas
		cv.layers['ui'].context.fillStyle = config.styles.bannerhigh2; // set banner colour
		cv.layers['ui'].context.fillRect  (0, window.innerHeight - this.bannerheight, window.innerWidth, 2);  // now fill the canvas
//		cv.layers['ui'].context.fillStyle = '#0000FF'; // set banner colour
//		cv.layers['ui'].context.fillRect  (0, window.innerHeight - this.bannerheight + 6, window.innerWidth, 2);  // now fill the canvas
//		this.widgets.endturn.render();
		this.widgets.speaker.render();
		
		this.renderCash();
	},
	
	renderPlayerTurn: function () {
		cv.layers['ui'].context.font = "normal 400 40px 'Roboto Condensed'";
		if(game.turn)
		{
			cv.layers['ui'].context.fillStyle = colours.blue;  // TODO: hardcoded
			var text = 'Blue turn';
		}
		else
		{
			cv.layers['ui'].context.fillStyle = colours.red;  // TODO: hardcoded
			var text = 'Red turn';
		}
		cv.layers['ui'].context.shadowOffsetX = 0;
		cv.layers['ui'].context.shadowOffsetY = 0;
		cv.layers['ui'].context.shadowBlur = 5;
		cv.layers['ui'].context.shadowColor = '#552222';  // TODO: hardcoded
		cv.layers['ui'].context.shadowColor = '#FFFFFF';  // TODO: hardcoded
		var x = 13;
		var y = 140;
		cv.layers['ui'].context.fillText(text, x, y);		
		cv.layers['ui'].context.shadowColor = "transparent";
	},
	
	renderGameTitle: function () {
		cv.layers['ui'].context.fillStyle = colours.white;  // TODO: hardcoded
		cv.layers['ui'].context.font = "normal 400 90px 'Roboto Condensed'";
		cv.layers['ui'].context.shadowOffsetX = 0;
		cv.layers['ui'].context.shadowOffsetY = 0;
		cv.layers['ui'].context.shadowBlur = 6;
		cv.layers['ui'].context.shadowColor = '#552222';  // TODO: hardcoded
		var x = 13;
		var y = 90;
		cv.layers['ui'].context.fillText('UTACTICA', x, y);		
		cv.layers['ui'].context.shadowColor = "transparent";		
	},
	
	renderCash: function () {
		// render the current resource 
		cv.layers['ui'].context.font = "normal 400 20px 'Roboto Condensed'";
		cv.layers['ui'].context.fillStyle = config.styles.cashtext; 
		cv.layers['ui'].context.shadowOffsetX = 0;
		cv.layers['ui'].context.shadowOffsetY = 1;
		cv.layers['ui'].context.shadowBlur = 6;
		cv.layers['ui'].context.shadowColor = config.styles.cashtextshadow;
		var x = 70;
		var y = window.innerHeight - 55;
		cv.layers['ui'].context.fillText('Food resources: '+game.foodcash[game.turn], x, y);
		var y = window.innerHeight - 30;
		cv.layers['ui'].context.fillText('Tech resources: '+game.sciencecash[game.turn], x, y);
		cv.layers['ui'].context.shadowColor = "transparent";
	},
	
	renderArrows: function () {
		// Render movement control icons to the screen
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

		mouse: function (event,x,y,sx,sy) {
		// Deal with a click by checking if it hits any UI elements
//		console.log(x,y);
		if(this.popup) // If there is a popup then close it and exit
		{
			this.popup = false;
			this.redraw();
			return true;
		}
		
		// Check if the click hits any widgets
		var i = null;
		for( i in this.widgets )
		{
			if( this.widgets[i].clickhit(x,y) )
			{
				this.widgets[i].mouse(event,x,y);
				return true;
			}
		}
		return false;
	},
	
	keypress: function (e) {
		// Deal with keypresses
		if(this.popup)	// If there is a popup then close it and exit
		{
			this.popup = false;
			this.redraw();
			return;
		}	
		var code = 'kc'+e.keyCode;
		console.log(code);
		if( code in config.movekeys )	// This is a move command
		{
			ui.moveIconFlash(code);		// Animate on screen arrow button
			units.move(code); 			// attempt to move the active unit
		}
		else if( code == 'kc72' ) ui.renderpopup('blank');   				// "h" will bring up a popup
		else if( code == 'kc88' )
		{
			var unit = units.activeUnit;
			if(units.units[unit].lose() == 'delete') delete units.units[unit];   // "x" will explode the active unit (for testing)
		}
		else if (code == 'kc32' ) // Space bar ends turn
		{
			ui.widgets.endturn.pulse(200);
			game.endTurn();	
		}
		else if (code == 'kc77' ) ui.widgets.speaker.action();	// "m" Toogle mute status
		else if (code == 'kc84' ) units.units[units.activeUnit].teleport();	// "t" Teleport a unit home

	},
	
	moveIconFlash: function (code) {
		// Flash the appropriate move icon when a move is attempted
		x = config.movekeys[code].x;
		y = config.movekeys[code].y;
		if(y == 1)
		{
			if( x == 1 ) this.widgets.downright.pulse(200);
			else this.widgets.downleft.pulse(200);
		}
		else if( y == -1 )
		{
			if( x == 1 ) this.widgets.upright.pulse(200);
			else this.widgets.upleft.pulse(200);
		}
		else if( y == -2) this.widgets.up.pulse(200);
		else this.widgets.down.pulse(200);
	},
	
	renderpopup: function (name) {
		// Darw a test popup window
		var popheight = 300;
		var popwidth = 500;
		var radius = 30;
		
		this.popup = true;
		this.redraw();
		
		cv.layers['ui'].context.fillStyle = config.styles.popupgreyout;
		cv.layers['ui'].context.fillRect(0,0,window.innerWidth,window.innerHeight);
		cv.layers['ui'].context.fillStyle = config.styles.popupbg;
		cv.layers['ui'].context.roundRect((window.innerWidth-popwidth)/2 , (window.innerHeight-popheight)/2, popwidth, popheight, radius, config.styles.bannerbg )
	}
});


WidgetClass = Class.extend({
	// Base widget class for the UTACTICA UI used to create all widget types
	position: {top: null, right: null, bottom: null, left: null},
	state: 0,
	edges: {top: 0, bottom: 0, right: 0, left: 0},
	
	init: function () {
	},
	
	toggleState: function () {
		// Toggle this button between it's two first states
		if( this.state == 0) this.state = 1;
		else this.state = 0;
		ui.redraw(); 			// TODO: need to chaneg this to only wipe and redraw the button
	},
	
	pulse: function (time) {
		// Toggle this button for a period of time
		this.toggleState();
		var tmp = this;
		window.setTimeout( function(){tmp.toggleState()}, time);
	},
	
	clickhit: function (x,y) {
		// return true if a click location corresponds to this button
		if( x >= this.edges.left && x <= this.edges.right && y >= this.edges.top && y <= this.edges.bottom)
		{
			return true;
		}
	},
});

ButtonClass = WidgetClass.extend({
	// Base button class for the UTACTICA UI used to create ImageButtonClass and VectorButtonClass
	toggleOnMouse: false,
	
	
	mouse: function (event,x,y) {
		// Deal with mouse events, normally this would just mean actioning a click and toggling the button state
		if ( event == 'mousedown' ) { 
			if(this.toggleOnMouse) this.toggleState(); 
			else this.state = 1;
			this.action();
			
		}
		else if ( event == 'mouseup' ) {
			if(!this.toggleOnMouse) this.state = 0;
		}
		ui.redraw();
	}
});

ImageButtonClass = ButtonClass.extend({
	// Used for image based buttons
	artwork: new Array(),
	
	init: function (position, artwork, toggleOnMouse) {
		// Initialise a new button
		this.position = position;
		this.artwork = artwork;
		this.toggleOnMouse = toggleOnMouse;
	},
	
	render: function () {
		//Renders this button to the screen in it's defined location (position is recalculated to take into account screen resizing)
		if(this.position.left) this.position.x = this.position.left; 	// calc the x position based on right or left screen edge offsets
		else this.position.x = window.innerWidth-this.position.right;
		if(this.position.top) this.position.y = this.position.top;		// calc the y position based on top or bottom screen edge offsets
		else this.position.y = window.innerHeight-this.position.bottom;		
		drawSprite(this.artwork[this.state], cv.layers['ui'].context, this.position.x, this.position.y);	// draw the button sprite at the calculated position
		
		//re-calculate edges for click hit matching
		this.edges.top = this.position.y - (sprites.getStats(this.artwork[this.state]).h / 2);
		this.edges.bottom = this.position.y + (sprites.getStats(this.artwork[this.state]).h / 2);
		this.edges.left = this.position.x - (sprites.getStats(this.artwork[this.state]).w / 2);
		this.edges.right = this.position.x + (sprites.getStats(this.artwork[this.state]).w / 2);
	},
});

VectorButtonClass = ButtonClass.extend({
	// Used to create procedural ui buttons
	text: '',
	size: {w: 0, h: 0},
	
	init: function (position, text, width) {
		// Initialise a new button
		this.position = position;
		this.text = text;
		if( typeof width === "undefined" ) this.size.w = this.text.length * 12;
		else this.size.w = width;
		this.size.h = 35;
	},
	
	render:  function () {
		// render button to screen in it's defined location (position is recalculated to take into account screen resizing)
		if(this.position.left) this.position.x = this.position.left; 	// calc the x position based on right or left screen edge offsets
		else this.position.x = window.innerWidth-this.position.right;
		if(this.position.top) this.position.y = this.position.top;		// calc the y position based on top or bottom screen edge offsets
		else this.position.y = window.innerHeight-this.position.bottom;		
		
		if( this.state === 1) {
			this.position.x = this.position.x + 1;
			this.position.y = this.position.y + 2;
		}
		
		cv.layers['ui'].context.shadowColor = "transparent";
		if( this.state === 0) { // if normal state add shadow
			cv.layers['ui'].context.shadowOffsetX = 2;
			cv.layers['ui'].context.shadowOffsetY = 2;
			cv.layers['ui'].context.shadowBlur = 12;
			cv.layers['ui'].context.shadowColor = '#222222';
		}
		// White outline
		cv.layers['ui'].context.fillStyle = '#E0D4B0';
		cv.layers['ui'].context.strokeStyle = '#FFFFFF';
		cv.layers['ui'].context.lineWidth = 12;
		cv.layers['ui'].context.roundRect(this.position.x , this.position.y, this.size.w, this.size.h, 9, true, true )

		cv.layers['ui'].context.shadowColor = "transparent";
		
		cv.layers['ui'].context.strokeStyle = colours.brightorange;
		cv.layers['ui'].context.lineWidth = 7;		
		cv.layers['ui'].context.roundRect(this.position.x , this.position.y, this.size.w, this.size.h, 9, true, true )
		
		cv.layers['ui'].context.font = "normal 400 25px 'Roboto Condensed'";
		cv.layers['ui'].context.textAlign = 'center';
		cv.layers['ui'].context.fillStyle = '#222222';
		var x = this.position.x + this.size.w/2;
		var y = this.position.y + this.size.h/2 + 8;
		cv.layers['ui'].context.fillText(this.text, x, y);
		cv.layers['ui'].context.textAlign = 'start';

		//re-calculate edges for click hit matching
		this.edges.top = this.position.y - 5 ;		
		this.edges.bottom = this.position.y + this.size.h + 5;
		this.edges.left = this.position.x - 5;
		this.edges.right = this.position.x + this.size.w + 5;
	}
});
