var colours = {
	// colours used on the game canvas
	// we can tweak them everywhere they are used from here
	lightgrey: '#DDDDDD',
	grey: '#777777',
	darkgrey: '#333333',
	black: '#000000',
	orange: '#CC5422',
	brightorange: '#EE6030',
	white: '#FFFFFF',
	greyout: 'rgba(0,0,0,0.5)',
	blue: '#9999FF',
	red: '#FF4444',
	beige: '#E0E0B0',
	healthgreen: '#11aa11',
	healthyellow: '#eeee22',
	healthred: '#dd1111'
}

//config stores game configuration options
var config = {
	// styles configure which of our defined colours are used for each element (mainly UI stuff)
	styles: {
		resourcetextshadow: colours.darkgrey,
		resourcetext: colours.white,
		cashtextshadow: colours.darkgrey,
		cashtext: colours.white,
		bannerbg: colours.grey,
		bannerhigh1: colours.brightorange,
		bannerhigh2: colours.white,
		popupgreyout: colours.greyout,
		popupbg: colours.white,
		buttonbg: colours.beige,
		healthbargood: colours.healthgreen,
		healthbarmid: colours.healthyellow,
		healthbarbad: colours.healthred
	},
	
	//Canvas layers defined here
	layers: [{name:'board',position:'absolute',top:'0px',left:'0px'},
		{name:'units',position:'absolute',top:'0px',left:'0px'},
		{name:'effects',position:'absolute',top:'0px',left:'0px'},
		{name:'unitstab',position:'absolute',top:'0px',left:'0px'},
		{name:'ui',position:'absolute',top:'0px',left:'0px'}],
	
	//boardPattern hold an array of rows, each row has entries for which columns contain a tile
	// TODO: should this be made into an array with simple 0 or 1 at each grid index?
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
		[4],
		],

	homeTile: [0,38],
	
	sides:[{name:'Mecritian', colour: 'red'}, {name:'Riveckian', colour:'blue'}],

	unitCosts:{worker:200,soldier:100},
	
	upgradeCosts:{attack:50,defence:50,production:100,workermovement:100},

	Unithp:{soldier:50,worker:1},
	
	//resourcedTiles defines which tiles on the board are allowed to have resources
	resourcedTiles: [6,9,10,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,28,29,32],
	
	//resources are the resources to be distributed should be hte sam enumber as the resourcedTiles above  TODO: auto pad to length
	resources: ['f10','f10','f20','f30','s10','s10','s20','s30','','','','','','','','','','','','',''],
	
	animsf: {
		explosion: { id: [22,24], playback: 'once', sound: true, rate: 20 },
		teleport: { id: [10,12], playback: 'once', sound: false, rate: 40 },
		active: { id: [7,9], playback: 'bounce', sound: false, rate: 20 }
	},
	
	animsv: {
		beam: { playback: null, sound: true, length: 300 },
	},
	
	soundeffects: ['battle', 'explosion', 'doh', 'beam', 'doh', 'resource'],

	soldiersounds: ['pistol', 'rifle', 'machine_gun', 'small_booms', 'strange_booms', 'laser'],
	
	music: ['ObservingTheStar', 'OutThere', 'shrine'],
	
	//pre-computed distances between hextile gridids
	distances: [ [0,null,2,null,4,null,6,null,8,null,10,null],
				 [null,1,null,3,null,5,null,7,null,9,null,11],
				 [1,null,2,null,4,null,6,null,8,null,10,null],
				 [null,2,null,3,null,5,null,7,null,9,null,11],
				 [2,null,3,null,4,null,6,null,8,null,10,null],
				 [null,3,null,4,null,5,null,7,null,9,null,11],
				 [3,null,4,null,5,null,6,null,8,null,10,null],
				 [null,4,null,5,null,6,null,7,null,9,null,11],
				 [4,null,5,null,6,null,7,null,8,null,10,null],
				 [null,5,null,6,null,7,null,8,null,9,null,11],
				 [5,null,6,null,7,null,8,null,9,null,10,null],
				 [null,6,null,7,null,8,null,9,null,10,null,11],
				 [6,null,7,null,8,null,9,null,10,null,11,null]]
	
};
