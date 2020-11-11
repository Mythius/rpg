var sprites = [];

// Hitbox.show = true;

var DPAD,JOYSTICK;
Gamepad.show = false;
var STOP = false;
var DISABLED = false;
var DEBUGGING = true;

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


var player = new Sprite('assets/player/0.png');
player.addAnimation('assets/player/player.anims');
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
			case 'On Click': input('Add Code',t.onactive).then(text=>{t.onactive=text||""}); break;
			case 'On Step': input('Add Code',t.onstep).then(text=>{t.onstep=text||""}); break;
			case 'Remove All': t.solid = false;t.onactive="";t.onstep=""; t.ent=null; t.entity=null; break;
			case 'Export Room': download('room.json',JSON.stringify(Overworld.export())); break;
			case 'Position': let p = Overworld.getGlobalPosition(t); input(`Pos: (${p.x},${p.y})`); break;
			case 'New Room': input('Enter Dimensions','3\n1').then(e=>{
				let dim = new Vector(...e.split('\n').map(e=>+e));
				Overworld.loadMap(dim);
			}); break;
			case 'Add Image': input('Enter Image Path').then(path=>{
				let ot = t.grid.parent;
				if(ot){
					try{
						ot.img = createAsset(path.trim());
					} catch(e){}
				}
			}); break;
			case 'Add Entity': input('Enter Entity Name').then(name=>{
				if(!t) return;
				var ent;
				try{
					ent = eval(name);
				} catch(e){
					return;
				}
				t.ent = name;
				let arr = name.split('\n');
				ent.addToSubtile(t);
			})
			default: console.warn(`Nothing happened on selection: ${choice}`); break;
		}
	},'Toggle Solid','Position','On Click','On Step','On Load','New Room','Export Room','Add Image','Add Song','Add Entity','Copy Tile','Paste Tile','Remove All');
}