var Jimp = require('jimp')
var pure = require('pureimage')
var fs = require('fs')

function hitWall(x, y, width, height) {

  if (x < 0 || x > height) {
    return true;
  }

  if (y < 0 || y > height) {
    return true;
  }
  return false;
}


/* size of square image in pixels, image location (url or file path,
relative to root dir of project), callback function */

function spiralize(size, image, callback) {

  console.log('Spiralize ' + image + ' to ' + size)

  Jimp.read(image, function(err, img){

    if (err) {
      console.log('error opening image ' + image + ', ' + err);
      return callback(err);
    }

    try {

      var img_w = img.bitmap.width;
      var img_h = img.bitmap.height;

      console.log('img size ' + img_h + " " + img_w);

      // If width > height; landscape; crop to square sides = height
      // Opposite for height > width.

      if (img_w > img_h) {
        var x = (img_w - img_h) / 2;
        var y = 0;
        var img = img.crop( x, y, img_h, img_h );
      } else {
        var x = 0;
        var y = (img_h - img_w) / 2 ;
        var img = img.crop(x, y, img_w, img_w );
      }

      // Scale to desired size. It's the caller's problem if this is a stupid size.
      img = img.resize(size, size);
      // Convert to black and white
      img = img.greyscale();

      // Save photograph; useful during debugging; also would be useful if wanted to post
      // both original and spiralized images.
      try {
        img.write('processed_temp.jpg');
      } catch (e) {
        console.log('Error writing temporary file');
        return callback(e);
      }

      var points = [];

      var angle = 0;
      var spoke = 0;
      var angleInc = Math.PI*2  /  100;    // A circle divided into sections of 100
      var spokeInc = 0.01;               // How much to grow the radius of the spriral after every turn

      var height = size;
      var width = size;

      var x = width/2;
      var y = height/2;

      // Create start point at center
      points.push([x, y, 1]);

      var absX = 0;
      var absY = 0;

      while ( ! hitWall(x+absX, y+absY, width, height) )  {

        var pixel = img.getPixelColor(Math.min(x+absX, width-1), Math.min(y+absY, height-1));

        var color = Jimp.intToRGBA(pixel)['r'];   // r g b all same so take any. 0 = black, 255 = white

        var thickness = 4 - (color / 64);    // Convert color into a line 'thickness' value in the range 0-4, where 0=white, 4=darkest.  Opposite to color values.

        var data = [absX+x, absY + y, thickness];

        points.push(data);

        spoke += spokeInc;
        angle += angleInc;   // Rotate, grow spoke

        var absX = Math.sin(angle) * spoke;    // Figure out where next segment goes to.
        var absY = Math.cos(angle) * spoke;

      }

      console.log('Number of points: ' + points.length);
      callback(null, points);
    } catch (e) {
      console.log('Error creating spiral\'s points ' + e);
      callback(e);
    }
  });
}


/*  Create square, draw lines on it according to points.  */
function outputImage(points, size, outfile, callback) {

  try {
    var img = pure.make(size, size, { fillval: 0xffffffff });
    console.log('outputImage created')

    var ctx = img.getContext('2d');

    ctx.beginPath();

    ctx.moveTo(points[0][0], points[0][1]);

    ctx.strokeStyle = 'rgba(255,255,255,1)';

    for (var p = 1 ; p < points.length; p++) {

      var data = points[p];
      var prev = points[p-1];
      var thickness = data[2];

      ctx.beginPath();

      // Change thickness to rgb. thickness ranges from 0 to 4, and use to create strokeStyle string.
      var color = Math.min( 255, 256 - (thickness * 64));
      var strokeStr = 'rgba('+ color + ',' + color + ',' + color + ',1)';

      ctx.strokeStyle = strokeStr;

      ctx.moveTo(prev[0], prev[1]);
      ctx.lineTo(data[0], data[1]);
      ctx.stroke();   // hangs on NaN values

    }
  } catch (e) {
    console.log('Error creating spiralized image ' + e);
    return callback(e);
  }
  pure.encodePNG(img, fs.createWriteStream(outfile), function(err){
    if (err) {
      console.log('error saving to ' + outfile);
      return callback(err);

    } else {
      console.log('saved to ' + outfile);
      return callback();
    }
  });

}


module.exports = {
  spiralize: spiralize,
  outputImage: outputImage
};
