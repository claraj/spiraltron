
console.log('rar')

function draw(points) {

  var canvas = document.getElementById('spiral');
  var ctx = canvas.getContext('2d');
  //ctx.beginPath();

  if (points.length > 1) {
    ctx.moveTo(points[0][0], points[0][1])
  } else {
    return;
  }


  for (var p = 1 ; p < points.length ; p++) {

    ctx.beginPath();

    var data = points[p]
    var prev = points[p-1]

    ctx.lineWidth = data[2]

    ctx.moveTo(prev[0], prev[1])

    ctx.lineTo(data[0], data[1])

    ctx.stroke()

  }

  console.log('rar')


}

$(function(){

  console.log('hello')


  $.ajax({
    method:'get',
    url: '/spiral'
  }).done(function(points){
    console.log('points' + points)
    draw(points);
  }).fail(function(err){
    console.log(err);
  })
});
