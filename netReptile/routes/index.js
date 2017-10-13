var express = require('express');
var collect = require('../public/javascripts/collect1');
var router = express.Router();
var db = require('../public/javascripts/mysql-pool');

/* GET home page. */
router.get('/', function(req, res, next) {
	/* db.con('select distinct name from filmname', function(result){
		res.send(result);
	}); */
	/* db.con("insert into filmname values(name, '死亡的尽头')", function(result){
		res.send(result);
	}); */
    collect.CollectFilmInfo(function (html) {
        res.send(html);
    })
	
	/*  collect.CollectFilmName(function (html) {
		res.send(html);
    })  */
	
	/* collect.CollectWatchName(function (html) {
        res.send(html);
    }) */
});

module.exports = router;