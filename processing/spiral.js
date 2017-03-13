var Jimp = require('jimp')
var pure = require('pureimage')
var fs = require('fs')


function hitWall(x, y, width, height) {
  if (x < 0 || x > height) {
    // console.log('x hit wall')
    return true;
  }
  if (y < 0 || y > height) {
    // console.log('y hit wall')
    return true;
  }

//console.log(x + ' ' + y + ' did not hit wall ')
  return false;
}


/* size of square, image location (url or file path, relative to root dir of project), callback */
function spiralize(size, image, callback) {

  console.log('SPIRALIZE!')

  Jimp.read(image, function(err, img){

    console.log('error? ' + err)
    // todo handle size, crop to a square.

    var img_w = img.bitmap.width;
    var img_h = img.bitmap.height;

    console.log('img size ' + img_h + " " + img_w)

    //var square = Math.min(img_w, img_h);

    // If width > height; landscape; crop to square sides = height
    if (img_w > img_h) {

      var x = (img_w - img_h) / 2
      var y = 0;
      var img = img.crop( x, y, img_h, img_h )

    } else {

      // height >= width (portrait or square)
      var x = 0;
      var y = (img_h - img_w) / 2 ;
      var img = img.crop(x, y, img_w, img_w )
    }


    // Scale to desired size. It's the caller's problem if this is a stupid size.
    img = img.resize(size, size);

    img = img.greyscale();

    img.write('processed_temp.jpg')

  var points = [];

  var angle = 0;
  var spoke = 0;
  var angleInc = Math.PI*2  /  100;    // A circle divided into sections of 100
  var spokeInc = 0.01;

  var height = size;
  var width = size;

  var x = width/2;
  var y = height/2;

  var absX = 0
  var absY = 0

  //ctx.moveTo(x, y);


  points.push([x, y, 1]);
  //console.log('points start' + points)

var count = 1;
  while ( ! hitWall(x+absX, y+absY, width, height) )  {


    //ctx.lineTo(absX + x, absY+y);
    // ctx.lineWidth = 1;
    // ctx.stroke();

    //console.log(x+absX, y+absY);

    var pixel = img.getPixelColor(Math.min(x+absX, width-1), Math.min(y+absY, height-1));
    //console.log(pixel);
    //console.log(Jimp.intToRGBA(pixel));

    var color = Jimp.intToRGBA(pixel)['r'];   // r g b all same so take any
    //console.log('colour' +color);

    //Thickness needs to be in range 0-4

    var thickness = 4 - (color / 64);

    //console.log(absX + ' ' + x )

    var data = [absX+x, absY + y, thickness];

    //console.log(data)

    points.push(data);

    spoke += spokeInc;
    angle += angleInc;

    var absX = Math.sin(angle) * spoke;
    var absY = Math.cos(angle) * spoke;


  }

  console.log('length ' + points.length)
    callback(null, points);

  });
}


function outputImage(points, size, outfile, callback) {

  // Create square, draw lines on it according to points,
  // return filename

  console.log('outputImage function')

  var img = pure.make(size, size, { fillval : 0xffffffff});

  console.log('outputImage created')

  var ctx = img.getContext('2d');


//  ctx.fillRect(0,0,100,100);

  // pure.encodePNG(img, fs.createWriteStream(outfile), function(err){
  //   console.log('saved to ' + outfile)
  // });


  ctx.beginPath();
  // ctx.strokeStyle = 'rgba(30,30,30,1)';

  ctx.moveTo(points[0][0], points[0][1]);

  ctx.strokeStyle = 'rgba(255,255,255,1)';
  // ctx.strokeStyle = 'rgba(0,0,0,1)';

  for (var p = 1 ; p < points.length; p++) {

    var data = points[p]

    // Draw line
  //  console.log('will draw point ' + p + ' ' + data)

    ctx.beginPath();
    // console.log('1')

      //  ctx.strokeStyle = 'rgba(30,30,30,1)';

        var prev = points[p-1]
        // console.log('2' + prev)

        //ctx.lineWidth = data[2]  //This does nothing, not implemented. Have to create own solution

        var thickness = data[2]

        // Change thickness to rgb. thickness ranges from 0 to 4.

        var color = Math.min( 255, 256 - (thickness * 64));

        var strokeStr = 'rgba('+ color + ',' + color + ',' + color + ',1)'
        //console.log('thickness = ' + thickness + ' color = ' + color + ' str ' + strokeStr)


        ctx.strokeStyle = strokeStr;


        ctx.moveTo(prev[0], prev[1])
        ctx.lineTo(data[0], data[1])
        ctx.stroke()    // hangs on NaN values

        //console.log('drew point ' + p + ' ' + data)

  }

  pure.encodePNG(img, fs.createWriteStream(outfile), function(err){
    if (err) {
      console.log('error saving to ' + outfile)
      console.log(err)
      return callback(err)

    } else {
    console.log('saved to ' + outfile)
    return callback()
  }
  });


}


module.exports = { spiralize : spiralize,  outputImage : outputImage};
