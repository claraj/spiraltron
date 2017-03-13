var express = require('express');
var router = express.Router();

var spiral = require('../processing/spiral')

/* GET home page, a simple about page with a link to the bot's Twitter account. */
router.get('/', function(req, res, next) {
  res.render('about')
});


module.exports = router;
