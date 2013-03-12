SoundClass = Class.extend({
	mute: false,
	sounds: {},
	music: {},
	track: 0,
	musictag: null,
	
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
		this.musictag = document.createElement('audio');
		this.musictag.setAttribute('src', '_media/'+config.music[this.track]+'.ogg');
		this.musictag.addEventListener('ended', function() { sound.nextTrack(); });
		this.musictag.play();
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
		this.musictag.setAttribute('src', '_media/'+config.music[this.track]+'.ogg');		
		this.musictag.play();
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
