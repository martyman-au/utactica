var sprites = {};
var cv = {};
var board = {};
var units = {};
var effects = {};
var ui = {};
var sound = {};

var loadData = function() {
	
	sprites = new SpriteSheetClass();
	sprites.load('http://people.physics.anu.edu.au/~martin/utactica/_media/sprites.png');

	// now load json defining the sprite sheet
	var spritejson = new XMLHttpRequest();
	jsonURL = 'http://people.physics.anu.edu.au/~martin/utactica/_media/sprites.json';
	spritejson.open("GET", jsonURL, true);
	spritejson.onload = function() {
					sprites.parseAtlasDefinition(this.responseText);
					setupGame();							// TODO: Probably not the best spot to be calling this code?
				};
	spritejson.send();
	
	// Google font loader code
	WebFontConfig = {
		google: { families: [ 'Roboto+Condensed:400,700:latin' ] },
		fontactive: function(fontFamily, fontDescription) {
			if(fontFamily == 'Roboto Condensed')
			{
				redraw(); // redraw everything once font is available to make sure the canvas is rendered correctly
			}
		}
	};
	(function() {
		var wf = document.createElement('script');
		wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
		'://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
		wf.type = 'text/javascript';
		wf.async = 'true';
		var s = document.getElementsByTagName('script')[0];
		s.parentNode.insertBefore(wf, s);
	})(); 

};

var setupGame = function() {
		
	// Create objects to look after game output, data and logic
	cv = new CanvasClass();  						// canvas layers and contexts
	board = new BoardClass(config.boardPattern);	// board and tiles
	units = new UnitsClass();						// units
	effects = new EffectsClass(sprites); 			// effects (animations, etc)			
	ui = new UIClass();								// user interface
	sound = new SoundClass();						// all sound output (music, effects)
	
	window.onkeydown = ui.keypress;	 // TODO: best place for this?
	cv.setScale();		// TODO: not sure about this line and the next
	redraw();			// ditto
};

	
var redraw = function() {
	// re-draw all of the game layers
	// TODO: should we be wiping here, or calling built in redraw funcitons?
	board.render(); // render the playing board
	units.render(); // render the playing board
	ui.render();	// render the user interface	
}

window.onresize = function(event) {  // on resize we should reset the canvas size and scale and redraw the board, ui and units
	cv.setScale();
	board.render();
	units.render();
	ui.render();
}

loadData();
