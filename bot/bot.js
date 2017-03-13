var getPicture = require('./getpicture')

var spiral = require('../processing/spiral');

getPicture('kitten', function(err, data) {
  console.log('getpicture callback')
  if (err) {  console.log(err)   }
  else {
    //console.log(data)
    // take first
    if (data['photos']['total'] < 1) {
      console.log('no photos for query')
      // todo another search?
    }

    // Take first result
    photo = data['photos']['photo'][0];

    // Object like this { "id": "33231701482", "owner": "24354425@N03", "secret": "b5d9fe546a", "server": "3686", "farm": 4, "title": "Yuba Guarding the Futons", "ispublic": 1, "isfriend": 0, "isfamily": 0 },
    // Need to make URL like this https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}.jpg

    var photourl = 'https://farm' + photo.farm + '.staticflickr.com/'+ photo.server+ '/'+ photo.id +'_' + photo.secret + '.jpg'
    console.log('photourl ' + photourl)

    var size = 1000;

    spiral.spiralize(size, photourl, function(err, points){

      console.log('spiralize callback')


      if (err) {
        console.log(err)
        return;
      }
      else {

        console.log('points ' + points.length)

        spiral.outputImage(points, size, 'whereareyouimg.png', function(err){
          if (err) {
            console.log(err)
          }
          console.log('outputImage callback')
        });
      }
    })   // end of spiralize

  }  // end of else

})
