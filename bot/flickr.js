var request = require('request');
var qs = require('qs')


var baseurl = 'https://api.flickr.com/services/rest'

function requestPhotoData(subject, hoursAgo, callback) {

  var hours = hoursAgo || 24;

  // date.getTime() returns milliseconds since Jan 1 1970. Convert to seconds, subtract hours worth of seconds
  var timeHoursAgo = Math.floor((new Date().getTime() / 1000) - (hours * 60 * 60))   // Current time - 24 hours in milliseconds
  console.log(timeHoursAgo)

  var qs = {
    method : 'flickr.photos.search',
    format: 'json',
    api_key : process.env.FLICKR_KEY,
    text :  subject,
    min_upload_date : timeHoursAgo,
    license : '1,2,4,7,8,9,10',   // Licences that have no copyright restrictions or permit reuse with derivatives and attribution
    safe_search: 1,      //safe for work
    nojsoncallback: 1    // or JSONP is returned
  }

  request( { url : baseurl, qs : qs }, function(err, response, data){

    if (err) {
      console.log('error ' + err);
      return callback(err)
    }

    try {
      var imgData = JSON.parse(data);
    } catch (e) {
      console.log('Error parsing JSON response from Flickr');
      return callback(e);
    }


    if (imgData.stat == 'fail') {
      console.log('Flickr error')
      return callback(new Error(imgData.message));
    }

    console.log('data was ' + data.slice(0, 300) + ' ...');
    return callback(null, imgData);
  });
}


function getPhotoUrl(photo){
  // Photo object is expected to be like this { "id": "33231701482", "owner": "24354425@N03", "secret": "b5d9fe546a", "server": "3686", "farm": 4, "title": "Yuba Guarding the Futons", "ispublic": 1, "isfriend": 0, "isfamily": 0 },
  // To obtain the image, Need to make URL like this https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}.jpg

  var photourl = 'https://farm' + photo.farm + '.staticflickr.com/'+ photo.server+ '/'+ photo.id +'_' + photo.secret + '.jpg'
  console.log('photourl is ' + photourl);
  return photourl;

}


function getFlickrPageUrl(photo) {
  // Create a direct link to the page that the photo is on; contains more info about the picture
  var flickrUrl = 'https://www.flickr.com/photos/' + photo.owner + '/' + photo.id ;
  console.log(flickrUrl);
  return flickrUrl;
}


function getPhotoInfo(photo, callback) {

  var query = {
    method: 'flickr.photos.getInfo',
    api_key: process.env.FLICKR_KEY,
    photo_id: photo.id,
    secret: photo.secret,
    format: 'json',
    nojsoncallback: 1
  }

  request( {url:baseurl, qs: query}, function(err, response, data){

    if (err) {
      console.log(err)
      return callback(err);
    }

    try {
      console.log(data)
      var photoInfo = JSON.parse(data);
    } catch (e) {
      console.log('Error parsing photo info JSON response from Flickr');
      return callback(e);
    }

    return callback(null, photoInfo);
  });


}


function getLicence(photo, callback) {

  /* Get link to licence, for proper attribution */

  // First get photo info
  getPhotoInfo(photo, function(err, photoInfo){

    var query = {
      method: 'flickr.photos.licenses.getInfo',
      api_key: process.env.FLICKR_KEY,
      format: 'json',
      nojsoncallback: 1
    }

    request( { url : baseurl, qs : query }, function(err, response, data) {

      if (err) {
        console.log(err)
        return callback(err);
      }

      try {
        var licenseData = JSON.parse(data).licenses.license;

      } catch (e) {
        return callback(e);
      }

      var license = photoInfo.photo.license; //// license is photo.license, (e.g. '7')

      for (var l = 0; l < licenseData.length ; l++) {
        if (licenseData[l].id == license ) {
          return callback(null, licenseData[l]);
        }
      }
      callback(new Error('Licence information not found'));
    });
});

}


function getAttribution(photo, callback) {

  /* Provide the photourl, e.g. https://www.flickr.com/photos/126377022@N07/14597997549
  as argument to this call https://www.flickr.com/services/api/explore/flickr.urls.lookupUser
  */

  var url = getFlickrPageUrl(photo)

  var query = {
    method : 'flickr.urls.lookupUser',
    url : url,
    format: 'json',
    api_key : process.env.FLICKR_KEY,
    nojsoncallback: 1
  }

  //var testurl = 'https://api.flickr.com/services/rest/?method=flickr.urls.lookupUser&api_key=ec06d9fc8174525e2a5725388d751489&url=https%3A%2F%2Fwww.flickr.com%2Fphotos%2F126377022%40N07%2F14598229028&format=json&nojsoncallback=1'

  console.log('query string will be '+ qs.stringify(query))

  // TODO why doesn't this work when request parses the query object above? Problem parsing the URL? It uses qs.stringify internally?
  request(baseurl + '/?'+ qs.stringify(query), function(err, res, data){
  //  request(testurl, function(err, res, data){
    if (err) {
      console.log('Error fetching image attribution data ' + err);
      return callback(err);
    } else {

      console.log(data)
      try {
        userData = JSON.parse(data);
      } catch (e) {
        console.log('Error parsing JSON data from Flickr get attribution call');
        return callback(e);
      }

      if (userData.stat == 'fail') {
        console.log('Flickr error')
        return callback(new Error(imgData.message));
      }

      // Get license

      getLicence(photo, function(err, licenseData){

        if (err) {
          return callback(err);
        }

        return callback(null, userData, licenseData);
      })
    }
  });

}


module.exports = {
  requestPhotoData,
  getPhotoUrl,
  getFlickrPageUrl,
  getAttribution
}
