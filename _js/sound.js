SoundClass = Class.extend({
	
	mmmRequest: null,		// The XMLHttp request object for the game music
	context: null,			// audio context
	mainNode: null, 
	mute: false,
	music: null,
	sounds: [],
	
	init: function () {
		// Load in the audio files
		this.context = new webkitAudioContext();
		this.mainNode = this.context.createGainNode(0);
		this.mainNode.connect(this.context.destination);

		for( i in config.soundeffects ) {
			this.sounds[config.soundeffects[i]] = new XMLHttpRequest();
			this.sounds[config.soundeffects[i]].open('GET', '_media/'+config.soundeffects[i]+'.mp3', true );
			this.sounds[config.soundeffects[i]].responseType = 'arraybuffer';
			this.sounds[config.soundeffects[i]].send();
		}		
		
		this.music = new Audio('_media/mmm.mp3');
		this.music.play();

	},

	playSound: function (file) {
		try {
		var clip = this.context.createBufferSource();
		this.context.decodeAudioData(this.sounds[file].response, function (buffer) {
				clip.buffer = buffer;
				clip.connect(sound.mainNode);
				clip.loop = false;
				clip.noteOn(0);
			}, function (data) {});
		}
		catch(e) {
			console.warn('Web Audio API is not supported in this browser');
		}
	},


	toggleMute: function () {
		if( this.mute )
		{
			this.mute = false;
			this.mainNode.gain.value = 1.0;
			this.music.muted = false;
		}
		else
		{
			this.mute = true;
			this.mainNode.gain.value = 0.0;
			this.music.muted = true;
		}
	}
});
