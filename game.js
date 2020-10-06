const game = obj('game');
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
var STARTED = false;
var DEBUGGING = true;
document.on('keydown',e=>{
	Gamepad.show = false;
	if(STARTED) return;
	start();
});

class TileEntity{
	constructor(type='flower',animation=''){
		this.type = type;
		this.subtile = null;
		this.action = null;
		this.animPath = animation;
	}
	addToSubtile(subtile){
		this.subtile = subtile;
		let s = new TileSprite(subtile);
		s.addAnimation(this.animPath);
		s.img = this.img;
		subtile.entity = this;
		return s;
	};
	activeate(){} // Override
}

(function(global){ // Menu Object
	var mod = {};
	global.Menu = mod;
	mod.stats = {
		food: 10,
		health: 10,
		mon: 0,
		elemental: {
			fire: false,
			water: false,
			wind: false,
			ground: false
		},
		inventory: [] // 10 Slots
	}

	var inv_slot = {x:0,y:0};

	mod.paused = false;
	mod.draw = function(){
		ctx.font = '90px ps2p';
		if(!mod.paused) return;

		if(keys.down('w') || keys.down('arrowup')){
			inv_slot.y = (inv_slot.y + 2) % 3;
			keys.keys['w'] = false;
			keys.keys['arrowup'] = false;
		}

		if(keys.down('a') || keys.down('ArrowLeft')){
			inv_slot.x = (inv_slot.x + 3) % 4;
			keys.keys['a'] = false;
			keys.keys['arrowleft'] = false;
		}

		if(keys.down('d') || keys.down('ArrowRight')){
			inv_slot.x = (inv_slot.x + 1) % 4;
			keys.keys['d'] = false;
			keys.keys['arrowright'] = false;
		}

		if(keys.down('s') || keys.down('ArrowDown')){
			inv_slot.y = (inv_slot.y + 1) % 3;
			keys.keys['s'] = false;
			keys.keys['arrowdown'] = false;
		}



		mod.inventory.focus();

		drawImage('assets/icons/menu.png',0,0,canvas.width,canvas.height);
		for(let meter of meters){
			meter.draw();
		}
		ctx.fillStyle = 'black';
		ctx.fillText('PAUSED',450,150);
		ctx.fill();
	}
	var meters = [];
	class Meter{
		constructor(x,y,w,h,tw,th,imgs){
			this.x = x;
			this.y = y;
			this.w = w;
			this.h = h;
			this.tw = tw;
			this.th = th;
			this.imgs = imgs;
			this.values = [];
			meters.push(this);
		}
		draw(){
			let i=0;
			for(let ty=0;ty<this.h;ty++){
				for(let tx=0;tx<this.w;tx++){
					let img = assets[this.imgs[this.values[i++]]];
					let x = this.x+tx*this.tw+(this.tw-img.width)/2;
					let y = this.y+ty*this.th+(this.th-img.height)/2;
					drawImage(img,x,y);
				}
			}
		}
	}
	// Health Bar
	(function(){
		let imgs = [];
		for(let i=0;i<3;i++) imgs.push(`assets/icons/heart${i}.png`);
		let health = new Meter(290,720,10,1,90,90,imgs);
		const THIS = health;
		health.hearts = 10;
		health.setHealth = function(health){
			this.hearts = Math.max(health,0);
			this.hearts = Math.min(health,10);
			var i;
			for(i=0;i<health;i++){
				this.values[i] = 2;
			}
			if(i-health==.5) this.values[i-1] = 1;
			for(;i<this.w;i++) this.values[i] = 0;
		}
		health.inc = function(){
			this.setHealth(this.hearts+.5);
		}
		health.dec = function(){
			this.setHealth(this.hearts-.5);
		}
		health.setHearts = function(health){
			slide();
			function slide(){
				if(THIS.hearts > health){
					THIS.dec();
					setTimeout(slide,50);
				} else if(THIS.hearts < health){
					THIS.inc();
					setTimeout(slide,50);
				}
			}
		}
		health.setHealth(10);
		mod.health = health;
	})();
	(function(){ // Inventory
		let imgs = [];
		for(let i=0;i<2;i++) imgs.push(`assets/icons/item${i}.png`);
		let inventory = new Meter(110,255,4,3,110,110,imgs);
		inventory.values = [1,0,0,0,0,0,0,0,0,0,0,0];
		inventory.focus = function(){
			inventory.values = [0,0,0,0,0,0,0,0,0,0,0,0];
			inventory.values[inv_slot.y * 4 + inv_slot.x] = 1;
		}
		mod.inventory = inventory;
	})();
	(function(){
		let imgs = [];
		for(let i=0;i<5;i++) imgs.push(`assets/icons/elem${i}.png`);
		let orbs = new Meter(590,270,2,2,150,150,imgs);
		orbs.values = [0,0,0,0];
		mod.orbs = orbs;
	})();
})(this);

(function(global){ // Overworld
	var ow = {};
	global.Overworld = ow;

	var speed = 8;
	var dash_cooldown = 3; // Seconds
	var dash_speed = 30;
	var dash_current = 0;
	var subdivision = 15;

	var g = new Grid(5,2,960);
	ow.grid = g;
	g.offsetX = canvas.width/2 - g.width*g.scale/2;
	g.offsetY = canvas.height/2 - g.height*g.scale/2;

	var prev_pos = new Vector;
	var move_vec = new Vector;

	Tile.prototype.solid = false;
	Tile.prototype.onstep = "";
	Tile.prototype.onactive = "";

	Tile.prototype.addGrid = function(rows=10){
		subdivision = rows;
        let scl = this.grid.scale / rows;
        this.subsize = rows;
        this.child = new Grid(rows,rows,scl);
        this.child.parent = this;
        this.child.forEach(subtile=>{
        	let ts = new TileSprite(subtile);
        });
    }

	Tile.prototype.draw = function(lines=false,color='transparent'){
		let c = this.getCenter();
		let s2 = this.grid.scale/2;
		// ctx.rect(c.x-s2,c.y-s2,s2*2,s2*2);
		if(this.img){
			ctx.drawImage(this.img,c.x-s2,c.y-s2,s2*2,s2*2);
		}
		if(this.hasPoint(mouse.pos.x,mouse.pos.y) && mouse.down && !this.child){
			this.solid = !this.solid;
			mouse.down = false;
		}
		if(this.sprite){
			this.sprite.position = this.getCenter();
			this.drawImg();
			if(DEBUGGING) this.sprite.DRAW(this.onstep?this.onactive?'purple':'red':this.onactive?'blue':'transparent');
			this.sprite.DRAW(color);
		}
		if(this.solid){
			if(DEBUGGING){
				ctx.beginPath();
				ctx.lineWidth = 3;
				ctx.strokeStyle = 'white';
				// ctx.rect(c.x-s2,c.y-s2,s2*2,s2*2);
				if(this.solid){
					ctx.moveTo(c.x-s2*.8,c.y-s2*.8);
					ctx.lineTo(c.x+s2*.8,c.y+s2*.8);
					ctx.moveTo(c.x-s2*.8,c.y+s2*.8);
					ctx.lineTo(c.x+s2*.8,c.y-s2*.8);
				}
				ctx.stroke();
			}
		}
		if(this.child){
			this.child.offsetX = c.x-s2;
			this.child.offsetY = c.y-s2;
			this.child.draw(true);
		}
	}

	Grid.prototype.draw = function(lines=false){
		ctx.beginPath();
		ctx.lineWidth = 2;
		ctx.strokeStyle = 'white';
		this.forEach(tile=>{tile.draw(lines)});
		ctx.stroke();

		ctx.strokeStyle = 'green';
		ctx.beginPath();
		// let at = g.getActiveTile();
		// if(at) at.draw();
		ctx.stroke();
	}

	ow.loadMap = async function(mappath){
		if(!mappath){
			g = new Grid(3,1,960);
			// audio.play('assets/S1.mp3',true);
			g.getTileAt(0,0).img = assets['assets/r2/2.png'];
			g.getTileAt(1,0).img = assets['assets/r2/0.png'];
			g.getTileAt(2,0).img = assets['assets/r2/1.png'];

			g.forEach(tile=>{tile.addGrid(subdivision)});
		} else {
			var request = await fetch(mappath);
			var d = await request.json();
			if(d.song.length) audio.play(d.song,true,.3)
			g = new Grid(d.width,d.height,d.scale);
			let i = 0;
			g.forEach(tile=>{
				let path = d.maps[i].src.match(/assets.*/gi)[0];
				tile.img = assets[path]
				if(d.maps[i].sub.size){
					tile.addGrid(d.maps[i].sub.size);
					let j=0;
					tile.child.forEach(subtile=>{
						let o = d.maps[i].sub.tilecodes[j];
						subtile.solid = o.s;
						subtile.onstep = o.w;
						subtile.onactive = o.i;
						// Read Flags here
						j++;
					});
				}
				i++;
			});
		}
		g.offsetX = g.width * g.scale / 4;
		ow.grid = g;
	}

	ow.draw = function(){

		prev_pos.x = g.offsetX;
		prev_pos.y = g.offsetY;

		var anim = false;

		getOut();

		move_vec.x = 0;
		move_vec.y = 0;

		let left = keys.down('a') || keys.down('ArrowLeft') || DPAD.left.down;
		let right = keys.down('d') || keys.down('ArrowRight') || DPAD.right.down;
		let up = keys.down('w') || keys.down('ArrowUp') || DPAD.up.down;
		let down = keys.down('s') || keys.down('ArrowDown') || DPAD.down.down;

		if(left){
			dash(dash_speed,0)
			g.offsetX += speed;
			move_vec.x += speed;
			player.animation.play('walk-side');
			player.transformX = -1;
			player.xdir = -1;
			player.ydir = 0;
			anim = true;
		}

		if(right){
			dash(-dash_speed,0)
			g.offsetX -= speed;
			move_vec.x -= speed;
			player.animation.play('walk-side');
			player.transformX = 1;
			player.xdir = 1;
			player.ydir = 0;
			anim = true;
		}

		getOut();

		
		move_vec.x = 0;
		move_vec.y = 0;

		if(up){
			dash(0,dash_speed)
			g.offsetY += speed;
			move_vec.y += speed;
			player.ydir = -1;
			player.xdir = 0;
			if(!anim) player.animation.play('walk-up');
		}

		if(down){
			dash(0,-dash_speed)
			g.offsetY -= speed;
			move_vec.y -= speed;
			player.ydir = 1;
			player.xdir = 0;
			if(!anim) player.animation.play('walk-down');
		}

		function dash(dx,dy){
			if(keys.down('shift') && dash_current == 0){
				keys.keys['shift'] = false;
				dash_current = 40 * dash_cooldown;
				for(let i=0;i<200;i+=20){
					setTimeout(()=>{
						g.offsetX += dx;
						g.offsetY += dy;
						move_vec.x += dx;
						move_vec.y += dy;
					},1000/i);
				}
			}
		}

		function getOut(){
			let go_back = move_vec.mult(.05);
			let movedout = false;


			let stop_overflow = 0;
			while(ow.touchingSolid(player)){
				movedout = true;
				g.offsetX -= go_back.x;
				g.offsetY -= go_back.y;
				if(++stop_overflow >= 100) {
					console.warn('Player stuck');
					break;
				}
			}
		}

		dash_current = Math.max(dash_current-1,0);

		g.draw();

		player.draw();


		if(keys.down(' ')){
			ow.interact();
		}
	}

	ow.addSprite = function(properties={path:''}){
		let sprite = new Sprite(properties.path);
		if(properties.animation){
			sprite.addAnimation(properties.animation);
		}
	}

	ow.touchingSolid = function(sprite){
		let result = false;
		g.forEach(tile=>{
			if(!tile.child) return;
			let c = tile.getCenter();
			let s2 = g.scale / 2;

			tile.child.offsetX = c.x-s2;
			tile.child.offsetY = c.y-s2;

			tile.child.forEach(subtile=>{
				subtile.sprite.position = subtile.getCenter();
				result |=  subtile.solid && subtile.sprite.touches(sprite);
				if(result) return true;
			});
		});
		return result;
	}

	ow.export = function(){
		var result = {};
		result.song = "";
		result.sprites = [];
		result.width = g.width;
		result.height = g.height;
		result.scale = g.scale;
		result.maps = [];
		for(let tile of g.tiles.flat()){
			let m = {};
			m.src = tile.img.src;
			m.sub = {};
			m.sub.size = tile.subsize;
			m.sub.tilecodes = [];
			if(tile.subsize){
				for(let subtile of tile.child.tiles.flat()){
					let tilecode = {};
					tilecode.s = subtile.solid || false;
					tilecode.w = subtile.onstep || "";
					tilecode.i = subtile.onactive || "";
					m.sub.tilecodes.push(tilecode);
				}
			}
			result.maps.push(m);
		}
		// download('room.json',JSON.stringify(result));
		return result;
	}

	ow.getSubtileAt = function(pos){
		let result;
		g.forEach(tile=>{
			if(!tile.child) return;
			let at = tile.child.getActiveTile(pos.x,pos.y);
			if(at){
				result = at;
				return true;
			}
		});
		return result;
	}

	ow.getSubtile = function(pos){
		let result;
		g.forEach(tile=>{
			if(!tile.child) return;

			let at = tile.child.getTileAt(pos.x,pos.y);
			if(at){
				result = at;
				return true;
			}
		});
		return result;
	}

	ow.getGlobalSubtile = function(x,y){
		let gx = Math.floor(x/subdivision);
		let lx = x % subdivision;
		let gy = Math.floor(y/subdivision);
		let ly = y % subdivision;

		let ct = g.getTileAt(gx,gy);
		if(ct){
			return ct.child.getTileAt(lx,ly);
		}
	}

	ow.getGlobalPosition = function(subtile){
		let x = subtile.grid.parent.x * subdivision + subtile.x;
		let y = subtile.grid.parent.y * subdivision + subtile.y;
		return {x,y};
	}

	ow.interact = function(){
		let result=[];
		let tx = player.xdir;
		let ty = player.ydir;
		let curtile = ow.getSubtileAt(player.pos);
		if(!curtile) return [];
		let curpos = ow.getGlobalPosition(curtile);
		if(!curpos) return [curtile].filter(e=>!!e);
		if(curtile){
			result.push(curtile);
			if(!ty){
				result.push(ow.getGlobalSubtile(curpos.x+tx,curpos.y+ty));
				result.push(ow.getGlobalSubtile(curpos.x+tx,curpos.y+1));
				result.push(ow.getGlobalSubtile(curpos.x+tx,curpos.y-1));
			}
			if(!tx){
				result.push(ow.getGlobalSubtile(curpos.x+tx,curpos.y+ty));
				result.push(ow.getGlobalSubtile(curpos.x-1,curpos.y+ty));
				result.push(ow.getGlobalSubtile(curpos.x+1,curpos.y+ty));
			}
		}
		if(DEBUGGING){
			var color = 100;
			for(let tile of result){
				if(!tile) continue;
				tile.draw(true,`HSL(0,100%,${color}%`);
				color -=10;
			}
		}
		return result.filter(e=>!!e);
	}
})(this);

(function(global){  // Interactable Items Module
	let pot = {};
	global.Potions = pot;

	pot.grinder = new TileEntity('grinder','assets/items/grinder/grinder.anims');
	pot.grinder.activeate = function(){
		console.log('Grinder Activated');
	}
})(this);

(function(global){
	var Dialog = {};
	global.Dialog = Dialog;

	var lastAnswer = "";

	Dialog.fromCode = function(arr){
		switch(arr[0]){ // Keyword, ask, say, 

		}
	}
})(this);

(function(global){ // Code Module
	var Code = {};
	global.Code = Code;

	function run(code){
		let lines = code.split('\n');
		for(let line of lines){
			runLine(line);
		}
	}

	function runLine(line){
		let words = line.split(' ');
		switch(words[0].toLowerCase()){
			case 'room': Overworld.loadMap(`assets/${words[1]}/room.json`); break;
			case 'dialog': Dialog.fromCode(words.slice(1)); break;
			default: console.warn('Error While Runing Code',line);
		}
	}
})(this);