var request = require('request');

/* Hit Flickr to get a cat picture, uploaded today, with free reuse in the licence, and safe for work. */


function requestTodayPhotoData(subject, callback) {

  var twentyFourHoursAgo = (new Date().getTime() / 1000 ) - (24 * 60 * 60 * 1000 )   // Current time - 24 hours in milliseconds
  console.log(twentyFourHoursAgo)

  var baseurl = 'https://api.flickr.com/services/rest'
  var qs = { method : 'flickr.photos.search',
            format: 'json',
            api_key : process.env.FLICKR_KEY,
            text : subject + ' portrait',            //
            min_upload_date : twentyFourHoursAgo,
            licence : '1%2C2%2C4%2C5%2C7%2C8',   // non commercial reuse and modification, may require attribution - but will always attribute images.
            safe_search: 1,      //safe
            nojsoncallback: 1
          }

  request( { url : baseurl, qs : qs }, function(err, response, data){
    if (err) {
      console.log('error ' + err);
      return callback(err)
    }
    //console.log(response)
    //console.log(data)

    imgData = JSON.parse(data)

    console.log('data was ' + data.slice(0, 300) + ' ...')
    return callback(null, imgData);

  });

}

module.exports = requestTodayPhotoData;
