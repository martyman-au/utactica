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
				urls: ['_media/'+name+'.mp3', '_media/'+name+'.ogg'],
				loop: false
			});
		}
		// load in our music files
		for( i in config.music ) {
			var name = config.music[i]
			this.music[name] = new Howl({
				urls: ['_media/'+name+'.mp3', '_media/'+name+'.ogg'],
				loop: false,
				volume:0.7,
				onend: function () {sound.nextTrack()}
			});
		}
		this.music[config.music[this.track]].play(); // Start the music playing
	},
	
	playSound: function (name) {
		this.sounds[name].play();
	},
	
	nextTrack: function () {
		this.track += 1;
		if(this.track > (config.music.length-1)) this.track = 0
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
