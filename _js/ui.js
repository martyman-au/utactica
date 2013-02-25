UIClass = Class.extend({
	tiles: new Array(),
	bannerheight: 100,
	popup: false,
	
	init: function () {
		//fixes a problem where double clicking causes text to get selected on the canvas
		cv.cnvUI.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
		
		// add a listner for mouse clicks
		cv.cnvUI.addEventListener('mousedown', function(e) {
			var mouse = cv.getMouse(e);
			ui.click(mouse.x,mouse.y,mouse.sx,mouse.sy);  	// send click to UI click handling code
//			units.click(mouse.sx,mouse.sy);	// send scaled click to Units
		});
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
//		cv.UIlayer.drawImage(end_turn_button, window.innerWidth - 245, window.innerHeight - this.bannerheight + 2);
		drawSprite('end-turn-button.png', cv.UIlayer, window.innerWidth - 122, window.innerHeight - this.bannerheight + 50);
	},
	
	renderArrows: function () {
		drawSprite('arrows/up-right.png', cv.UIlayer, window.innerWidth - 40, 40);
		drawSprite('arrows/up.png', cv.UIlayer, window.innerWidth - 100, 40);
		drawSprite('arrows/up-left.png', cv.UIlayer, window.innerWidth - 160, 40);
		drawSprite('arrows/down-right.png', cv.UIlayer, window.innerWidth - 40, 120);
		drawSprite('arrows/down.png', cv.UIlayer, window.innerWidth - 100, 120);
		drawSprite('arrows/down-left.png', cv.UIlayer, window.innerWidth - 160, 120);
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
//		elseif( 0 ) arrowclick();
		else units.click(sx,sy);	// send scaled click to Units
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
//		console.log(e.keyCode);
//	sound.playMusic(sound.boomRequest);

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