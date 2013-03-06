var TabClass = Class.extend({
	// Define a tab used to display pages of info in the game
	ctx: null,
	text: '',
	size: {w: 0, h: 0},
	
	init: function (ctx) {
		this.ctx = ctx;
		this.position = {left:200,top:200};
		this.text = 'test';
		this.size.w = 100;
		this.size.h = 35;
	},
	
	render:  function () {
		// render button to screen in it's defined location (position is recalculated to take into account screen resizing)
		if(this.position.left) this.position.x = this.position.left; 	// calc the x position based on right or left screen edge offsets
		else this.position.x = window.innerWidth-this.position.right;
		if(this.position.top) this.position.y = this.position.top;		// calc the y position based on top or bottom screen edge offsets
		else this.position.y = window.innerHeight-this.position.bottom;		

		console.log(this.position);
		
		this.ctx.shadowColor = "transparent";
		if( this.state === 0) { // if normal state add shadow
			this.ctx.shadowOffsetX = 2;
			this.ctx.shadowOffsetY = 2;
			this.ctx.shadowBlur = 12;
			this.ctx.shadowColor = '#222222';
		}
		// White outline
		this.ctx.fillStyle = '#E0D4B0';
		this.ctx.strokeStyle = '#FFFFFF';
		this.ctx.lineWidth = 12;
		this.ctx.roundRect(this.position.x , this.position.y, this.size.w, this.size.h, 9, true, true )

		this.ctx.shadowColor = "transparent";
		
		this.ctx.strokeStyle = colours.brightorange;
		this.ctx.lineWidth = 7;		
		this.ctx.roundRect(this.position.x , this.position.y, this.size.w, this.size.h, 9, true, true )
		
		this.ctx.font = "normal 400 25px 'Roboto Condensed'";
		this.ctx.textAlign = 'center';
		this.ctx.fillStyle = '#222222';
		var x = this.position.x + this.size.w/2;
		var y = this.position.y + this.size.h/2 + 8;
		this.ctx.fillText(this.text, x, y);
		this.ctx.textAlign = 'start';

		//re-calculate edges for click hit matching
//		this.edges.top = this.position.y - 5 ;		
//		this.edges.bottom = this.position.y + this.size.h + 5;
//		this.edges.left = this.position.x - 5;
//		this.edges.right = this.position.x + this.size.w + 5;
	},
	
	clickhit: function (x,y) {
		// return true if a click location corresponds to this button
/*		if( x >= this.edges.left && x <= this.edges.right && y >= this.edges.top && y <= this.edges.bottom)
		{
			return true;
		} */
	},
});
	


