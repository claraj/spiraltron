var flickr = require('./flickr')
var twitter = require('./twitter')
var spiral = require('../processing/spiral');

/* Configuration */
var outSize = 1000;
var subject = 'portrait';
var withinHours = 8;            // Bot runs every 8 hours. Try to avoid fetching repeated images.
var outFileName = 'spiral.png';


flickr.requestPhotoData(subject, withinHours, function(err, data) {

  if (err) {
    console.log('Error in getPicture' + err);
  }

  else {

    if (data.photos.total < 1) {
      console.log('no photos found for query');  // todo, perform another search?
      return;
    }

    console.log(data.photos.total + ' photos found');  // todo, perform another search?

    var results = Math.min(data.photos.total, data.photos.perpage);   // How many results returned?
    var index = Math.floor(results * Math.random());        // Randomly pick a result

    photo = data.photos.photo[index];
    console.log(index, photo);

    var photoUrl = flickr.getPhotoUrl(photo);
    var flickrUrl = flickr.getFlickrPageUrl(photo);

    spiral.spiralize(outSize, photoUrl, function(err, points){

      if (err) {
        console.log('Spiralizing error ' + err);
      }
      else {

        spiral.outputImage(points, outSize, outFileName, function(err){
          if (err) {
            console.log('save error ' + err);
          }

          flickr.getAttribution(photo, function(err, data){
            if (err) {
              console.log('error  ' +  error);
            } else {

              // Create a status and post to Twitter
              console.log('Image attribute data ' +  JSON.stringify(data));

              var status = 'Spiralized from ' + flickrUrl + ' posted by ' + data.user.username._content;
              console.log('Status: ' + status);

              twitter(status, outFileName, function(err, tweet){
                if (err) {
                  console.log('error posting tweet');
                } else {
                  console.log('Tweet posted, check twitter');
                }
              });
            }
          });
        });
      }
    });   // end of spiralize
  }  // end of else
});
