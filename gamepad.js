// ctx must be defined.
// Vector Must be defined {x:Number,y:Number}
(function(glob){
	var Gamepad = {};
	glob.Gamepad = Gamepad;

	Gamepad.color1 = 'red';
	Gamepad.color2 = 'white';
	Gamepad.lineWidth = 5;

	Gamepad.button = {};
	Gamepad.joystick = {};

	Gamepad.button.circle = new Path2D;
	Gamepad.button.square = new Path2D;
	Gamepad.button.arrow = new Path2D;
	Gamepad.button.pentagon = new Path2D;
	Gamepad.joystick.socket = new Path2D;
	Gamepad.joystick.stick = new Path2D;

	Gamepad.Joystick = class Joystick{
		constructor(pos=new Vector,add=true){
			this.offsetX = 0;
			this.offsetY = 0;
			this.position = pos;
			this.socket = Gamepad.joystick.socket;
			this.stick = Gamepad.joystick.stick;
			if(add) Gamepad.elements.push(this);
		}
		draw(){
			ctx.beginPath();
			ctx.lineWidth = 10;
			ctx.strokeStyle = Gamepad.color1;
			ctx.fillStyle = Gamepad.color2;
			ctx.save();
			ctx.translate(this.position.x,this.position.y);
			ctx.save();
			ctx.fill(this.socket);
			ctx.stroke(this.socket);
			// Todo: add Touch Events for Joystick
			ctx.restore();
			ctx.translate(this.offsetX,this.offsetY);
			ctx.fill(this.stick);
			ctx.stroke(this.stick);
			ctx.restore();
		}
	}

	Gamepad.Button = class Button{
		constructor(pos=new Vector,add=true){
			this.down = false;
			this.position = pos;
			this.path = new Path2D;
			if(add) Gamepad.elements.push(this);
		}
		draw(translate=true){
			if(translate) ctx.save();
			ctx.strokeStyle = Gamepad.color1;
			ctx.fillStyle = Gamepad.color2;
			ctx.lineWidth = Gamepad.lineWidth;
			if(translate) ctx.translate(this.position.x,this.position.y);
			ctx.fill(this.path);
			ctx.stroke(this.path);
			// this.down = ctx.isPointInPath(this.path,mouse.pos.x,mouse.pos.y) // && mouse.down;
			this.down = false;
			Touch.checkPos(touches=>{
				this.down |= ctx.isPointInPath(this.path,touches.pos.x,touches.pos.y);
			});
			if(translate) ctx.restore();
		}
	}

	Gamepad.dPad = class dPad{
		constructor(pos = new Vector,add=true){
			this.position = pos;
			this.up = new Gamepad.Button(pos,false);
			this.up.path = Gamepad.button.pentagon;
			this.down = new Gamepad.Button(pos,false);
			this.down.path = Gamepad.button.pentagon;
			this.left = new Gamepad.Button(pos,false);
			this.left.path = Gamepad.button.pentagon;
			this.right = new Gamepad.Button(pos,false);
			this.right.path = Gamepad.button.pentagon;
			if(add) Gamepad.elements.push(this);
		}
		draw(){
			let btns = [this.up,this.right,this.down,this.left];
			ctx.beginPath();
			ctx.save();
			ctx.translate(this.position.x,this.position.y);
			for(let btn of btns){
				btn.draw(false);
				ctx.rotate(Math.PI/2);
			}
			ctx.restore();
		}
	}

	Gamepad.draw = function(){
		if(!Gamepad.show) return;
		for(let elements of Gamepad.elements){
			elements.draw();
		}
	}

	Gamepad.show = true;

	Gamepad.elements = [];

	// Touchscreen Events


	// Define Looks

	Gamepad.button.circle.arc(0,0,50,0,Math.PI*2);
	// Gamepad.button.square.rect(-40,-40,80,80);

	Gamepad.joystick.socket.arc(0,0,50,0,Math.PI*2);
	Gamepad.joystick.stick.arc(0,0,15,0,Math.PI*2);

	Gamepad.button.pentagon.moveTo(0,0);
	Gamepad.button.pentagon.lineTo(-30,-30);
	Gamepad.button.pentagon.lineTo(-30,-90);
	Gamepad.button.pentagon.lineTo(30,-90);
	Gamepad.button.pentagon.lineTo(30,-30);
	Gamepad.button.pentagon.closePath();


})(this);