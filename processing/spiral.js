var Jimp = require('jimp')


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


function spiralize(width, height, image, callback) {

  Jimp.read(image, function(err, img){

    console.log(err)
    // todo handle size, crop to a square

    var img_w = img.bitmap.width;
    var img_h = img.bitmap.height;

    console.log(img_h + " " + img_w)

    var img = img.greyscale();

    //img.write('cat-bw.jpg')

  var points = [];

  var angle = 0;
  var spoke = 0;
  var angleInc = Math.PI*2  /  100;    // A circle divided into sections of 100
  var spokeInc = 0.05;


  var x = width/2;
  var y = height/2;

  var absX, absY = 0

  //ctx.moveTo(x, y);

  points.push([x, y, 1]);



  while ( ! hitWall(x+absX, y+absY, width, height))  {


    //ctx.lineTo(absX + x, absY+y);
    // ctx.lineWidth = 1;
    // ctx.stroke();

    console.log(x+absX, y+absY);

    var pixel = img.getPixelColor(Math.min(x+absX, width-1), Math.min(y+absY, height-1));
    //console.log(pixel);
    //console.log(Jimp.intToRGBA(pixel));

    var color = Jimp.intToRGBA(pixel)['r'];   // r g b all same so take any
    //console.log('colour' +color);

    //Thickness needs to be in range 0-4

    var thickness = 4 - (color / 64);

    var data = [absX+x, absY + y, thickness];
    console.log(data)
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

module.exports = spiralize;
