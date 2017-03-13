var PImage = require('pureimage');
var img1 = PImage.make(400,450);
var fs = require('fs')
//Fill with a red rectangle with 50% opacity

var ctx = img1.getContext('2d');
ctx.fillStyle = 'rgba(0,255,0,0.5)';
ctx.strokeStyle = 'rgba(0,255,0,0.5)';
ctx.fillRect(0,0,100,100);
//Write out to a PNG file (uses pngjs)
ctx.moveTo(200, 300)
ctx.lineTo(300, 200)
ctx.stroke()


PImage.encodePNG(img1, fs.createWriteStream('out.png'), function(err) {
    console.log("wrote out the png file to out.png");
});
