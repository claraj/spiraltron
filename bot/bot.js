var flickr = require('./flickr')
var twitter = require('./twitter')
var spiral = require('../processing/spiral');

var outSize = 1000;
var subject = 'kitten'
var withinHours = 24
var outFileName = 'spiral.png'


flickr.requestTodayPhotoData(subject, withinHours, function(err, data) {
  console.log('getpicture callback')
  if (err) {  console.log(err)   }
  else {
    //console.log(data)
    // take first
    if (data.photos.total < 1) {
      console.log('no photos for query')
      // todo another search?
    }

    var results = Math.min(data.photos.total, data.photos.perpage )

    // Randomly pick a result
    var index = Math.floor(results * Math.random())
    console.log(results + ', ' + index)
    photo = data.photos.photo[index];

    console.log(index, photo)

    // Object like this { "id": "33231701482", "owner": "24354425@N03", "secret": "b5d9fe546a", "server": "3686", "farm": 4, "title": "Yuba Guarding the Futons", "ispublic": 1, "isfriend": 0, "isfamily": 0 },
    // Need to make URL like this https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}.jpg

    var photoUrl = flickr.getPhotoUrl(photo)
    var flickrUrl = flickr.getFlickrPageUrl(photo);


    spiral.spiralize(outSize, photoUrl, function(err, points){

      console.log('spiralize callback')


      if (err) {
        console.log(err)
        return;
      }
      else {

        console.log('points ' + points.length)

        spiral.outputImage(points, outSize, outFileName, function(err){
          if (err) {
            console.log('save error ' + err)
          }
          console.log('outputImage callback')

          flickr.getAttribution(photo, function(err, data){
            if (err) {
              console.log('error  ' +  error)
            } else {

              // Create a status
              // Post to Twitter
              console.log('attr data ' +  data)

              var status = 'Spiralized from ' + flickrUrl + ' posted by ' + data.user.username._content
              console.log(status)

              twitter(status, outFileName, function(err, tweet){
                if (err) {
                  console.log('error posting tweet')
                } else {
                  console.log('check twitter for tweet ' + tweet.text)
                }
              })

            }
          })


        });
      }
    })   // end of spiralize

  }  // end of else

})
