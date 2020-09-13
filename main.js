var sprites = [];

// Hitbox.show = true;

function start(){
	STARTED = true;
	game.requestFullscreen();
	mouse.start(canvas);
	keys.start();

	Overworld.loadMap('assets/r1/room.json');

	loop();
}

var STOP = false;

var player = new Sprite('assets/blue-knight/0.png');
player.addAnimation('assets/blue-knight/blue-knight.anims');
player.position = new Vector(canvas.width/2,canvas.height/2);
player.setScale = new Vector(.5,.5);
player.setOffset = new Vector(0,30);

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

contextmenu(canvas,(choice,e)=>{
	let pos = mouse.transformPos(e);
	let t = Overworld.getSubtileAt(pos);
	if(t){
		if(choice == 'remove all'){
			t.dialog = false;
			t.event = false;
			t.room = false;
		} else {
			if(typeof t[choice] !== 'undefined'){
				t[choice] = !t[choice];
			} else {
				t[choice] = true;
			}
			// Update This and prompt for values
		}
	}
},'dialog','room','event','remove all');