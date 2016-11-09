CanvasDoc solves the problem of creating a PDF entirely within the web browser while supporting the full range of Unicode characters.

CanvasDoc does this without having to download enormous unicode font files.

The trick is to convert HTML into a canvas document and save that as an image to a PDF. If you real text that can be highlighted and copied and pasted, this isn't the solution for you.

Currently this is very basic. It only supports text, no images or styles. inline elements are ignored. All block level elements are treated as line breaks. The only exceptions are <p> elements, which are line-breaks with some padding. Unordered lists get bullets and indentation. RTL is not supported yet.

If you find a library that can create a client-side PDF with full unicode support that uses real text, please let me know!

Demo page: https://andrewhilts.github.io/canvasdoc/
