UIClass = Class.extend({
	tiles: new Array(),
	popup: null,
	widgets: {},
	ctx: null,
	
	init: function () {
		this.ctx = cv.layers['ui'].context; // TODO: Hardcoded?

		//fixes a problem where double clicking causes text to get selected on the canvas
		cv.layers['ui'].canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
		
		// add a listner for mouse clicks
		cv.layers['ui'].canvas.addEventListener('mousedown', function(e) {
			if(!game.controlLock) {
				var mouse = cv.getMouse(e);
				var uihit = ui.mouse('mousedown',mouse.x,mouse.y,mouse.sx,mouse.sy);  	// send click to UI click handling code
				if(!uihit) {
					units.mouse('mousedown',mouse.sx,mouse.sy);	// send scaled click to Units if UI failed to hit
				}
			}
		});
		
		cv.layers['ui'].canvas.addEventListener('mouseup', function(e) {
			if(!game.controlLock) {
				var mouse = cv.getMouse(e); // get scaled mouse position from canvas class
				var uihit = ui.mouse('mouseup',mouse.x,mouse.y,mouse.sx,mouse.sy);  	// send click to UI click handling code
				if(!uihit) units.mouse('mouseup',mouse.sx,mouse.sy);	// send scaled click to Units if UI failed to hit
			}
		});

		cv.layers['ui'].canvas.addEventListener('mousemove', function(e) {
			if(!game.controlLock) {
				var mouse = cv.getMouse(e); // get scaled mouse position from canvas class
				units.mouse('mousemove',mouse.sx,mouse.sy);  	// send click to UI click handling code
			}
		});
		
		// Initialise all the User Interface widgets
		this.widgets.speaker = new ImageButtonClass( {left:25,bottom:30}, ['speaker.png', 'speaker_mute.png'], true);
		this.widgets.speaker.action = function (){sound.toggleMute(); };

		this.widgets.endturn = new VectorButtonClass( {right:125,top:40}, 'End turn', 110);
		this.widgets.endturn.action = function (){ game.endTurn(); };
		
		this.widgets.teleport = new VectorButtonClass( {right:125,top:100}, 'Teleport', 110);
		this.widgets.teleport.action = function (){ units.teleport(); };

		this.widgets.buyunits = new VectorButtonClass( {right:125,top:160}, 'Buy Units', 110);
		this.widgets.buyunits.action = function (){ ui.widgets.buyunitspopup.render(); };

		this.widgets.upgrades = new VectorButtonClass( {right:125,top:220}, 'Upgrades', 110);
		this.widgets.upgrades.action = function (){ ui.widgets.upgradespopup.render();  };

		// Define upgrades popup and add buttons
		this.widgets.upgradespopup = new PopupClass( 'Upgrades', 500, 300 );
		this.widgets.upgradespopup.widgets.upgradeattack = new VectorButtonClass( {center:true,top:-60}, 'Soldiers +20% attack (50 science)', 400);
		this.widgets.upgradespopup.widgets.upgradeattack.action = function (){ game.buyUpgrade('attack'); };
		this.widgets.upgradespopup.widgets.upgradeattack.sciencecost = 50;
		this.widgets.upgradespopup.widgets.upgradedefence = new VectorButtonClass( {center:true,top:0}, 'Soldiers +20% defence (50 science)', 400);
		this.widgets.upgradespopup.widgets.upgradedefence.action = function (){ game.buyUpgrade('defence'); };
		this.widgets.upgradespopup.widgets.upgradedefence.sciencecost = 50;
		this.widgets.upgradespopup.widgets.upgradeproduction = new VectorButtonClass( {center:true,top:60}, 'Workers +20% production (100 science)', 400);
		this.widgets.upgradespopup.widgets.upgradeproduction.action = function (){ game.buyUpgrade('production'); };
		this.widgets.upgradespopup.widgets.upgradeproduction.sciencecost = 100;
		
		// Define buy units popup and add buttons
		this.widgets.buyunitspopup = new PopupClass( 'Buy Units', 500, 200 );
		this.widgets.buyunitspopup.widgets.buysoldier = new VectorButtonClass( {center:true,top:-30}, 'New soldier costs 100 food resources', 400);
		this.widgets.buyunitspopup.widgets.buysoldier.action = function (){ game.buyUnit('soldier');};
		this.widgets.buyunitspopup.widgets.buysoldier.foodcost = 100;
		this.widgets.buyunitspopup.widgets.buyworker = new VectorButtonClass( {center:true,top:30}, 'New worker costs 200 food resources', 400);
		this.widgets.buyunitspopup.widgets.buyworker.action = function (){ game.buyUnit('worker');};
		this.widgets.buyunitspopup.widgets.buyworker.foodcost = 200;

		// Define introduction popup
		this.widgets.intropopup = new PopupClass( 'Introduction', 700, 600 );	
		this.widgets.intropopup.div = document.createElement("div");
		this.widgets.intropopup.div.innerHTML = intro;
	},
	
	render: function () {
		// Render UI elements
		var i;
		
		this.wipe();
//		this.renderPlayerTurn();
		this.renderGameTitle();
		this.widgets.speaker.render();
		
		this.renderInfoBlock();		
		
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
		this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
	},
	
	
	renderGameTitle: function () {
		// Display "Utactica"
		this.ctx.fillStyle = colours.white;  // TODO: hardcoded
		this.ctx.font = "normal 400 80px 'Roboto Condensed','Trebuchet MS',sans-serif";
		this.ctx.shadowOffsetX = 0;
		this.ctx.shadowOffsetY = 0;
		this.ctx.shadowBlur = 6;
		this.ctx.shadowColor = '#552222';  // TODO: hardcoded
		var x = 10;
		var y = 80;
		this.ctx.fillText('UTACTICA', x, y);		
		this.ctx.shadowColor = "transparent";		
	},
	
	renderInfoBlock: function () {
		// render the current team's resource totals
		var x = 10;
		var y = 100;
		var w = 170;
		var h = 200;
//		var edgeColor = colours.brightorange;
		var edgeColor = '#888888';
		var background = '#505050';
		
		var col = [x+58, x+74, x+122];
		var row = [210, 230, 250, 270, 290];
		var headings = ['Food','Science','Attack','Defence','Workers'];
		
		this.ctx.shadowOffsetX = 2;
		this.ctx.shadowOffsetY = 2;
		this.ctx.shadowBlur = 12;
		this.ctx.shadowColor = 	'#222222';

		// White outline
		this.ctx.fillStyle = background;
		this.ctx.strokeStyle = '#FFFFFF';
		this.ctx.lineWidth = 12;
		this.ctx.roundRect(x , y, w, h, 9, true, true )

		this.ctx.shadowColor = "transparent";
		this.ctx.strokeStyle = edgeColor;
		this.ctx.lineWidth = 5;		
		this.ctx.roundRect(x , y, w, h, 9, true, true )			
		
		this.ctx.font = "normal 400 21px 'Roboto Condensed','Trebuchet MS',sans-serif";
		this.ctx.translate(col[1]+15, y+90);
		this.ctx.rotate(-70*(3.14159/180));
		this.ctx.fillStyle = colours[config.sides[0].colour];
		this.ctx.fillText('Riveckians', 0, 0);
		this.ctx.rotate(70*(3.14159/180));
		this.ctx.translate(-(col[1]+15), -(y+90));

		this.ctx.translate(col[2]+15, y+90);
		this.ctx.rotate(-70*(3.14159/180));
		this.ctx.fillStyle = colours[config.sides[1].colour];
		this.ctx.fillText('Mecritians', 0, 0);
		this.ctx.rotate(70*(3.14159/180));
		this.ctx.translate(-(col[2]+15), -(y+90));
		
		
		this.ctx.font = "normal 400 16px 'Roboto Condensed','Trebuchet MS',sans-serif";
		this.ctx.fillStyle = config.styles.cashtext; 
		this.ctx.shadowOffsetX = 0;
		this.ctx.shadowOffsetY = 1;
		this.ctx.shadowBlur = 6;
		this.ctx.shadowColor = config.styles.cashtextshadow;

		// Print row headings
		this.ctx.textAlign="end"; 
		for(i in headings) {
			this.ctx.fillText(headings[i]+':', col[0], row[i]);
		}
		this.ctx.textAlign="start"; 
		
		for( i in config.sides )
		{
			if( i == game.turn ) {
				this.ctx.fillStyle = config.styles.cashtext; 
				this.ctx.font = "normal 800 16px 'Roboto Condensed','Trebuchet MS',sans-serif";
			}
			else { 
				this.ctx.fillStyle = colours.lightgrey; 
				this.ctx.font = "normal 400 16px 'Roboto Condensed','Trebuchet MS',sans-serif";
			}
			var idx = parseInt(i)+1;
			this.ctx.fillText(game.foodcash[i], col[idx], row[0]);
			this.ctx.fillText(game.sciencecash[i], col[idx], row[1]);
			this.ctx.fillText('+'+game.attack[i], col[idx], row[2]);
			this.ctx.fillText('+'+game.defence[i], col[idx], row[3]);
			this.ctx.fillText(parseInt(game.production[i]*100)+'%', col[idx], row[4]);
		}

		this.ctx.shadowColor = "transparent";
	},	
	
	mouse: function (event,x,y,sx,sy) {
		// Deal with a click by checking if it hits any UI elements
		if(this.popup && this.popup !== 'closing' && this.popup.clickhit(x,y)) { // if it is a popup click
			this.popup.mouse(event,x,y);	// send click to popup
		}
		else {
			if(event=='mousedown' && this.popup) // If there is a popup then close it and exit
			{
				if( this.popup.div ) {
					var div = document.getElementById('popupdiv')
					div.parentNode.removeChild(div);
				}
				this.popup = 'closing';
				return true;
			}
			if(event=='mouseup' && this.popup == 'closing') // If there is a popup then close it and exit
			{
				this.popup = false;
				this.redraw();
				return true;
			}			
			var i = null;
			for( i in this.widgets )	// Check if the click hits any widgets
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
	
	greyWidgets: function () {
		for( i in this.widgets ) {
			var widget = this.widgets[i];
			if( widget.widgets !== undefined ) { // check for sub widgets
				for( j in widget.widgets ) {
					if(widget.widgets[j].foodcost > game.foodcash[game.turn]) widget.widgets[j].greyed = true;
					else if(widget.widgets[j].sciencecost > game.sciencecash[game.turn]) widget.widgets[j].greyed = true;
					else widget.widgets[j].greyed = false;
				}
			}
			else
			{
				if(widget.foodcost > game.foodcash[game.turn]) widget.greyed = true;
				else if(widget.sciencecost > game.sciencecash[game.turn]) widget.greyed = true;
				else widget.greyed = false;
			}
		}
	}
});


WidgetClass = Class.extend({
	// Base widget class for the UTACTICA UI used to create all widget types
	position: {top: null, right: null, bottom: null, left: null},
	state: 0,
	edges: {top: 0, bottom: 0, right: 0, left: 0},
	display: true,
	ctx: null,
	greyed: false,
	foodcost: 0,
	sciencecost: 0,
	
	init: function () {
	},
	
	toggleState: function () {
		// Toggle this button between it's two first states, if a widget is in a third or higher state reset it to it's first
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
		if( x >= this.edges.left && x <= this.edges.right && y >= this.edges.top && y <= this.edges.bottom && !this.greyed)
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
		this.ctx = cv.layers['ui'].context; // TODO: Hardcoded?
	},
	
	render: function () {
		//Renders this button to the screen in it's defined location (position is recalculated to take into account screen resizing)
		if(this.position.left) this.position.x = this.position.left; 	// calc the x position based on right or left screen edge offsets
		else this.position.x = window.innerWidth-this.position.right;
		if(this.position.top) this.position.y = this.position.top;		// calc the y position based on top or bottom screen edge offsets
		else this.position.y = window.innerHeight-this.position.bottom;		
		drawSprite(this.artwork[this.state], this.ctx, this.position.x, this.position.y);	// draw the button sprite at the calculated position
		
		//re-calculate edges for click hit matching
		this.edges.top = this.position.y - (sprites.getStats(this.artwork[this.state]).h / 2);
		this.edges.bottom = this.position.y + (sprites.getStats(this.artwork[this.state]).h / 2);
		this.edges.left = this.position.x - (sprites.getStats(this.artwork[this.state]).w / 2);
		this.edges.right = this.position.x + (sprites.getStats(this.artwork[this.state]).w / 2);
	},
});

VectorButtonClass = ButtonClass.extend({
	// Used to create procedural ui buttons
	ctx: null,
	text: '',
	size: {w: 0, h: 0},
	shadowOffset: {x:2,y:2},
	shadowBlur: 12,
	shadowColor: '#222222',
	edgeColor: colours.brightorange,
	
	init: function (position, text, width) {
		// Initialise a new button
		this.position = position;
		this.text = text;
		if( typeof width === "undefined" ) this.size.w = this.text.length * 12;
		else this.size.w = width;
		this.size.h = 35;
		this.ctx = cv.layers['ui'].context; // TODO: Hardcoded?
	},
	
	render:  function () {
		// render button to screen in it's defined location (position is recalculated to take into account screen resizing)
		if(this.position.center) {
			this.position.x = (window.innerWidth/2) - this.size.w/2;
			this.position.y = (window.innerHeight/2) + this.position.top;
		}
		else {
			if(this.position.left) this.position.x = this.position.left; 	// calc the x position based on right or left screen edge offsets
			else this.position.x = window.innerWidth-this.position.right;
			if(this.position.top) this.position.y = this.position.top;		// calc the y position based on top or bottom screen edge offsets
			else this.position.y = window.innerHeight-this.position.bottom;		
		}
		
		if(this.greyed) {
			this.state = 0;
			this.edgeColor = '#888888';
		}
		else {
			this.edgeColor = colours.brightorange;
		}
		
		if( this.state === 1) { // add an offset if the button is currently clicked
			this.position.x = this.position.x + 1;
			this.position.y = this.position.y + 2;
		}
		
//		this.ctx.shadowColor = "transparent";
		if( this.state === 0) { // if normal state add shadow
			this.ctx.shadowOffsetX = this.shadowOffset.x;
			this.ctx.shadowOffsetY = this.shadowOffset.y;
			this.ctx.shadowBlur = this.shadowBlur;
			this.ctx.shadowColor = this.shadowColor;
		}
		// White outline
		this.ctx.fillStyle = config.styles.buttonbg;
		this.ctx.strokeStyle = '#FFFFFF';
		this.ctx.lineWidth = 12;
		this.ctx.roundRect(this.position.x , this.position.y, this.size.w, this.size.h, 9, true, true )

		this.ctx.shadowColor = "transparent";
		
		this.ctx.strokeStyle = this.edgeColor;
		this.ctx.lineWidth = 7;		
		this.ctx.roundRect(this.position.x , this.position.y, this.size.w, this.size.h, 9, true, true )
		
		this.ctx.font = "normal 400 25px 'Roboto Condensed','Trebuchet MS',sans-serif";
		this.ctx.textAlign = 'center';
		this.ctx.fillStyle = '#222222';
		var x = this.position.x + this.size.w/2;
		var y = this.position.y + this.size.h/2 + 8;
		this.ctx.fillText(this.text, x, y);
		this.ctx.textAlign = 'start';

		//re-calculate edges for click hit matching
		this.edges.top = this.position.y - 5 ;		
		this.edges.bottom = this.position.y + this.size.h + 5;
		this.edges.left = this.position.x - 5;
		this.edges.right = this.position.x + this.size.w + 5;
	}
});

PopupClass = WidgetClass.extend({
	// Display popup information
	ctx: null,
	display: false,
	size: {w: 0, h: 0},
	radius: 0,
	widgets: {},
	div: null,

	init: function (title, width, height) {
		// Is this where we should set all of the popup's contents?
		this.size.h = height;
		this.size.w = width;
		this.radius = 30;
		this.title = title;
		this.ctx = cv.layers['ui'].context; // TODO: Hardcoded?
	},
	
	render: function () {
		// Renders this popup to the screen
		this.position.x = (window.innerWidth-this.size.w)/2;		// center in the x direction
		this.position.y = (window.innerHeight-this.size.h)/2;		// center in the y direction
		this.edges.top = this.position.y - 10 ;						//re-calculate edges for click hit matching
		this.edges.bottom = this.position.y + this.size.h + 10;		//re-calculate edges for click hit matching
		this.edges.left = this.position.x - 10;						//re-calculate edges for click hit matching
		this.edges.right = this.position.x + this.size.w + 10;		//re-calculate edges for click hit matching
		
		ui.popup = this; // set the ui global popup variable to point to this popup
		
		// grey out the background
		this.ctx.fillStyle = config.styles.popupgreyout;
		this.ctx.fillRect(0,0,window.innerWidth,window.innerHeight);
		
		// setup shadow
		this.ctx.shadowOffsetX = 1;
		this.ctx.shadowOffsetY = 1;
		this.ctx.shadowBlur = 25;
		this.ctx.shadowColor = '#222222';
		
		this.ctx.fillStyle = '#E0E0B0';
		this.ctx.strokeStyle = '#FFFFFF';
		this.ctx.lineWidth = 15;
		this.ctx.roundRect((window.innerWidth-this.size.w)/2 , (window.innerHeight-this.size.h)/2, this.size.w, this.size.h, this.radius, config.styles.bannerbg );
		
		this.ctx.strokeStyle = colours.brightorange;
		this.ctx.lineWidth = 7;		
		this.ctx.fillStyle = config.styles.popupbg;
		this.ctx.shadowColor = "transparent";
		this.ctx.roundRect((window.innerWidth-this.size.w)/2 , (window.innerHeight-this.size.h)/2, this.size.w, this.size.h, this.radius, config.styles.bannerbg );
		
		if(this.title) this.renderTitle(); // if a title exists render it to the popup window
		
		for( i in this.widgets ) this.widgets[i].render();
		
		if(this.div) {
			this.div.style.width = this.size.w + "px";
			this.div.style.height = this.size.h + "px";
			this.div.style.position = "absolute";
			this.div.style.left = (window.innerWidth - this.size.w)/2 + 'px';
			this.div.style.top = (window.innerHeight - this.size.h)/2 + 'px';
			this.div.style.color = 'black';
			this.div.id = 'popupdiv';
			document.body.appendChild(this.div);
		}
	},
	
	renderTitle: function () {
		// Render title text onto the popup window
		this.ctx.font = "normal 400 40px 'Roboto Condensed','Trebuchet MS',sans-serif";
		this.ctx.textAlign = 'center';
		this.ctx.fillStyle = '#222222';
		var x = this.position.x + this.size.w/2;
		var y = this.position.y + 40;
		this.ctx.fillText(this.title, x, y);
		this.ctx.textAlign = 'start';
	},
	
	mouse: function (event,x,y) {
		for( i in this.widgets )	// Check if the click hits any widgets
		{
			var widget = this.widgets[i]
			if( widget.display && widget.clickhit(x,y) )
			{
				widget.mouse(event,x,y);
				return true;
			}
		}
	},

	greyWidgets: function () {
		for( i in this.widgets ) {
			if(this.widgets[i].foodcost > game.foodcash[game.turn]) this.widgets[i].greyed = true;
			else if(this.widgets[i].sciencecost > game.sciencecash[game.turn]) this.widgets[i].greyed = true;
			else this.widgets[i].greyed = false;
		}
	}
});