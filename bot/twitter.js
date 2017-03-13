var Twitter = require('twitter');
var fs = require('fs');

function post(status, image, callback) {

  var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
  })

  img = fs.readFileSync(image);

  client.post('media/upload', {media:img}, function(error, media, response){

    if (!error) {

        // media object returned. Can tweet it,

        var statusText = {
          status: status,
          media_ids: media.media_id_string
        }

        client.post('statuses/update', statusText, function(error, tweet, response) {
          if (!error) {

            console.log('Tweeted ' + tweet.text)
            callback(null, tweet)
          } else {
            console.log('error tweeting ' + error)
            callback(error)
          }
        })

    } else {
      console.log('error creating media ' + error)
    }

  });


}


module.exports = post;
