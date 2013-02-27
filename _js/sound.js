SoundClass = Class.extend({
	
	mmmRequest: null,		// The XMLHttp request object for the game music
	context: null,			// audio context
	mainNode: null, 
	mute: false,
	
	init: function () {
		// Load in the audio files
		this.context = new webkitAudioContext();
		this.mainNode = this.context.createGainNode(0);
		this.mainNode.connect(this.context.destination);

		// TODO: can we deduplicate this?
		this.mmmRequest = new XMLHttpRequest();
		this.mmmRequest.open('GET', '_media/Man-Made Messiah v0_8.mp3', true );
		this.mmmRequest.responseType = 'arraybuffer';
		this.mmmRequest.send();
		this.mmmRequest.onload = function () { sound.playMusic(sound.mmmRequest); } // Start music as soon as it is loaded

		this.boomRequest = new XMLHttpRequest();
		this.boomRequest.open('GET', '_media/boom.mp3', true );
		this.boomRequest.responseType = 'arraybuffer';
		this.boomRequest.send();

		this.teleportRequest = new XMLHttpRequest();
		this.teleportRequest.open('GET', '_media/teleport.mp3', true );
		this.teleportRequest.responseType = 'arraybuffer';
		this.teleportRequest.send();


	},

	// TODO: do playMusic and playSound have to be seperate functions?
	playMusic: function (file) {
		try {
		var clip = this.context.createBufferSource();
		this.context.decodeAudioData(file.response, function (buffer) {
				clip.buffer = buffer;
				clip.connect(sound.mainNode);
				clip.loop = true;
				clip.noteOn(0);
			}, function (data) {});
		}
		catch(e) {
			console.warn('Web Audio API is not supported in this browser');
		}
	},
	
	playSound: function (file) {
		try {
		var clip = this.context.createBufferSource();
		this.context.decodeAudioData(file.response, function (buffer) {
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
		}
		else
		{
			this.mute = true;
			this.mainNode.gain.value = 0.0;
		}
	}
});
