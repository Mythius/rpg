var sprites = [];

// Hitbox.show = true;

var DPAD,JOYSTICK;
Gamepad.show = false;
var STOP = false;
var DISABLED = false;

Gamepad.color1 = 'green';
Gamepad.color2 = 'rgba(30,30,30,.5)';

function start(){
	STARTED = true;
	game.requestFullscreen();
	mouse.start(canvas);
	keys.start();
	Touch.init(e=>{
		Gamepad.show = true;
	});
	show(obj('button'));
	hide(obj('h1'));

	Overworld.loadMap('assets/r1/room.json');

	DPAD = new Gamepad.dPad(new Vector(200,500));
	// JOYSTICK = new Gamepad.Joystick(new Vector(210,500));

	loop();
}

obj('h1').on('click',start);


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
	if(DISABLED) return;
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
		// DPAD.draw(false);
		Menu.health.draw();
	}
	Gamepad.draw();
}

if(DEBUGGING){
	contextmenu(canvas,(choice,e)=>{
		let pos = mouse.transformPos(e);
		let t = Overworld.getSubtileAt(pos);
		switch(choice){
			case 'Toggle Solid': t.solid = !t.solid; break;
			case 'On Click': input('Add Code').then(text=>{t.onactive=text||""}); break;
			case 'On Step': input('Add Code').then(text=>{t.onstep=text||""}); break;
			case 'Remove All': t.solid = false;t.onactive="";t.onstep=""; break;
			case 'Export World': download('room.json',JSON.stringify(Overworld.export())); break;
			default: console.warn(`Nothing happened on selection: ${choice}`); break;
		}
	},'Toggle Solid','On Click','On Step','Export World','Remove All');
}