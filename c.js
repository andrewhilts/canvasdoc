function cd_Page(pageSize, margins, dpiFactor){
	var page = {};

	page.canvas = document.createElement('canvas');
	page.ctx = page.canvas.getContext('2d');

	return page;
}

function cd_Document(){
	var doc = {};
	return doc;
}

function cd_CanvasDocument(){
	var canvasDocument = {};

	canvasDocument.canvas = document.createElement('canvas');
	canvasDocument.ctx = canvasDocument.canvas.getContext('2d');

	canvasDocument.createPages = function(){

	}

	canvasDocument.createFromEL = function(el, callback){

		var elHeight = el.offsetHeight;
		var elWidth = el.offsetWidth;

		canvasDocument.canvas.height = elHeight;
		canvasDocument.canvas.width = elWidth;

		var data = '<svg xmlns="http://www.w3.org/2000/svg" width="' + elWidth +'" height="' + elHeight + '">' +
           '<foreignObject width="100%" height="100%">' +
           '<div xmlns="http://www.w3.org/1999/xhtml">' +
             el.innerHTML +
           '</div>' +
           '</foreignObject>' +
           '</svg>';

		var DOMURL = window.URL || window.webkitURL || window;

		var img = new Image();
		var svg = new Blob([data], {type: 'image/svg+xml'});
		var url = DOMURL.createObjectURL(svg);
		img.onload = function () {
			  setTimeout(function(){
			  canvasDocument.ctx.drawImage(img, 0, 0);
			  console.log(img);
			  DOMURL.revokeObjectURL(url);
			  callback(img);
		  },10);
		}
	  	img.src = url;
	}

	return canvasDocument;
}