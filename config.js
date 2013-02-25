var colours = {
	// colours used on the game canvas
	lightgrey: '#DDDDDD',
	grey: '#777777',
	darkgrey: '#333333',
	black: '#000000',
	orange: '#CC5422',
	brightorange: '#EE6030',
	white: '#FFFFFF',
	greyout: 'rgba(0,0,0,0.3)'
}

var config = {
	
	styles: {
		resourcetextshaddow: colours.darkgrey,
		resourcetext: colours.white,
		bannerbg: colours.grey,
		bannerhigh1: colours.brightorange,
		bannerhigh2: colours.white,
		popupgreyout: colours.greyout,
		popupbg: colours.lightgrey
	},
	
	// keys used for moving and their desired grid offset
	movekeys: {
		kc81: { x: -1, y: -1 },
		kc103: { x: -1, y: -1 },
		kc36: { x: -1, y: -1 },
		kc87: { x: 0, y: -2 },
		kc104: { x: 0, y: -2 },
		kc38: { x: 0, y: -2 },
		kc69: { x: 1, y: -1 },
		kc105: { x: 1, y: -1 },
		kc33: { x: 1, y: -1 },
		kc65: { x: -1, y: 1 },
		kc97: { x: -1, y: 1 },
		kc35: { x: -1, y: 1 },
		kc83: { x: 0, y: 2 },
		kc98: { x: 0, y: 2 },
		kc40: { x: 0, y: 2 },
		kc68: { x: 1, y: 1 },
		kc99: { x: 1, y: 1 },
		kc34: { x: 1, y: 1 }
	},
	
	boardPattern: [
		[4],
		[3,5],
		[2,4,6],
		[1,3,5,7],
		[2,4,6],
		[1,3,5,7],
		[0,2,4,6,8],
		[1,3,5,7],
		[2,4,6],
		[1,3,5,7],
		[2,4,6],
		[3,5],
		[4]
		],
	
	resourcedTiles: [6,9,10,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,28,29,32],
	
	resources: ['f1','f1','f2','f3','s1','s1','s2','s3','','','','','','','','','','','','','']
	
};

var explosion2 = ['explosions/explosion2_01.png',
				'explosions/explosion2_02.png',
				'explosions/explosion2_03.png',
				'explosions/explosion2_04.png',
				'explosions/explosion2_05.png',
				'explosions/explosion2_06.png',
				'explosions/explosion2_07.png',
				'explosions/explosion2_08.png',
				'explosions/explosion2_09.png',
				'explosions/explosion2_10.png',
				'explosions/explosion2_11.png',
				'explosions/explosion2_12.png',
				'explosions/explosion2_13.png',
				'explosions/explosion2_14.png',
				'explosions/explosion2_15.png',
				'explosions/explosion2_16.png'];