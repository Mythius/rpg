// ctx must be defined.
// Vector Must be defined {x:Number,y:Number}
(function(glob){
	var Gamepad = {};
	glob.Gamepad = Gamepad;

	Gamepad.color1 = 'red';
	Gamepad.color2 = 'black';

	Gamepad.Joystick = class Joystick{
		constructor(pos = new Vector){
			this.offsetX = 0;
			this.offsetY = 0;
			this.position = pos;
			this.path = new Path2D;
			Gamepad.elements.push(this);
		}
		draw(){

		}
	}

	Gamepad.Button = class Button{
		constructor(pos = new Vector){
			this.down = false;
			this.position = pos;
			this.path = new Path2D;
			Gamepad.elements.push(this);
		}
		draw(){

		}
	}

	Gamepad.dPad = class dPad{
		constructor(pos = new Vector){
			this.up = false;
			this.left = false;
			this.right = false;
			this.down = false;
			this.position = pos;
			this.up_button = new Gamepad.Button();
			this.down_button = new Gamepad.Button();
			this.left_button = new Gamepad.Button();
			this.right_button = new Gamepad.Button();
			Gamepad.elements.push(this);
		}
		draw(){

		}
	}

	Gamepad.draw = function(){
		if(!Gamepad.show) return;

	}

	Gamepad.show = true;

	Gamepad.elements = [];




})(this);