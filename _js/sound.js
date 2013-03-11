SoundClass = Class.extend({
	mute: false,
	sounds: {},
	music: {},
	track: 0,
	
	init: function () {
		// load in all our sound effects
		for( i in config.soundeffects ) {
			var name = config.soundeffects[i]
			this.sounds[name] = new Howl({
				urls: ['_media/'+name+'.ogg', '_media/'+name+'.mp3'],
				loop: false
			});
		}
		// load in our music files
		fisherYates ( config.music ); // Shuffle music tracks
		for( i in config.music ) {
			var name = config.music[i]
			if( i == 0 ) { // only load in the first song to save bandwidth
				this.music[name] = new Howl({
					urls: ['_media/'+name+'.ogg'],
					loop: false,
					volume:0.7,
					onend: function () {sound.nextTrack()}
				});
			}
			else this.music[name] = null;
		}
		this.music[config.music[this.track]].play(); // Start the music playing
	},
	
	animFrame: function () {
		// Called once per animation frame, used to check song position and start downloading of next track
		// TODO: We could check the current track position and kick off the next track download if needed
	},
	
	playSound: function (name) {
		this.sounds[name].play();
	},
	
	nextTrack: function () {
		this.track += 1;
		if(this.track > (config.music.length-1)) this.track = 0;
		if( this.music[config.music[this.track]] == null ) {	// If we haven't loaded the next track yet
			this.music[config.music[this.track]] = new Howl({	// TODO: this is going to cause a pause.. 
					urls: ['_media/'+config.music[this.track]+'.ogg'],
					loop: false,
					volume:0.7,
					onend: function () {sound.nextTrack()}
				});
		}
		this.music[config.music[this.track]].play();
	},

	toggleMute: function () {
		if( this.mute )
		{
			this.mute = false;
			Howler.unmute();
		}
		else
		{
			this.mute = true;
			Howler.mute();
		}
	}

});
