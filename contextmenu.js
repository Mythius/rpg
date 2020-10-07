function contextmenu(element,callback,...items){
	var ctx = create('ctx');
	var event;
	hide(ctx);
	for(var i of items){
		var ite;
		if (typeof i == 'string'){
			ite = create('item');
			ite.innerHTML = i;
		} else {
			ite = create('item');
			ite.appendChild(i);
		}
		ctx.appendChild(ite);
		ite.on('click',(e)=>{
			callback(e.srcElement.innerText,event);
			hide(ctx);
		});
	}
	game.appendChild(ctx);
	element.on('contextmenu',function(e){
		e.preventDefault();
		ctx.style.left = e.clientX + 'px';
		ctx.style.top = e.clientY + 'px';
		show(ctx);
		event = e;
	});
	document.on('mousedown',function(e){
		if(e.path.indexOf(ctx) == -1){
			hide(ctx);
		}
	});
}

async function input(label,template=''){
	return new Promise((resolve,reject)=>{
		DISABLED = true;
		let element = create('intext');
		let textbox = create('textarea');
		let confirm = create('button','Save');
		let cancel = create('button','Cancel');
		element.appendChild(create('h3',label));
		element.appendChild(textbox);
		element.appendChild(create('br'));
		element.appendChild(confirm);
		element.appendChild(cancel);
		textbox.value = template;
		cancel.on('click',e=>{
			element.remove();
			DISABLED = false;
			reject(template);
		});
		confirm.on('click',e=>{
			element.remove();
			DISABLED = false;
			resolve(textbox.value);
		});
		// textbox.on('keydown',e=>{
		// 	if(e.keyCode == 13){
		// 		element.remove();
		// 		DISABLED = false;
		// 		resolve(textbox.value);
		// 	}
		// })
		game.appendChild(element);
		textbox.focus();
	});
}