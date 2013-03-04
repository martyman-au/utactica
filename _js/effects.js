EffectsClass = Class.extend({
	// Class for effect display and generation (mainly visual animations) sound is triggered from here but runs from SoundClass
	explosion: Array(), 	// stores the frames used to animate explosions
	teleport: Array(), 		// stores the frames used to animate teleports
	active: Array(), 		// stores the frames used to animate the active unit
	animTimer: {},			// Stores the setInterval timer used to run the effect animations (only one at once)
	animations: new Array(),// Array of AnimationClasses populated and cleared before and after each effect
//	animstart: null,
	
	init: function () {
		// Initialise efffects
		// Load effect sprites into local arrays
		// Start animation timer
		var i = null;
		var version = null;
		var index = null;

		var frames = sprites.getType('explosions');
		for( i in Object.keys(frames) )
		{
			index = frames[i].id.substring( 22, 24 );
			this.explosion.push(frames[i]); // TODO: hardcoded
		}
		
		var frames = sprites.getType('teleport');
		for( i in Object.keys(frames) )
		{
			index = frames[i].id.substring( 10, 12 );
			this.teleport.push(frames[i]); // TODO: hardcoded
		}

		var frames = sprites.getType('active');
		for( i in Object.keys(frames) )
		{
			index = frames[i].id.substring( 7, 9 );
			this.active.push(frames[i]); // TODO: hardcoded
		}
		
//		this.animTimer = setInterval( function(){effects.animFrame();}, 10); // Create a permamently running animation timer
//		this.start = Date.now();
		requestAnimationFrame( function(){effects.animFrame();} );
	},

	wipe: function () {
		// Clear the effects layer (usually between frames)
		// TODO: would it be better to just clear the required area?
		// TODO: this should query the locations of all of the current effects and clear them
		cv.Effectslayer.clearRect(0, 0, window.innerWidth / cv.Scale, window.innerHeight / cv.Scale);
//		cv.Effectslayer.Children.Remove();
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
		if( config.animations[name].sound ) sound.playSound(sound[name]);
		this.animations.push( new AnimationClass(name, this[name] ,x ,y ) );
	},

	renderVector: function (name,start,end) {
		// Create an effect using VectorClass
		if( config.animations[name].sound ) sound.playSound(sound[name]);
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
		this.name = name;
		this.frames = frames;
		this.x = x;
		this.y = y;
		this.rate = config.animations[this.name].rate;
		this.playback = config.animations[this.name].playback;
	},
	
	drawFrame: function () {
		// Render the next frame to the screen
		var now = Date.now();
		if( now - this.lastframe > ( 1000 / this.rate ))
		{
			this.lastframe = now;
			this.frame = this.frame + this.inc;
		}
		console.log(this.frame);
		if( this.frame >= this.frames.length && this.playback == 'once' ) return 'done';
		else if(( this.frame >= (this.frames.length - 1)) && this.playback == 'bounce') this.inc = -1;  // TODO: still bugs in the franme rate code 
		else if(( this.frame <= 0 ) && this.playback == 'bounce') this.inc = 1;  // TODO: still bugs in the franme rate code 
		drawSprite(this.frames[this.frame].id, cv.Effectslayer, this.x, this.y);
	},
});

VectorClass = Class.extend({
	// Class defining an instance of a vector animation effect
	start: {x:0,y:0},
	end: {x:0,y:0},
	count: 0,
	length: 0,
	ctx: null,
	
	init: function (name, start, end) {
		this.start = start;
		this.end = end;
		this.ctx = cv.Effectslayer;
		if(name == 'beam')
		{
			this.length = 20;
			this.drawFrame = function () {
				this.drawline(this.start,this.end,6,'rgba(255,255,56,0.3)');
				this.drawcircle(this.interpolate(start,end,(this.count / this.length)), 20, 'rgba(255,255,56,0.3)');
				if(this.count++ > this.length) return 'done';			
			};
		}
	},
	
	interpolate: function (start, end, distance) {
		var x = start.x + (end.x - start.x) * distance;
		var y = start.y + (end.y - start.y) * distance;
		return { x: x, y: y};
	},
	
	drawline: function (start,end,width,color) {
		this.ctx.beginPath();
		this.ctx.moveTo(start.x,start.y);
		this.ctx.lineTo(end.x,end.y);
		this.ctx.lineWidth = width;
		this.ctx.strokeStyle = color;
		this.ctx.stroke();
	},
	
	drawcircle: function (point, diameter, color) {
		this.ctx.beginPath();
		this.ctx.arc(point.x, point.y, diameter, 0, 2 * Math.PI, false);
		this.ctx.fillStyle = color;
		this.ctx.fill();
	},
	
});