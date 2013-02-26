EffectsClass = Class.extend({
	// Class for effect display and generation (mainly visual animations) sound is triggered from here but runs from SoundClass
	explosion: Array(), 	// stores the frames used to animate explosions
	teleport: Array(), 		// stores the frames used to animate explosions
	effectframe: 0,			// Keeps track of the frame we are up to in the running current effect animation
	effecttimer: null,		// Stores the setInterval timer used to run the effect animations (only one at once)
	
	init: function () {
		// Initialise effects, load sprites into arrays
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
	},

	wipe: function () {
		// Clear the effects layer (usually between frames)
		// TODO: would it be better to just clear the required area?
		cv.Effectslayer.clearRect(0, 0, window.innerWidth / cv.Scale, window.innerHeight / cv.Scale);
	},

	runExplosion: function (x,y) {
		// Render an explosion effect at the x and y co-ordinates
		clearInterval(this.effecttimer);
		this.effectframe = 0;
		sound.playSound(sound.boomRequest);
		this.effecttimer = setInterval( function() {
			effects.wipe();					// clear effects layer
			if( effects.effectframe == 15)	// if ew have reached the end TODO: hardcoded
			{
				effects.effectframe = 0;			// reset frame counter
				clearInterval(effects.effecttimer);	//clear animation timer
				return;
			}
			drawSprite(effects.explosion[effects.effectframe++].id, cv.Effectslayer, x, y);
		},60);
	},

		runTeleport: function (x,y) {
		// Render a teleport effect at the x and y co-ordinates
		clearInterval(this.effecttimer);
		this.effectframe = 0;
		sound.playSound(sound.teleportRequest);
		this.effecttimer = setInterval( function() {
			effects.wipe();					// clear effects layer
			if( effects.effectframe == 12)	// if we have reached the end TODO: hardcoded
			{
				effects.effectframe = 0;			// reset frame counter
				clearInterval(effects.effecttimer);	// clear animation timer
				return;								
			}
			drawSprite(effects.teleport[effects.effectframe++].id, cv.Effectslayer, x, y); // TODO: need to create teleport effect
		},30);
	},

});
