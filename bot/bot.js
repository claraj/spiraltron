var flickr = require('./flickr')
var twitter = require('./twitter')
var spiral = require('../processing/spiral');

/* Configuration */
var outSize = 1000;
var subject = 'cat';
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
    console.log('Photo: ' + index, photo);

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

          flickr.getAttribution(photo, function(err, userData, licenseData){
            if (err) {
              console.log('error  ' +  err);
            } else {

              // Create a status and post to Twitter
              console.log('\n');

              console.log('***** Image attribute data \n' +  JSON.stringify(userData));
              console.log('***** Image license data \n' +  JSON.stringify(licenseData));

              var status = 'Spiralized from ' + flickrUrl+ ' by ' + userData.user.username._content + ', ' + licenseData.name + ', ' + licenseData.url;
              console.log('Status: ' + status);
              console.log('Status length: ' + status.length);


              twitter(status, outFileName, function(err, tweet){
                if (err) {
                  console.log('error posting tweet');
                  console.log(err)
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
