UIClass = Class.extend({
	tiles: new Array(),
	popup: null,
	widgets: {},
	
	init: function () {
		//fixes a problem where double clicking causes text to get selected on the canvas
		cv.layers['ui'].canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
		
		// add a listner for mouse clicks
		cv.layers['ui'].canvas.addEventListener('mousedown', function(e) {
			if(!game.controlLock) {
				var mouse = cv.getMouse(e);
				var uihit = ui.mouse('mousedown',mouse.x,mouse.y,mouse.sx,mouse.sy);  	// send click to UI click handling code
				if(!uihit) units.click(mouse.sx,mouse.sy);	// send scaled click to Units if UI failed to hit
			}
		});
		
		cv.layers['ui'].canvas.addEventListener('mouseup', function(e) {
			if(!game.controlLock) {
				var mouse = cv.getMouse(e);
				var uihit = ui.mouse('mouseup',mouse.x,mouse.y,mouse.sx,mouse.sy);  	// send click to UI click handling code
			}
		});		
		
		// Initialise User Interface widgets
		this.widgets.speaker = new ImageButtonClass( {left:25,bottom:30}, ['speaker.png', 'speaker_mute.png'], true);
		this.widgets.speaker.action = function (){sound.toggleMute(); };

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
		
		this.widgets.teleport = new VectorButtonClass( {left:15,top:190}, 'Teleport', 110);
		this.widgets.teleport.action = function (){
			if(units.activeUnit !== null) units.units[units.activeUnit].teleport();
			else sound.playSound('doh');
		};

		this.widgets.buyunits = new VectorButtonClass( {left:15,top:250}, 'Buy Units', 110);
		this.widgets.buyunits.action = function (){ ui.widgets.buyunitspopup.render(); };

		this.widgets.upgrades = new VectorButtonClass( {left:15,top:310}, 'Upgrades', 110);
		this.widgets.upgrades.action = function (){ ui.widgets.upgradespopup.render();  };

		this.widgets.endturn = new VectorButtonClass( {left:15,top:370}, 'End turn', 110);
		this.widgets.endturn.action = function (){ game.endTurn(); };
		
		this.widgets.upgradespopup = new PopupClass( 'Upgrades' );
		this.widgets.buyunitspopup = new PopupClass( 'Buy Units' );
		this.widgets.helppopup = new PopupClass( 'Help' );
	},
	
	render: function () {
		// Render UI elements
		var i;
		
		this.wipe();
		this.renderPlayerTurn();
		this.renderGameTitle();
		this.widgets.speaker.render();
		
		this.renderCash();		
		
		for( i in this.widgets) // render all widgets
		{
			if(this.widgets[i].display) this.widgets[i].render();
		}
		
		if(this.popup) this.popup.render(); // Render a popup if there is a current one
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
	
	renderPlayerTurn: function () {
		var text = config.sides[game.turn].name + 's';
		cv.layers['ui'].context.fillStyle = colours[config.sides[game.turn].colour];
		cv.layers['ui'].context.shadowOffsetX = 0;
		cv.layers['ui'].context.shadowOffsetY = 0;
		cv.layers['ui'].context.shadowBlur = 3;
		cv.layers['ui'].context.shadowColor = '#FFFFFF';  // TODO: hardcoded
		var x = 10;
		var y = 125;
		cv.layers['ui'].context.font = "normal 400 40px 'Roboto Condensed','Trebuchet MS',sans-serif";
		cv.layers['ui'].context.fillText(text, x, y);		
		cv.layers['ui'].context.shadowColor = "transparent";
	},
	
	renderGameTitle: function () {
		cv.layers['ui'].context.fillStyle = colours.white;  // TODO: hardcoded
		cv.layers['ui'].context.font = "normal 400 90px 'Roboto Condensed','Trebuchet MS',sans-serif";
		cv.layers['ui'].context.shadowOffsetX = 0;
		cv.layers['ui'].context.shadowOffsetY = 0;
		cv.layers['ui'].context.shadowBlur = 6;
		cv.layers['ui'].context.shadowColor = '#552222';  // TODO: hardcoded
		var x = 10;
		var y = 80;
		cv.layers['ui'].context.fillText('UTACTICA', x, y);		
		cv.layers['ui'].context.shadowColor = "transparent";		
	},
	
	renderCash: function () {
		// render the current resource 
		cv.layers['ui'].context.font = "normal 400 20px 'Roboto Condensed','Trebuchet MS',sans-serif";
		cv.layers['ui'].context.fillStyle = config.styles.cashtext; 
		cv.layers['ui'].context.shadowOffsetX = 0;
		cv.layers['ui'].context.shadowOffsetY = 1;
		cv.layers['ui'].context.shadowBlur = 6;
		cv.layers['ui'].context.shadowColor = config.styles.cashtextshadow;
		var x = 10;
		var y = 150;
		cv.layers['ui'].context.fillText(config.sides[game.turn].name+' food resources: '+game.foodcash[game.turn], x, y);
		var y = y + 20;
		cv.layers['ui'].context.fillText(config.sides[game.turn].name+' tech resources: '+game.sciencecash[game.turn], x, y);
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

	mouse: function (event,x,y,sx,sy) {
		// Deal with a click by checking if it hits any UI elements
//		console.log(x,y);
		
		if(this.popup && this.popup.clickhit(x,y)) { // if it is a popup click
			// TODO: deal with the popup click
		}
		else {
			if(event=='mousedown' && this.popup) // If there is a popup then close it and exit
			{
				this.popup = false;
				this.redraw();
				return true;
			}
			// Check if the click hits any widgets
			var i = null;
			for( i in this.widgets )
			{
				var widget = this.widgets[i]
				if( widget.display && widget.clickhit(x,y) )
				{
					widget.mouse(event,x,y);
					return true;
				}
			}
			return false;
		}
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
//		console.log(code);
		if( code in config.movekeys )	// This is a move command
		{
			ui.moveIconFlash(code);		// Animate on screen arrow button
			units.move(code); 			// attempt to move the active unit
		}
		else if( code == 'kc72' ) ui.widgets.helppopup.render();   				// "h" will bring up a help popup
		else if( code == 'kc88' )
		{
			var unit = units.activeUnit;
			if(units.units[unit].lose() == 'delete') delete units.units[unit];	// "x" will explode the active unit (for testing)
		}
		else if (code == 'kc32' ) // Space bar ends turn
		{
			ui.widgets.endturn.pulse(200);
			game.endTurn();	
		}
		else if (code == 'kc77' ) ui.widgets.speaker.action();					// "m" Toogle mute status
		else if (code == 'kc84' ) units.units[units.activeUnit].teleport();		// "t" Teleport a unit home

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
	
});


WidgetClass = Class.extend({
	// Base widget class for the UTACTICA UI used to create all widget types
	position: {top: null, right: null, bottom: null, left: null},
	state: 0,
	edges: {top: 0, bottom: 0, right: 0, left: 0},
	display: true,
	
	init: function () {
	},
	
	toggleState: function () {
		// Toggle this button between it's two first states
		if( this.state == 0) this.state = 1;
		else this.state = 0;
		ui.redraw(); 			// TODO: need to change this to only wipe and redraw the button
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
		
		if( this.state === 1) { // add an offset if the button is currently clicked
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
		cv.layers['ui'].context.fillStyle = config.styles.buttonbg;
		cv.layers['ui'].context.strokeStyle = '#FFFFFF';
		cv.layers['ui'].context.lineWidth = 12;
		cv.layers['ui'].context.roundRect(this.position.x , this.position.y, this.size.w, this.size.h, 9, true, true )

		cv.layers['ui'].context.shadowColor = "transparent";
		
		cv.layers['ui'].context.strokeStyle = colours.brightorange;
		cv.layers['ui'].context.lineWidth = 7;		
		cv.layers['ui'].context.roundRect(this.position.x , this.position.y, this.size.w, this.size.h, 9, true, true )
		
		cv.layers['ui'].context.font = "normal 400 25px 'Roboto Condensed','Trebuchet MS',sans-serif";
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

PopupClass = WidgetClass.extend({
	// Display popup information
	display: false,
	size: {w: 0, h: 0},
	radius: 0,

	init: function (title) {
		// Is this where we should set all of the popup's contents?
		this.size.h = 600;
		this.size.w = 800;
		this.radius = 30;
		this.title = title;
	},
	
	render: function () {
		// Renders this popup to the screen

		this.position.x = (window.innerWidth-this.size.w)/2;
		this.position.y = (window.innerHeight-this.size.h)/2;
		//re-calculate edges for click hit matching
		this.edges.top = this.position.y - 10 ;		
		this.edges.bottom = this.position.y + this.size.h + 10;
		this.edges.left = this.position.x - 10;
		this.edges.right = this.position.x + this.size.w + 10;		
		
		ui.popup = this;
	
		cv.layers['ui'].context.fillStyle = config.styles.popupgreyout;
		cv.layers['ui'].context.fillRect(0,0,window.innerWidth,window.innerHeight);
		
		cv.layers['ui'].context.shadowOffsetX = 1;
		cv.layers['ui'].context.shadowOffsetY = 1;
		cv.layers['ui'].context.shadowBlur = 25;
		cv.layers['ui'].context.shadowColor = '#222222';

		cv.layers['ui'].context.fillStyle = '#E0E0B0';
		cv.layers['ui'].context.strokeStyle = '#FFFFFF';
		cv.layers['ui'].context.lineWidth = 15;
		cv.layers['ui'].context.roundRect((window.innerWidth-this.size.w)/2 , (window.innerHeight-this.size.h)/2, this.size.w, this.size.h, this.radius, config.styles.bannerbg );
		
		cv.layers['ui'].context.strokeStyle = colours.brightorange;
		cv.layers['ui'].context.lineWidth = 7;		
		cv.layers['ui'].context.fillStyle = config.styles.popupbg;
		cv.layers['ui'].context.shadowColor = "transparent";
		cv.layers['ui'].context.roundRect((window.innerWidth-this.size.w)/2 , (window.innerHeight-this.size.h)/2, this.size.w, this.size.h, this.radius, config.styles.bannerbg );
		
		this.renderTitle();
	},
	
	renderTitle: function () {
		cv.layers['ui'].context.font = "normal 400 40px 'Roboto Condensed','Trebuchet MS',sans-serif";
		cv.layers['ui'].context.textAlign = 'center';
		cv.layers['ui'].context.fillStyle = '#222222';
		var x = this.position.x + this.size.w/2;
		var y = this.position.y + 40;
		cv.layers['ui'].context.fillText(this.title, x, y);
		cv.layers['ui'].context.textAlign = 'start';
	}


});