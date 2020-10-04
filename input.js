var FULLSCREEN = false;
document.onfullscreenchange = () => {FULLSCREEN = !FULLSCREEN};
class mouse{
    static pos = { x: 0, y: 0 };
    static down = false;
    static right = false;
    static transformPos(e){
        var x,y;
        var element = e.target;
        let br = element.getBoundingClientRect();
        if(FULLSCREEN){
            let ratio = window.innerHeight/canvas.height;
            let offset = (window.innerWidth-(canvas.width*ratio))/2;
            x = map(e.clientX-br.left-offset,0,canvas.width*ratio,0,element.width);
            y = map(e.clientY-br.top,0,canvas.height*ratio,0,element.height);
        } else {
            x = e.clientX - br.left;
            y = e.clientY - br.top;
        }
        return {x,y};
    }
    static start(element=document.documentElement) {
        function mousemove(e) {
            let pos = mouse.transformPos(e);
            mouse.pos.x = pos.x;
            mouse.pos.y = pos.y;
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
    constructor(element=document.documentElement){
        this.pos = {x:0,y:0};
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
    static all = [];
    static checkPos(callback){
        for(let t of Touch.all){
            callback(t);
        }
    }
    static init(startcallback=()=>{}){
        document.addEventListener('touchstart',e=>{
            Touch.start(e,startcallback);
        });
        document.addEventListener('touchmove',Touch.move);
        document.addEventListener('touchend',Touch.end);
    }
    static start(event,onstart,onmove=()=>{},onend=()=>{}){
        for(let touch of event.changedTouches){
            return new Touch(touch,onstart,onmove,onend);
        }
    }
    static move(e){
        for(let touch of event.changedTouches){
            for(let t of Touch.all){
                if(touch.identifier === t.id){
                    t.target = e.target;
                    t.move(t);
                    break;
                }
            }
        }
    }
    static end(e){
        for(let touch of event.changedTouches){
            for(let t of Touch.all){
                if(touch.identifier === t.id){
                    t.target = e.target;
                    t.end(t);
                    break;
                }
            }
        }
    }
    constructor(touch,onstart,onmove,onend){
        this.id = touch.identifier;
        this.pos = {};
        this.start = {};
        let pos = mouse.transformPos(touch);
        this.start.x = pos.x;
        this.start.y = pos.y;
        this.pos.x = pos.x;
        this.pos.y = pos.y;
        this.onstart = onstart;
        this.onmove = onmove;
        this.onend = onend;
        Touch.all.push(this);
        this.onstart(this);
    }
    move(e){
        e.clientX = e.pos.x;
        e.clientY = e.pos.y;
        let pos = mouse.transformPos(e);
        this.pos.x = pos.x;
        this.pos.y = pos.y;
        this.onmove(this);
    }
    end(e){
        e.clientX = e.pos.x;
        e.clientY = e.pos.y;
        let pos = mouse.transformPos(e);
        this.pos.x = pos.x;
        this.pos.y = pos.y;
        console.log(e);
        let ix = Touch.all.indexOf(this);
        if(ix != -1){
            Touch.all.splice(ix,1);
        }
        this.onend(this);
    }
}