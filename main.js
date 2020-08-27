
var sprites = [];

function start(){
	STARTED = true;
	canvas.requestFullscreen();
	mouse.start(canvas);
	keys.start();
	// audio.play('assets/S1.mp3',true);
	loop();
}


function loop(){
	setTimeout(loop,1000/40);
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