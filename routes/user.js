var express = require('express');
var dbHandler = require('../code/dbUserinfoHandler.js');
var router = express.Router();

router.post('/', function(req, res, next) {
    dbHandler.registerQuery(req.body.username, req.body.password, function(err){
        if(err){
            res.send(err);
            //res.send('注册失败。可能是我程序内部出现问题，您可以反馈给我，谢谢。');
        }
        else{
            res.cookie("account", { username: req.body.username, password: dbHandler.GetHashPW(req.body.username, req.body.password) }, { maxAge: 60000 });
            res.redirect('/');
        }
    });
});

module.exports = router;