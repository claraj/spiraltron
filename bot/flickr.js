var request = require('request');
var qs = require('qs')
/* Hit Flickr to get a cat picture, uploaded today, with free reuse in the licence, and safe for work. */

var baseurl = 'https://api.flickr.com/services/rest'


function requestTodayPhotoData(subject, hoursAgo, callback) {

  var hours = hoursAgo || 24;

  var twentyFourHoursAgo = Math.floor((new Date().getTime() / 1000 ) - (hours * 60 * 60 * 1000 ))   // Current time - 24 hours in milliseconds
  console.log(twentyFourHoursAgo)

  var qs = { method : 'flickr.photos.search',
            format: 'json',
            api_key : process.env.FLICKR_KEY,
            text :  subject +' portrait',            //
            min_upload_date : twentyFourHoursAgo,
            //license : '1,2,4,5,7,8',   // non commercial reuse and modification, may require attribution - but will always attribute images.
            license : '7,8',   // non commercial reuse and modification, may require attribution - but will always attribute images.
            safe_search: 1,      //safe
            nojsoncallback: 1
          }

  request( { url : baseurl, qs : qs }, function(err, response, data){

    // console.log(response)
    // console.log(response.url)

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


function getPhotoUrl(photo){

      var photourl = 'https://farm' + photo.farm + '.staticflickr.com/'+ photo.server+ '/'+ photo.id +'_' + photo.secret + '.jpg'
      console.log('photourl ' + photourl)

      return photourl

}

function getFlickrPageUrl(photo) {
var flickrUrl = 'https://www.flickr.com/photos/' + photo.owner + '/' + photo.id ;
console.log(flickrUrl)
return flickrUrl;
}


function getAttribution(photo, callback) {


            // Get attribution

            /* url = https://www.flickr.com/photos/126377022@N07/14597997549
            into this call https://www.flickr.com/services/api/explore/flickr.urls.lookupUser
*/

console.log('get attr')

   var url = getFlickrPageUrl(photo)
   console.log('get attr for ' + url)

   var query = {
     method : 'flickr.urls.lookupUser',
     url : url,
     format: 'json',
     api_key : process.env.FLICKR_KEY,
     nojsoncallback: 1
    }

//var testurl = 'https://api.flickr.com/services/rest/?method=flickr.urls.lookupUser&api_key=ec06d9fc8174525e2a5725388d751489&url=https%3A%2F%2Fwww.flickr.com%2Fphotos%2F126377022%40N07%2F14598229028&format=json&nojsoncallback=1'

console.log('query string will be '+ qs.stringify(query))

// TODO why doesn't this work when request parses the query object? It uses qs.stringify internally?
  request(baseurl + '/?'+ qs.stringify(query), function(err, res, data){
//  request(testurl, function(err, res, data){
     if (err) {
       console.log(err)
     } else {
       console.log(data)
       //console.log(res)

       userData = JSON.parse(data)

        callback(err, userData)
     }
   })

}


module.exports = {
  requestTodayPhotoData,
  getPhotoUrl,
  getFlickrPageUrl,
  getAttribution
}
