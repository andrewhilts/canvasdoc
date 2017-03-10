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


function cd_CanvasDocument(pageSize, sourcecanvas, numberOfPages){
	var self = {};
	self.numberOfPages = numberOfPages;
	var pageSizeRatios = {
		"letter": 1.294117647058824,
		"legal": 1.647058823529412,
		"A4": 1.41354292623942
	};

	try{
		self.pageSizeRatio = pageSizeRatios[pageSize];
	}
	catch(e){
		alert(e);
		return;
	}
	self.paperTypes = {
		"letter": {width: 2550/(3.125/2), height: 3300/(3.125/2), pdfSize: {width: 612, height: 792}},
		"legal": {width: 2550/(3.125/2), height: 4200/(3.125/2), pdfSize: {width: 612, height: 1008}},
		"A4": {width: 2480/(3.125/2), height: 3508/(3.125/2), pdfSize: {width: 595.28, height: 841.89}}
	}
	try{
		self.paperType = self.paperTypes[pageSize];
		self.paperType.width = self.paperType.width;
		self.paperType.height = self.paperType.height;
	}
	catch(e){
		throw new Error("Paper type " + paperType + " not supported");
	}

	self.canvas = sourcecanvas;
	self.ctx = sourcecanvas.getContext('2d');

	self.createPages = function(img){
		self.pages = []
		// document.body.appendChild(img);
		var canvas = document.createElement("canvas");
		canvas.width = self.pageWidth;
		canvas.height = self.pageHeight;

		var ctx = canvas.getContext('2d');
		
		for(var i=0; i < self.numberOfPages; i++){
			xOffset = i*self.pageWidth+(36*i);
			ctx.fillStyle = "#ffffff";
			ctx.fillRect(0,0,self.pageWidth,self.pageHeight);
			ctx.drawImage(img, xOffset, 0, self.pageWidth,self.pageHeight, 0, 0, self.pageWidth,self.pageHeight);
			dataurl = canvas.toDataURL("image/jpeg");
			self.pages.push(dataurl);
			newimg = document.createElement('img');
			newimg.setAttribute('src', dataurl);
			newimg.setAttribute('width', '25%');
			console.log(i, xOffset);
			document.body.appendChild(newimg);
		}
		console.log(self.pages.length);
		self.createPDF();
		self.savePDF();
	}
	self.savePDF = function(){
		self.pdf.download('canvas_pdf');
	}
	self.createPDF = function(){
		var dd = {
			pageSize: self.pageSize,
			content: [],
			pageMargins: 55,
			header: {stack: [
            {text: ''}
        ],
		        margin: [55,0]
		    },
		    footer: {stack: [
            {text: ''}
        ],
		        margin: [55,0]
		    },
		}
		// Add our canvas pages to the PDF, scale to size
		for (var i = 0; i < self.pages.length; i++) {

			dd.content.push({
				image: self.pages[i],
				width: self.paperType.pdfSize.width-(55*2),
				alignment: 'center'
			})
		}
		self.pdf = pdfMake.createPdf(dd);
	}

	self.createFromEL = function(el, callback){

		var elWidth = el.offsetWidth;
		var elHeight = el.offsetHeight;

		function textNodesUnder(el){
		  var n, a=[], walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null,false);
		  while(n=walk.nextNode()) a.push(n);
		  return a;
		}

		textNodes = textNodesUnder(el);
		textContent = [];
		for(var i=0; i < textNodes.length; i++){
			replacementNode = document.createElement('span');
			parentNode = textNodes[i].parentNode;
			entitified = textNodes[i].textContent.replace(/[\0-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]<>\&]/gim, function(i) {
			   return '&#'+i.codePointAt()+';';
			});
			textContent.push({
				original: textNodes[i].textContent,
				entities: entitified
			})
		}
		//36 is the column gap
		self.canvas.width = elWidth*self.numberOfPages + (36*(self.numberOfPages-1));
		self.canvas.height = elHeight;
		self.pageHeight = elHeight;
		self.pageWidth = self.pageHeight/self.pageSizeRatio;


		parsedHTML = el.innerHTML;
		for(var i=0; i < textContent.length; i++){
			parsedHTML = parsedHTML.replace(textContent[i].original, textContent[i].entities);
		}
		console.log(self.pageHeight, self.pageWidth, self.canvas.width);

		var data = '<svg xmlns="http://www.w3.org/2000/svg" width="' + self.canvas.width +'" height="' + self.pageHeight + '" viewBox="0 0 ' + self.canvas.width + ' ' + self.pageHeight + '">' +
           '<foreignObject width="100%" height="100%" requiredExtensions="http://www.w3.org/1999/xhtml">' +
           '<div xmlns="http://www.w3.org/1999/xhtml">' +
           '<style>.document {-webkit-column-rule: 4px outset #000; -moz-column-rule: 4px outset #000; column-rule: 4px outset #000; font-size:36px; -webkit-column-width: ' + self.pageWidth + 'px; -moz-column-width: ' + self.pageWidth + 'px; column-width: ' + self.pageWidth + 'px; -webkit-column-gap: 36px; -moz-column-gap: 36px; column-gap: 36px; height:' + self.pageHeight + 'px; width: ' + self.pageWidth+ 'px}</style>' +
             parsedHTML +
           '</div>' +
           '</foreignObject>' +
           '</svg>';

		var DOMURL = window.URL || window.webkitURL || window;

				var img = new Image();
		var url = 'data:image/svg+xml;base64,' + btoa(data);
		

		img.onload = function () {
		// document.getElementById("img-container").appendChild(img);
		// self.ctx.fillStyle = "#ffffff";
		// self.ctx.fillRect(0,0,self.canvas.width,self.canvas.height);
		// self.ctx.drawImage(img, 0, 0);
		// DOMURL.revokeObjectURL(url);
		// data = getData(self.ctx);
			callback(img);
		};
		img.src = url;

		// function getData(ctx) {
		// try {
		// 	data = self.canvas.toDataURL("image/jpeg")
		// 	return data;
		// } catch(e) {
		// alert(e);
		// }
		// }
	};

	return self;
}