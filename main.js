
var sprites = [];

function start(){
	STARTED = true;
	game.requestFullscreen();
	mouse.start(canvas);
	keys.start();
	// audio.play('assets/S1.mp3',true);
	loop();
}

var STOP = false;

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
		let ac = Overworld.grid.getActiveTile(e.clientX,e.clientY);
		if(ac){
			ac.img = choice=='none'?'':assets[choice];
		}
	}
},...imgs);