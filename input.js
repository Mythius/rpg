var FULLSCREEN = false;
document.onfullscreenchange = () => {FULLSCREEN = !FULLSCREEN};
class mouse{
    static pos = { x: 0, y: 0 };
    static down = false;
    static right = false;
    static start(element=document.documentElement) {
        function mousemove(e) {
            let br = element.getBoundingClientRect();
            if(FULLSCREEN){
                let ratio = window.innerHeight/canvas.height;
                let offset = (window.innerWidth-(canvas.width*ratio))/2;
                mouse.pos.x = map(e.clientX-br.left-offset,0,canvas.width*ratio,0,element.width);
                mouse.pos.y = map(e.clientY-br.top,0,canvas.height*ratio,0,element.height);
            } else {
                mouse.pos.x = e.clientX - br.left;
                mouse.pos.y = e.clientY - br.top;
            }
        }
        function mouseup(e) {
            if(e.which == 1){
                mouse.down = false;
            } else if(e.which == 3){
                mouse.right = false;
            }
        }
        function mousedown(e) {
            mousemove(e);
            if(e.which == 1){
                mouse.down = true;
            } else if(e.which == 3){
                mouse.right = true;
            }
        }
        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
        document.addEventListener('mousedown', mousedown);
        document.addEventListener('contextmenu',e=>{e.preventDefault()});
    }
}
class keys{
    static keys = [];
    static start(){
        function keydown(e){
            keys.keys[e.key.toLowerCase()] = true;
        }
        function keyup(e){
            keys.keys[e.key.toLowerCase()] = false;
        }
        document.addEventListener('keydown',keydown);
        document.addEventListener('keyup',keyup);
    }
    static down(key){
        if(key.toLowerCase() in keys.keys){
            return keys.keys[key.toLowerCase()];
        }
        return false;
    }
}
class Touch{
    static touches = [];
    static resolved = [];
    static init(callback){
        document.on('touchstart',e=>{
            for(let touch of e.changedTouches){
                Touch.touches.push([touch]);
                e.preventDefault();
            }
        });
        document.on('touchend',e=>{
            let et = e.changedTouches[0];
            let oe = Touch.touches.filter(ev=>ev[0].identifier==et.identifier)[0];
            if(Touch.resolved.length == 0 && Touch.touches.length == 1){
                let target = oe[0].target;
                let br = target.getBoundingClientRect();
                callback({
                    type: 'single',
                    dx: et.clientX - oe[0].clientX,
                    dy: et.clientY - oe[0].clientY,
                    x: et.clientX - br.left,
                    y: et.clientY - br.top,
                    target: oe[0].target
                });
                Touch.touches = [];
                Touch.resolved = [];
            } else {
                if(oe === undefined) return;
                oe.push(et);
                if(Touch.resolved.length > 0){
                    let ot = Touch.resolved[0][0];
                    callback({
                        type: 'double',
                        touch1: {
                            dx: oe[1].clientX - oe[0].clientX,
                            dy: oe[1].clientY - oe[0].clientY,
                            x: oe[1].clientX,
                            y: oe[1].clientY
                        },
                        touch2: {
                            dx: ot[1].clientX - ot[0].clientX,
                            dy: ot[1].clientY - ot[0].clientY,
                            x: ot[1].clientX,
                            y: ot[1].clientY
                        }
                    });
                    Touch.touches = [];
                    Touch.resolved = [];
                } else {
                    Touch.resolved.push(Touch.touches.splice(Touch.touches.indexOf(oe),1));
                }
            }
        });
    }
}