var sprites = {};
var cv = {};
var board = {};
var units = {};
var effects = {};
var ui = {};
//var myLoader = {};


var loadData = function() {
	
//	myLoader = html5Preloader();
//	myLoader.addFiles('boom*:boom.mp3', 'teleport*:teleport.mp3');
	
	sprites = new SpriteSheetClass();
	sprites.load('http://people.physics.anu.edu.au/~martin/utactica/_media/sprites.png');

	jsonURL = 'http://people.physics.anu.edu.au/~martin/utactica/_media/sprites.json';
	var spritejson = new XMLHttpRequest();
	spritejson.open("GET", jsonURL, true);
	spritejson.onload = function() {
					json = this.responseText;
					sprites.parseAtlasDefinition(json);
					setupGame();
				};
	spritejson.send();
	
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
	effects = new EffectsClass(sprites); // effects (animations, etc)			
	ui = new UIClass();								// user interface
	
	window.onkeydown = ui.keypress;
	cv.setScale();
	redraw();
//	window.setInterval(function(){redraw()},1000);

};



	
var redraw = function() {
	board.render(); // render the playing board
	units.render(); // render the playing board
//	effects.render(); // render the playing board
	ui.render();	// render the user interface	
}

window.onresize = function(event) {  // on resize we should reset the canvas size and scale and redraw the board, ui and units
	cv.setScale();
	board.render();
	units.render();
//	effects.render();
	ui.render();
}

loadData();
