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

		this.widgets.endturn = new ButtonClass( {right:122,bottom:50}, ['end-turn-button.png', 'end-turn-button-active.png']);	
		this.widgets.endturn.action = function (){ game.endTurn(); this.pulse(250) };

		this.widgets.upright = new ButtonClass( {right:40,top:40}, ['arrows/up-right.png','arrows/up-right-highlighted.png']);
		this.widgets.upright.action = function (){ units.move('kc33'); this.pulse(150) };

		this.widgets.up = new ButtonClass( {right:100,top:40}, ['arrows/up.png','arrows/up-highlighted.png']);
		this.widgets.up.action = function (){ units.move('kc38'); this.pulse(150) };

		this.widgets.upleft = new ButtonClass( {right:160,top:40}, ['arrows/up-left.png','arrows/up-left-highlighted.png']);
		this.widgets.upleft.action = function (){ units.move('kc36'); this.pulse(150) };

		this.widgets.downright = new ButtonClass( {right:40,top:120}, ['arrows/down-right.png','arrows/down-right-highlighted.png']);
		this.widgets.downright.action = function (){ units.move('kc34'); this.pulse(150) };

		this.widgets.down = new ButtonClass( {right:100,top:120}, ['arrows/down.png','arrows/down-highlighted.png']);
		this.widgets.down.action = function (){ units.move('kc40'); this.pulse(150) };

		this.widgets.downleft = new ButtonClass( {right:160,top:120}, ['arrows/down-left.png','arrows/down-left-highlighted.png']);
		this.widgets.downleft.action = function (){ units.move('kc35'); this.pulse(150) };
	},
	
	render: function () {
		// Render UI elements
		if(cv.screenMode == 'landscape') this.bannerheight = 100;
		else this.bannerheight = 200;
		
		this.wipe();
		this.renderPlayerTurn();
		this.renderGameTitle();
		this.renderBanner();
		this.renderArrows();
//		cv.UIlayer.fill();
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
		cv.UIlayer.fillRect  (0, window.innerHeight - this.bannerheight, window.innerWidth / cv.Scale, 6);  // now fill the canvas
		cv.UIlayer.fillStyle = config.styles.bannerhigh2; // set banner colour
		cv.UIlayer.fillRect  (0, window.innerHeight - this.bannerheight, window.innerWidth, 2);  // now fill the canvas
//		cv.UIlayer.fillStyle = '#0000FF'; // set banner colour
//		cv.UIlayer.fillRect  (0, window.innerHeight - this.bannerheight + 6, window.innerWidth, 2);  // now fill the canvas
		this.widgets.endturn.render();
		this.widgets.speaker.render();
		
		this.renderCash();
	},
	
	renderPlayerTurn: function () {
		cv.UIlayer.font = "normal 400 40px 'Roboto Condensed'";
		if(game.turn)
		{
			cv.UIlayer.fillStyle = colours.blue;  // TODO: hardcoded
			var text = 'Blue turn';
		}
		else
		{
			cv.UIlayer.fillStyle = colours.red;  // TODO: hardcoded
			var text = 'Red turn';
		}
		cv.UIlayer.shadowOffsetX = 0;
		cv.UIlayer.shadowOffsetY = 0;
		cv.UIlayer.shadowBlur = 5;
		cv.UIlayer.shadowColor = '#552222';  // TODO: hardcoded
		cv.UIlayer.shadowColor = '#FFFFFF';  // TODO: hardcoded
		var x = 13;
		var y = 140;
		cv.UIlayer.fillText(text, x, y);		
		cv.UIlayer.shadowColor = "transparent";
	},
	
	renderGameTitle: function () {
		cv.UIlayer.fillStyle = colours.white;  // TODO: hardcoded
		cv.UIlayer.font = "normal 400 90px 'Roboto Condensed'";
		cv.UIlayer.shadowOffsetX = 0;
		cv.UIlayer.shadowOffsetY = 0;
		cv.UIlayer.shadowBlur = 6;
		cv.UIlayer.shadowColor = '#552222';  // TODO: hardcoded
		var x = 13;
		var y = 90;
		cv.UIlayer.fillText('UTACTICA', x, y);		
		cv.UIlayer.shadowColor = "transparent";		
	},
	
	renderCash: function () {
		// render the current resource 
		cv.UIlayer.font = "normal 400 20px 'Roboto Condensed'";
		cv.UIlayer.fillStyle = config.styles.cashtext; 
		cv.UIlayer.shadowOffsetX = 0;
		cv.UIlayer.shadowOffsetY = 1;
		cv.UIlayer.shadowBlur = 6;
		cv.UIlayer.shadowColor = config.styles.cashtextshadow;
		var x = 70;
		var y = window.innerHeight - 55;
		cv.UIlayer.fillText('Food resources: '+game.foodcash[game.turn], x, y);
		var y = window.innerHeight - 30;
		cv.UIlayer.fillText('Tech resources: '+game.sciencecash[game.turn], x, y);
		cv.UIlayer.shadowColor = "transparent";
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
		else if (code == 'kc32' ) game.endTurn();	// Space bar ends turn
		else if (code == 'kc77' ) ui.widgets.speaker.action();	// Toogle mute status
	},
	
	moveIconFlash: function (code) {
		// Flash the appropriate move icon when a move is attempted
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
		// Darw a test popup window
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
	position: {top: null, right: null, bottom: null, left: null},
	artwork: new Array(),
	state: 0,
	callback: null,
	edges: {top: 0, bottom: 0, right: 0, left: 0},
	
	init: function (position, artwork) {
		// Initialise a new button
		this.position = position;
		this.artwork = artwork;
	},
	
	render: function () {
		//Renders this button to the screen in it's defined location (position need to be recalculated to take into account screen resizing)
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