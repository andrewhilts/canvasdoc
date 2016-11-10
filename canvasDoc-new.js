function Page(pageSize, margins, dpiFactor){
	var page = {}
	page.canvas = document.createElement('canvas');
	page.ctx = page.canvas.getContext('2d');
	/// set canvas size representing 300 DPI
	page.canvas.width = pageSize.width;
	page.canvas.height = pageSize.height;

	/// scale all content to fit the 96 DPI display (DPI doesn't really matter here)
	page.canvas.style.width = pageSize.width/dpiFactor/4 + 'px';
	page.canvas.style.height = pageSize.height/dpiFactor/4 + 'px';
	page.canvas.style.margin = 10 + 'px';
	page.canvas.style.border = "1px solid black";

	page.paintPosition = {
		x: margins.left,
		y: margins.top
	}
 
	page.maxPaintPosition = {
		x:  pageSize.width - margins.left - margins.right,
		y:  pageSize.height - margins.bottom
	};

	fontSize = (35 * dpiFactor).toFixed(0);
	page.fontFamily = "Times New Roman, serif"
	page.lineHeight = fontSize * 1.5;

	page.ctx.font = fontSize + 'px' + " " + page.fontFamily;
	page.ctx.fillStyle = '#000';

	page.addBackground = function(){
		destinationCanvas = document.createElement("canvas");
		destinationCanvas.width = pageSize.width;
		destinationCanvas.height = pageSize.height;
		destinationCanvas.style = page.canvas.style;
		destCtx = destinationCanvas.getContext('2d');

		//create a rectangle with the desired color
		destCtx.fillStyle = "#ffffff";
		destCtx.fillRect(0,0,pageSize.width,pageSize.height);
		//draw the original canvas onto the destination canvas
		destCtx.drawImage(page.canvas, 0, 0);
		page.canvas = destinationCanvas;
		page.ctx = destCtx;
		page.canvas.style.width = pageSize.width/dpiFactor/4 + 'px';
		page.canvas.style.height = pageSize.height/dpiFactor/4 + 'px';
	}

	

	return page;
}

function Document(paperType, margins){
	var self = this;
	self.pages = [];

	// Paper types expressed as pixel values at 300ppi
	// self.paperTypes = {
	// 	"letter": {width: 2550, height: 3300},
	// 	"legal": {width: 2550, height: 4200},
	// 	"A4": {width: 2480, height: 3508}
	// }

	self.paperTypes = {
		"letter": {width: 2550/(3.125/2), height: 3300/(3.125/2), pdfSize: {width: 612, height: 792}},
		"legal": {width: 2550/(3.125/2), height: 4200/(3.125/2), pdfSize: {width: 612, height: 1008}},
		"A4": {width: 2480/(3.125/2), height: 3508/(3.125/2), pdfSize: {width: 595.28, height: 841.89}}
	}
	try{
		self.paperType = self.paperTypes[paperType];
		self.paperType.width = self.paperType.width;
		self.paperType.height = self.paperType.height;
	}
	catch(e){
		throw new Error("Paper type " + paperType + " not supported");
	}

	// DPI factor sets it to 300 relative to default 96
	// var dpiFactor = 300 / 96;
	var dpiFactor = 1;

	var marginCalc = function(pageSize, margins){
		return {
			top: pageSize.width * margins[0] / 100,
			right: pageSize.width * margins[1] / 100,
			bottom: pageSize.width * margins[2] / 100,
			left: pageSize.width * margins[3] / 100
		}
	}
	self.activePageIndex = 0;

	self.getActivePageIndex = function(){
		return self.activePageIndex;
	}

	// Set page widths in pixels relative to DPI factor
	self.pageSize = {
		width: self.paperType.width * dpiFactor,
		height: self.paperType.height * dpiFactor
	}
	self.margins = marginCalc(self.pageSize, margins);

	// Add first page
	self.pages.push(new Page(self.pageSize, self.margins, dpiFactor));

	self.writeText = function(text, options, dir){
		activePage = self.pages[self.getActivePageIndex()];
		text = activePage.wrapText(text, options, dir);
		if(text == null){
			return;
		}
		else{
			// Add new page, and keep writing
			self.pages.push(new Page(self.pageSize, self.margins, dpiFactor));
			self.activePageIndex += 1;
			self.writeText(text, options, dir);
		}
	}

	self.writeHTMLtoDoc = function(el, callback){
		self.elToCanvas(el, function(){
			self.canvasToPageCanvases(function(){
				if(typeof callback == 'function'){
					callback();
				}
			})
		})
	}

	self.elToCanvas = function(el, callback){
		self.canvas = document.createElement('canvas');
		self.ctx = self.canvas.getContext('2d');

		var elHeight = el.offsetHeight;
		var elWidth = el.offsetWidth;

		self.canvas.height = elHeight;
		self.canvas.width = elWidth;

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
		  self.ctx.drawImage(img, 0, 0);
		  console.log(img);
		  DOMURL.revokeObjectURL(url);
		  callback();
		  },10);
		}
	}

	self.



img.onload = function () {
  setTimeout(function(){
  ctx.drawImage(img, 0, 0);
  console.log(img);
  DOMURL.revokeObjectURL(url);
  },10);
}

		pdfContent = self.parseEl(el);
		for(var i=0; i < pdfContent.length; i++){
			self.writeText(pdfContent[i].text, pdfContent[i].options, pdfContent[i].dir);
		}
		
	}

	self.createPDF = function(){
		var dd = {
			pageSize: paperType,
			content: [],
			pageMargins: 1
		}
		// Add our canvas pages to the PDF, scale to size
		for (var i = 0; i < self.pages.length; i++) {

			dd.content.push({
				image: self.pages[i].dataURL,
				width: self.paperType.pdfSize.width-(dd.pageMargins*2),
				alignment: 'center'
			})
		}
		self.pdf = pdfMake.createPdf(dd);
	}
	self.openPDF = function(){
		self.pdf.open();
	}
	self.savePDF = function(){
		self.pdf.download('canvas_pdf');
	}
}