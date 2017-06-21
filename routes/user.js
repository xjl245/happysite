var express = require('express');
var db = require('../code/dbHandler.js');
var router = express.Router();

var userRegisterSql = 'insert into users(name,password) values';
router.post('/', function(req, res, next) {
    var registerSql = userRegisterSql + '(' + req.body.username + ',' + req.body.password + ');';
    db.query(registerSql, function(err, vals, fields){
        if(err){
            //res.send(err);
            res.send('注册失败。可能是我程序内部出现问题，您可以反馈给我，谢谢。');
        }
        else {
            res.cookie("account", { username: req.body.username, password: req.body.password }, { maxAge: 60000 });
            res.redirect('/');
        }
    });
});

module.exports = router;