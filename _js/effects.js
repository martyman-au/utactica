EffectsClass = Class.extend({
	// Class for effect display and generation (mainly visual animations) sound is triggered from here but runs from SoundClass
	explosion: Array(), 	// stores the frames used to animate explosions
	teleport: Array(), 		// stores the frames used to animate teleports
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
		sound.playSound(sound[name]);
		this.animations.push( new AnimationClass(this[name] ,x ,y ) );
	},

});


AnimationClass = Class.extend({
	// Class defining an instance of an animation effect
	x: null,
	y: null,
	frame: 0,
	frames: new Array(),
	
	init: function (frames, x, y) {
		this.frames = frames;
		this.x = x;
		this.y = y;
	},
	
	drawFrame: function () {
		// Render the next frame to the screen
		if( this.frame >= this.frames.length)
			return 'done';								
		drawSprite(this.frames[this.frame++].id, cv.Effectslayer, this.x, this.y);
	},
});