SoundClass = Class.extend({
	mute: false,
	sounds: {},
	soldiersounds: {},
	music: {},
	track: 0,
	musictag: null,
	
	init: function () {
		// load in all our sound effects
		for( i in config.soundeffects ) {
			var name = config.soundeffects[i]
			this.sounds[name] = new Howl({
				urls: ['_media/'+name+'.ogg'],
				loop: false
			});
		}
		
		
		// load in our music files
		this.musictag = document.createElement('audio');	// Create a html5 audio tag
		this.musictag.setAttribute('src', '_media/dark_intro.ogg');	// set the source to the first track
		this.musictag.play();								// Kick off playback
	},
	
	startGame: function () {
		fisherYates ( config.music ); 						// Shuffle music tracks
		this.musictag.setAttribute('src', '_media/'+config.music[this.track]+'.ogg');	// set the source to the first track
		this.musictag.addEventListener('ended', function() { sound.nextTrack(); });		// add a callback for the end of the tack
		this.musictag.play();								// Kick off playback		
	},

	endGame: function () {
		this.musictag.setAttribute('src', '_media/technogeek.ogg');	// set the source to the first track
		this.musictag.play();								// Kick off playback
	},
	
	playSound: function (name) {
		// Simple interface to play a sound effect
		this.sounds[name].play();
		return this.sounds[name];
	},

	getSoldierSound: function (name) {
		// Simple interface to play a sound effect
		return new Howl({
					urls: ['_media/'+name+'.ogg'],
					loop: true
				});
	},
	
	nextTrack: function () {
		// Change the src of the audio tag to the next music track
		this.track += 1;
		if(this.track > (config.music.length-1)) this.track = 0;
		this.musictag.setAttribute('src', '_media/'+config.music[this.track]+'.ogg');	// Set new src
		this.musictag.play();								// Kick off playback
	},

	toggleMute: function () {
		// Mute or unmute the sound
		if( this.mute )
		{
			this.mute = false;
			Howler.unmute();		// unmute sound effects
			this.musictag.play();	// unpause music
		}
		else
		{
			this.mute = true;
			Howler.mute();			// mute sound effects
			this.musictag.pause();	// pause music
		}
	}

});
