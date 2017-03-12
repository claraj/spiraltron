var express = require('express');
var router = express.Router();

var spiral = require('../processing/spiral')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' , h : 800, w : 800 });
});


router.get('/spiral', function(req, res, next){

  console.log('spiraling route');

  spiral(800, 800, 'grey_white_cat_square.jpeg', function(err, points){

    console.log('spiraling callback');

    if (err) {
      console.log(err);
      return res.json([])
    }

    return res.json(points)

  })


});


module.exports = router;
