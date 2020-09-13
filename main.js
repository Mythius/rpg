var sprites = [];

Hitbox.show = true;

function start(){
	STARTED = true;
	game.requestFullscreen();
	mouse.start(canvas);
	keys.start();

	Overworld.loadMap();

	loop();
}

var STOP = false;

var player = new Sprite('assets/blue-knight/0.png');
player.addAnimation('assets/blue-knight/blue-knight.anims');
player.position = new Vector(canvas.width/2,canvas.height/2);
player.scale = new Vector(.45,.89);
player.setOffset = new Vector(-10,15);

function breakloop(){
	STOP = true;
	// close();
}

function loop(){
	if(!STOP) setTimeout(loop,1000/40);
	ctx.clearRect(-2,-2,canvas.width+2,canvas.width+2);
	if(keys.down('e')) {
		Menu.paused = !Menu.paused;
		keys.keys['e'] = false;
	}
	if(Menu.paused){
		Menu.draw();
	} else {
		Overworld.draw();
		for(let sprite of sprites){
			sprite.draw();
		}
		Menu.health.draw();
	}
}

var imgs = Object.keys(assets).filter(e=>true); // Update

imgs.unshift('none');

contextmenu(canvas,(choice,e)=>{
	if(!Menu.paused){
		let pos = mouse.transformPos(e);
		let ac = Overworld.grid.getActiveTile(pos.x,pos.y);
		if(ac){
			ac.img = choice=='none'?'':assets[choice];
		}
	}
},...imgs);

