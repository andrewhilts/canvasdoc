function textToWords(text){
 	var re = /[\0-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g
	var characters = text.match(re);

	var el = document.createElement('div');
	el.style.width = 0;
	el.style.position = 'absolute';
	el.style.visibility = 'hidden';
	var oldHeight = 0;
	var newHeight;
	var words = [];
	var currentWordIndex = -1;

	document.body.appendChild(el);

	for (var i = 0; i < characters.length; i++) {
		char = characters[i];
		oldHeight = el.offsetHeight;
		el.innerHTML += char;
		newHeight = el.offsetHeight;
		if(newHeight > oldHeight){
			//new array item
			words.push(char)
			currentWordIndex++;
			el.innerText = char;
			newHeight = 0;
		}
		else{
			//append to same word
			words[currentWordIndex] += char;
		}
	}
	return words;
}