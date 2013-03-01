EffectsClass = Class.extend({
	// Class for effect display and generation (mainly visual animations) sound is triggered from here but runs from SoundClass
	explosion: Array(), 	// stores the frames used to animate explosions
	teleport: Array(), 		// stores the frames used to animate teleports
	active: Array(), 		// stores the frames used to animate the active unit
	animTimer: {},			// Stores the setInterval timer used to run the effect animations (only one at once)
	animations: new Array(),// Array of AnimationClasses populated and cleared before and after each effect
	
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
		
		this.animTimer = setInterval( function(){effects.animFrame();}, 30);
	},

	wipe: function () {
		// Clear the effects layer (usually between frames)
		// TODO: would it be better to just clear the required area?
		// TODO: this should query the locations of all of the current effects and clear them
		cv.Effectslayer.clearRect(0, 0, window.innerWidth / cv.Scale, window.innerHeight / cv.Scale);
	},

	animFrame: function () {
		// Called every 30ms by this.animTimer
		this.wipe();
		for( i in this.animations )
		{
			if( this.animations[i].drawFrame() == 'done')
				delete this.animations[i];
		}
		
	},

	renderEffect: function (name, x, y) {
		// Create an effect using AnimationClass
		if( config.animations[name].sound ) sound.playSound(sound[name]);
		this.animations.push( new AnimationClass(name, this[name] ,x ,y ) );
	},
	
	deleteAnimation: function (name) {
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
	inc: 1,
	
	init: function (name, frames, x, y) {x
		this.name = name;
		this.frames = frames;
		this.x = x;
		this.y = y;
	},
	
	drawFrame: function () {
		// Render the next frame to the screen
		this.count++;
		if(!(this.count % config.animations[this.name].rate)) this.frame = this.frame + this.inc;
		
		if( this.frame >= this.frames.length && config.animations[this.name].playback == 'once' ) return 'done';
		else if(( this.frame >= (this.frames.length - 1) || this.frame <= 0 ) && config.animations[this.name].playback == 'bounce') this.inc = this.inc * -1;  // TODO: still bugs in the franme rate code 

		drawSprite(this.frames[this.frame].id, cv.Effectslayer, this.x, this.y);
	},
});