EffectsClass = Class.extend({
	// Class for effect display and generation (mainly visual animations) sound is triggered from here but runs from SoundClass
	frames: {},
	explosion: Array(), 	// stores the frames used to animate explosions
	teleport: Array(), 		// stores the frames used to animate teleports
	active: Array(), 		// stores the frames used to animate the active unit
	animations: new Array(),// Array of AnimationClasses populated and cleared before and after each effect
	
	init: function () {
		// Initialise efffects object
		// Load effect sprites into local arrays
		// Start animation timer
		this.loadFrames();
		requestAnimationFrame( function(){effects.animFrame();} );
	},

	loadFrames: function () {
		// Load the frames defined in config.js into this.frames
		for( i in config.animsf )
		{
			this.frames[i] = new Array();
			var id = config.animsf[i].id;
			var frames = sprites.getType(i);
			for( j in Object.keys(frames) )
			{
//				var index = frames[j].id.substring( id[0], id[1] );
				this.frames[i].push(frames[j]);
			}
		}
	},
	
	wipe: function () {
		// Clear the effects layer (usually between frames)
		// TODO: would it be better to just clear the required area?
		// TODO: this should query the locations of all of the current effects and clear them
		cv.Effectslayer.clearRect(0, 0, window.innerWidth / cv.Scale, window.innerHeight / cv.Scale);
	},

	animFrame: function () {
		// Called every 30ms by this.animTimer
		this.wipe();				// wipe the effects layer
		for( i in this.animations )	// for all the current animations
		{
			if( this.animations[i].drawFrame() == 'done') 	// render the animations
				delete this.animations[i];					// if the animation is done, delete it
		}
		requestAnimationFrame( function(){effects.animFrame();} );	// kick off another animation frame request
	},

	renderEffect: function (name, x, y) {
		// Create an effect using AnimationClass
		if( config.animsf[name].sound ) sound.playSound(sound[name]);
		this.animations.push( new AnimationClass(name, this.frames[name] ,x ,y ) );
	},

	renderVector: function (name,start,end) {
		// Create an effect using VectorClass
		if( config.animsv[name].sound ) sound.playSound(sound[name]);
		this.animations.push( new VectorClass(name,start,end) );
	},
	
	deleteAnimation: function (name) {
		// delete a running animation
		for( i in this.animations )
		{
			if(this.animations[i].name == name) delete this.animations[i];
		}
	},
});


AnimationClass = Class.extend({
	// Class defining an instance of an animation effect
	x: null,
	y: null,
	frame: 0,
	frames: new Array(),
	name: '',
	count: 0,
	inc: 1,		// used for reversing the frame playing direction
	rate: 0,
	playback: null,
	lastframe: 0,
	
	init: function (name, frames, x, y) {
		// Initialise a new vector animation effect
		this.name = name;
		this.frames = frames;
		this.x = x;
		this.y = y;
		this.rate = config.animsf[this.name].rate;
		this.playback = config.animsf[this.name].playback;
	},
	
	drawFrame: function () {
		// Render the next frame to the screen
		var now = Date.now();
		if( now - this.lastframe > ( 1000 / this.rate ))
		{
			this.lastframe = now;
			this.frame = this.frame + this.inc;
		}
		if( this.frame >= this.frames.length && this.playback == 'once' ) return 'done';				// signal the deletion of this animation
		else if(( this.frame >= (this.frames.length - 1)) && this.playback == 'bounce') this.inc = -1;  // start counting back down
		else if(( this.frame <= 0 ) && this.playback == 'bounce') this.inc = 1;  						// start counting back up
		drawSprite(this.frames[this.frame].id, cv.Effectslayer, this.x, this.y);						// render the current frame to the canvas
	},
});

VectorClass = Class.extend({
	// Class defining an instance of a vector animation effect
	name: '',			// name of vector animation type
	start: {x:0,y:0},	// starting position of vector
	end: {x:0,y:0},		// end position of vector
	length: 0,			// Duration of vector animation in milliseconds
	ctx: null,			// reference to the effect canvas context
	animstart: null,	// time the the vector animation started playing
	
	init: function (name, start, end) {
		// initialise a vector animation
		this.name = name;
		this.start = start;
		this.end = end;
		this.ctx = cv.Effectslayer;
		this.animstart = Date.now();	// grab current time for the begining of the animation
		this.length = config.animsv[this.name].length;	// load animation duration from config
		if(this.name == 'beam')
		{
			this.drawFrame = function () { // define drawFrame() for 'beam' animation
				var percent = ((Date.now()-this.animstart) / this.length)		// calculate how far through the animation we are
				this.drawline(this.start,this.end,6,'rgba(255,255,56,0.3)');	// render a line from teh starting to the ending point
				this.drawcircle(this.interpolate(start,end,percent), 20, 'rgba(255,255,56,0.3)');	// render a moving circle
				if(percent >= 1) return 'done';			// if we have hit 100% of the animation signal it's deletion
			};
		}
	},
	
	interpolate: function (start, end, fraction) {
		// Simple linear interpolation a "fraction" of the distance between two points
		var x = start.x + (end.x - start.x) * fraction;
		var y = start.y + (end.y - start.y) * fraction;
		return { x: x, y: y};
	},
	
	drawline: function (start,end,width,color) {
		// Render a line on the effects canvas
		this.ctx.beginPath();
		this.ctx.moveTo(start.x,start.y);
		this.ctx.lineTo(end.x,end.y);
		this.ctx.lineWidth = width;
		this.ctx.strokeStyle = color;
		this.ctx.stroke();
	},
	
	drawcircle: function (point, diameter, color) {
		// Render a circle on the effects canvas
		this.ctx.beginPath();
		this.ctx.arc(point.x, point.y, diameter, 0, 2 * Math.PI, false);
		this.ctx.fillStyle = color;
		this.ctx.fill();
	},
	
});