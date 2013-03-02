// Fisher yates randomising code from http://stackoverflow.com/questions/2450954/how-to-randomize-a-javascript-array
var fisherYates = function ( myArray ) {
  var i = myArray.length, j, tempi, tempj;
  if ( i == 0 ) return false;
  while ( --i ) {
	if (myArray.hasOwnProperty(i))
	{
		j = Math.floor( Math.random() * ( i + 1 ) );
		tempi = myArray[i];
		tempj = myArray[j];
		myArray[i] = tempj;
		myArray[j] = tempi;
	}
  }
};


// Rounded corner code from http://js-bits.blogspot.com.au/2010/07/canvas-rounded-corner-rectangles.html
CanvasRenderingContext2D.prototype.roundRect = 
function(x, y, width, height, radius, fill, stroke) {
	if (typeof stroke == "undefined" ) {
		stroke = true;
	}
	if (typeof radius === "undefined") {
		radius = 5;
	}
	this.beginPath();
	this.moveTo(x + radius, y);
	this.lineTo(x + width - radius, y);
	this.quadraticCurveTo(x + width, y, x + width, y + radius);
	this.lineTo(x + width, y + height - radius);
	this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	this.lineTo(x + radius, y + height);
	this.quadraticCurveTo(x, y + height, x, y + height - radius);
	this.lineTo(x, y + radius);
	this.quadraticCurveTo(x, y, x + radius, y);
	this.closePath();
	if (stroke) {
		this.stroke();
	}
	if (fill) {
		this.fill();
	}        
}


function xhrGet(reqUri, callback, type) {
    request = new XMLHttpRequest;
    request.open('GET', reqUri, true);
    if(type) request.requestType = type;
    request.onload = function () { callback(request);  };
    request.send();
};

// http://www.phpied.com/sleep-in-javascript/
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

/*
//http://stackoverflow.com/questions/1529593/javascript-custom-array-prototype-interfering-with-for-in-loops
Object.keys = function(obj) {
  var a = [];
  for (var property in obj) {
    if (obj.hasOwnProperty(property)) {
      a.push(property);
    }
  }
  return a;
};
*/

function loadfonts() {
	// Google font loader code
	WebFontConfig = {
		google: { families: [ 'Roboto+Condensed:400,700:latin' ] },
		fontactive: function(fontFamily, fontDescription) {
			if(fontFamily == 'Roboto Condensed')
			{
				game.redraw(); // redraw everything once font is available to make sure the canvas is rendered correctly
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