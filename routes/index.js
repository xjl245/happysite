var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    if (req.cookies['account'] !== undefined){
        if (req.cookies['account'].username === '123') {
            res.render('index', {title: 'Express', hasLogined: false});
        }
    }
  else {
      res.render('index', {title: 'Express',hasLogined: true});
  }
});



module.exports = router;
