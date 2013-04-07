/*
 *  Code in this file has been sourced from different lcoations on the web. 
 *  They are covered by their own copyright casues, not by the CC BY-NC-SA covering the rest of the code
 *
 */

// Fisher yates randomising code from http://stackoverflow.com/questions/2450954/how-to-randomize-a-javascript-array
var fisherYates = function (myArray) {
	"use strict";
	var i = myArray.length, j, tempi, tempj;
	if (i === 0) { return false; }
	while (--i) {
		if (myArray.hasOwnProperty(i)) {
			j = Math.floor(Math.random() * (i + 1));
			tempi = myArray[i];
			tempj = myArray[j];
			myArray[i] = tempj;
			myArray[j] = tempi;
		}
	}
};


// Rounded corner code from http://js-bits.blogspot.com.au/2010/07/canvas-rounded-corner-rectangles.html
CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius, fill, stroke) {
	"use strict";
	if (stroke === undefined) {
		stroke = true;
	}
	if (radius === undefined) {
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
};

// From the udacity CS255 course
function xhrGet(reqUri, callback, type) {
	"use strict";
    var request = new XMLHttpRequest();
    request.open('GET', reqUri, true);
    if (type) { request.requestType = type; }
    request.onload = function () { callback(request); };
    request.send();
};

// From David Walsh's website http://davidwalsh.name/fullscreen
// Find the right method, call on correct element
function launchFullScreen(element) {
  if(element.requestFullScreen) {
    element.requestFullScreen();
  } else if(element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if(element.webkitRequestFullScreen) {
    element.webkitRequestFullScreen();
  }
};
