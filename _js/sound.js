SoundClass = Class.extend({
	
	mmmRequest: null,		// The XMLHttp request object for the game music
	context: null,			// audio context
	
	init: function () {
		// Load in the audio files
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

		this.context = new webkitAudioContext();
	},

	// TODO: do playMusic and playSound have to be seperate functions?
	playMusic: function (sound) {
		try {
		var mainNode = this.context.createGainNode(0);
		mainNode.connect(this.context.destination);
		var clip = this.context.createBufferSource();
		this.context.decodeAudioData(sound.response, function (buffer) {
				clip.buffer = buffer;
				clip.gain.value = 1.0;
				clip.connect(mainNode);
				clip.loop = true;
				clip.noteOn(0);
			}, function (data) {});
		}
		catch(e) {
			console.warn('Web Audio API is not supported in this browser');
		}
	},
	
	playSound: function (sound) {
		try {
		var mainNode = this.context.createGainNode(0);
		mainNode.connect(this.context.destination);
		var clip = this.context.createBufferSource();
		this.context.decodeAudioData(sound.response, function (buffer) {
				clip.buffer = buffer;
				clip.gain.value = 1.0;
				clip.connect(mainNode);
				clip.loop = false;
				clip.noteOn(0);
			}, function (data) {});
		}
		catch(e) {
			console.warn('Web Audio API is not supported in this browser');
		}
	}	
});
