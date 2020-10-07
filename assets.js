const assets = {};
function createAsset(path){
	let img = new Image();
	img.src = path;
	assets[path] = img;
	return img;
}
function drawImage(img,...args){
	if(typeof img == "object"){
		ctx.drawImage(img,...args);
	} else {
		ctx.drawImage(assets[img],...args);
	}
}
createAsset('assets/icons/heart0.png');
createAsset('assets/icons/heart1.png');
createAsset('assets/icons/heart2.png');
createAsset('assets/icons/menu.png');
createAsset('assets/icons/item0.png');
createAsset('assets/icons/item1.png');
createAsset('assets/icons/elem0.png');
createAsset('assets/icons/elem1.png');
createAsset('assets/icons/elem2.png');
createAsset('assets/icons/elem3.png');
createAsset('assets/icons/elem4.png');
createAsset('assets/r1/0.png');
createAsset('assets/r1/1.png');
createAsset('assets/r1/2.png');
createAsset('assets/r1/3.png');
createAsset('assets/r2/0.png');
createAsset('assets/r2/1.png');
createAsset('assets/r2/2.png');
createAsset('assets/items/red_flower.png')
createAsset('assets/r3/0.png');