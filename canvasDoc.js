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

	page.fontSize = (35 * dpiFactor).toFixed(0);
	page.fontFamily = "Times New Roman"
	page.fontlangs = {
		"zh":  "Hiragino Sans GB"
	}
	page.lineHeightlangs = {
		"zh": page.fontSize * 1.1
	}
	page.lineHeight = page.fontSize * 1.3;

	fontArgs = page.ctx.font.split(' ');
	page.ctx.font = page.fontSize + 'px' + ' ' + fontArgs[fontArgs.length - 1]; 
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

	page.wrapText = function(text, options, dir) {
		var continuing = false;
		if(typeof text == "string"){
			var words = textToWords(text);
		}
		else if(typeof text[0] !== "undefined"){
			var words = text;
			continuing = true;
		}

		startX = this.paintPosition.x;

		var maxWidth = page.maxPaintPosition.x;

		var line = '';

		var bulletItem = false;
		var lineHeight;
		
		if(options.lang && page.lineHeightlangs[options.lang]){
				fontArgs = page.ctx.font.split(' ');
	page.ctx.font = page.fontSize + 'px' + ' ' + fontArgs[fontArgs.length - 1]; 
			lineHeight = page.lineHeightlangs[options.lang];
		}
		else{
				fontArgs = page.ctx.font.split(' ');
	page.ctx.font = page.fontSize + 'px' + ' ' + fontArgs[fontArgs.length - 1]; 
			lineHeight  = page.lineHeight;
		}

		var bottomMargin = page.lineHeight * 1.5;

		if(options.lang && page.fontlangs[options.lang]){
				fontArgs = page.ctx.font.split(' ');
	page.ctx.font = page.fontSize + 'px' + ' ' + fontArgs[fontArgs.length - 1]; 
		}
		else{
				fontArgs = page.ctx.font.split(' ');
	page.ctx.font = page.fontSize + 'px' + ' ' + fontArgs[fontArgs.length - 1]; 
		}

		if(typeof options !== "undefined"){
			if((options.bulletItem || options.orderedItem) && !continuing){
				bulletItem = true;
				if(options.bulletItem){
					line = "•   ";
				}
				if(options.orderedItem){
					inx = options.listItemNumber;
					line = inx + ".   ";
				}
				if(dir == "rtl"){
					startX -= 45;
				}
				else{
					startX += 45;
				}
				maxWidth -= 45;
			}
			if((options.bulletItem || options.orderedItem) && continuing){
				bulletItem = true;
				if(dir == "rtl"){
					startX -= 45+40;
				}
				else{
					startX += 45+40;
				}
				maxWidth -= 45+40;
			}
			if(options.noBottomMargin){
				bottomMargin = lineHeight;
			}
		}
		firstNewLineDone = false;

		for(var n = 0; n < words.length; n++) {
			var testLine = line + words[n];
			var metrics = this.ctx.measureText(testLine);
			var testWidth = metrics.width;
			var lineDone;

			// Test if we have additional lines after this one.
			if (testWidth > maxWidth && n > 0) {
				rectStart = startX;
				if(dir == "rtl"){
					startX = maxWidth + this.paintPosition.x;
					rectStart = this.paintPosition.x;
					this.ctx.textAlign = "right"
					this.ctx.direction = "rtl";
				}
				// this.ctx.fillStyle = '#ccc';
				// this.ctx.fillRect(rectStart, this.paintPosition.y-lineHeight, maxWidth, lineHeight);
				// this.ctx.fillStyle = '#000';
				this.ctx.fillText(line, startX, this.paintPosition.y);
				this.ctx.textAlign = "left";
				this.ctx.direction = "ltr";

				if(bulletItem && !firstNewLineDone && !continuing){
					if(dir == "rtl"){
						startX -= 42;
					}
					else{
						startX += 42;
					}
					maxWidth -= 42;
					firstNewLineDone = true;
				}
				line = words[n];
				this.paintPosition.y += lineHeight;
			}
			else {
				line = testLine;
			}
			if(this.paintPosition.y >= page.maxPaintPosition.y){
				return words.slice(n);
			}
		}
		rectStart = this.paintPosition.x;
		if(dir == "rtl"){
			startX = maxWidth + this.paintPosition.x;
			this.ctx.textAlign = "right"
			this.ctx.direction = "rtl";
		}
		// this.ctx.fillStyle = '#ccc';
		// this.ctx.fillRect(rectStart, this.paintPosition.y-page.lineHeight, maxWidth, page.lineHeight);
		// this.ctx.fillStyle = '#000';
		// console.log(line);
		this.ctx.fillText(line, startX, this.paintPosition.y);
		this.paintPosition.y += bottomMargin;
		this.ctx.textAlign = "left";
		this.ctx.direction = "ltr";
		return null;
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

	self.parseHTMLBlockLevelElements = function(containerEl, selector){
		// strip out spans, the non-regex way
		els = containerEl.querySelectorAll('span, strong, i, em, bold, big, small, tt, abbr, acronym, cite, code, dfn, em, kbd, strong, samp, time, var, a, bdo, br, img, map, object, q, script, span, sub, sup, button, input, label, select, textarea');

		for(var i=els.length-1; i >= 0; i--){
			var el = els[i];
			text = document.createTextNode(el.innerText);
			if(el.parentNode){
				el.parentNode.replaceChild(text, el);
			}
		}

		nodes = self.getDescendants(containerEl);
		return nodes;
	}
	self.getDescendants = function(node, accum, textNodes) {
	    var i;
	    accum = accum || [];
	    var childlist = Array.prototype.slice.call(node.children);
	    for (i = 0; i < node.children.length; i++) {
	    	// console.log(node.children[i],childlist.indexOf(node.children[i]));
	    	accum.push({el: node.children[i], parentTagName: node.tagName, tagName: node.tagName, siblingIndex: childlist.indexOf(node.children[i])});
	        self.getDescendants(node.children[i], accum);
	    }
	    return accum;
	}

	self.parseEl = function(el){
		var pdfContent = [];
		nodes = self.parseHTMLBlockLevelElements(el);

		for(var i=0; i < nodes.length; i++){
			// Check if leaf node
			if(nodes[i].el.children.length === 0 && nodes[i].el.innerText.length > 0){
				style = getComputedStyle(nodes[i].el);
				if(typeof style.direction !== "undefined"){
					dir = style.direction;
				}
				else{
					dir = "ltr";
				}
				siblingIndex = nodes[i].siblingIndex;
				
				pdfContent.push({
					'el': nodes[i].el,
					'lang': nodes[i].el.lang ? nodes[i].el.lang : nodes[i].el.parentElement.lang,
					'tag': nodes[i].el.tagName,
					'parentTag': nodes[i].parentTagName,
					'siblingIndex': nodes[i].siblingIndex,
					'text': nodes[i].el.innerText,
					'dir': dir
				});
			}
		}
		for(var i=0; i < pdfContent.length; i++){
			pdfContent[i].options = {};
			pdfContent[i].options.lang = pdfContent[i].lang;

			if(pdfContent[i].tag == "LI"){
				if(pdfContent[i].parentTag == "UL"){
					pdfContent[i].options.bulletItem = true;
				}
				if(pdfContent[i].parentTag == "OL"){
					pdfContent[i].options.orderedItem = true;
					if(pdfContent[i].siblingIndex>0){
						if(pdfContent[i-1].options.listItemNumber){
							if(pdfContent[i].el.value){
								listNumber = pdfContent[i].el.value;
							}
							else{
								listNumber = pdfContent[i-1].options.listItemNumber+1;
							}
						}
						else{
							listNumber = pdfContent[i].siblingIndex+1;
						}
					}
					else{
						if(pdfContent[i].el.parentElement.start){
							listNumber = pdfContent[i].el.parentElement.start
						}
						else{
							listNumber = 1;
						}
					}
					pdfContent[i].options.listItemNumber = listNumber;
				}
				if(i+1 < pdfContent.length && pdfContent[i+1].tag == "LI"){
					pdfContent[i].options.noBottomMargin = true;
				}
			}
			else if(pdfContent[i].tag == "DIV"){
				if(i+1 < pdfContent.length && pdfContent[i+1].tag == "DIV"){
					pdfContent[i].options.noBottomMargin = true;
				}
			}
		}
		return pdfContent;
	}
	self.writeHTMLtoDoc = function(el){
		pdfContent = self.parseEl(el);
		for(var i=0; i < pdfContent.length; i++){
			self.writeText(pdfContent[i].text, pdfContent[i].options, pdfContent[i].dir);
		}
		for (var i = 0; i < self.pages.length; i++) {
			self.pages[i].addBackground();
			self.pages[i].dataURL = self.pages[i].canvas.toDataURL("image/jpeg");
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