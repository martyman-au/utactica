EffectsClass = Class.extend({
	
	explosion: Array(), 	// stores the frames used to animate explosions
	teleport: Array(), 	// stores the frames used to animate explosions
	effectframe: 0,		// Keeps track of the frame we are up to in the running explosion animation
	effecttimer: null,	// Stores the setInterval timer used to run the explosion animation
	boomRequest: null,		// The XMLHttp request object for the boom sound effect
	teleportRequest: null,		// The XMLHttp request object for the teleport sound effect
	
	init: function (sprites) {
		var i = null;
		var version = null;
		var index = null;
		var frames = sprites.getType('explosions');
		for( i in Object.keys(frames) )
		{
			version = frames[i].id.substring( 20, 21 );
			index = frames[i].id.substring( 22, 24 );
			if(version ==2) this.explosion.push(frames[i]);
		}
		
	},

	wipe: function () {
		// Clear the effects layer (usually between frames)
		cv.Effectslayer.clearRect(0, 0, window.innerWidth / cv.Scale, window.innerHeight / cv.Scale);
	},

	runExplosion: function (x,y) {
		// Render an explosion at the x and y co-ordinates
		clearInterval(this.effecttimer);
		this.effectframe = 0;
		this.playSound(this.boomRequest.response);
		this.effecttimer = setInterval( function() {
			effects.wipe();
			if( effects.effectframe == 15)
			{
				effects.effectframe = 0;
				clearInterval(effects.effecttimer);
				return;
			}
			drawSprite(effects.explosion[effects.effectframe++].id, cv.Effectslayer, x, y);
		},60);
	},

		runTeleport: function (x,y) {
		// Render an explosion at the x and y co-ordinates
		clearInterval(this.effecttimer);
		this.effectframe = 0;
		this.playSound(this.teleportRequest.response);
		this.effecttimer = setInterval( function() {
			effects.wipe();
			if( effects.effectframe == 15)
			{
				effects.effectframe = 0;
				clearInterval(effects.effecttimer);
				return;
			}
			drawSprite(effects.teleport[effects.effectframe++].id, cv.Effectslayer, x, y);
		},60);
	},
	

});
