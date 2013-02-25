SoundClass = Class.extend({
	
	mmmRequest: null,		// The XMLHttp request object for the game music
	context: null,
	mainNode: null,
	clip: null,
	
	init: function () {
		this.mmmRequest = new XMLHttpRequest();
		this.mmmRequest.open('GET', '_media/Man-Made Messiah v0_8.mp3', true );
		this.mmmRequest.responseType = 'arraybuffer';
		this.mmmRequest.send();
//		this.playMusic(this.mmmRequest);

		this.boomRequest = new XMLHttpRequest();
		this.boomRequest.open('GET', '_media/boom.mp3', true );
		this.boomRequest.responseType = 'arraybuffer';
		this.boomRequest.send();

		this.teleportRequest = new XMLHttpRequest();
		this.teleportRequest.open('GET', '_media/teleport.mp3', true );
		this.teleportRequest.responseType = 'arraybuffer';
		this.teleportRequest.send();

		this.context = new webkitAudioContext();
		this.mainNode = this.context.createGainNode(0);
		this.mainNode.connect(this.context.destination);
		this.clip = this.context.createBufferSource();
	
	},

	
	playMusic: function (sound) {
//		console.log(sound);
//		console.log(this.clip);
//		try {
			this.context.decodeAudioData(sound.response, function (buffer) {
//				this.clip.buffer = buffer;
//		console.log(this.clip);				
				this.clip.gain.value = 1.0;
				this.clip.connect(this.mainNode);
				this.clip.loop = t;
				this.clip.noteOn(0);
			}, function (data) {});
//		}
//		catch(e) {
//			console.warn('Web Audio API is not supported in this browser');
//		}
	},
	
	playSound: function (sound) {
		try {
			this.context.decodeAudioData(sound, function (buffer) {
				clip.buffer = buffer;
				clip.gain.value = 1.0;
				clip.connect(this.mainNode);
				clip.loop = false;
				clip.noteOn(0);
			}, function (data) {});
		}
		catch(e) {
			console.warn('Web Audio API is not supported in this browser');
		}
	}	
});
