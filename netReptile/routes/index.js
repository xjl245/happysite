var express = require('express');
var collect = require('../public/javascripts/collect');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    collect.CollectFilmInfo(function (html) {
        res.send(html);
    })
	
	/* collect.CollectFilmName(function (html) {
        res.send(html);
    }) */
	
	/* collect.CollectWatchName(function (html) {
        res.send(html);
    }) */
});

module.exports = router;