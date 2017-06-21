var express = require('express');
var router = express.Router();
var crypto = require('crypto');

function hashPW(username, pwd) {
    var hash = crypto.createHash('md5');
    hash.update(username + pwd);
    return hash.digest('hex');
}

var userdb = [
    {
        userName: "admin",
        hash: hashPW("admin", "12345")
    }
];

function authenticate(userName, hash) {
    for (var i = 0; i < userdb.length; ++i) {
        var user = userdb[i];
        if (userName === user.userName) {
            if (hash === user.hash) {
                return 0;
            } else {
                return 1;
            }
        }
    }
    return 2;
}

function isLogined(req) {
    if (req.cookies["account"] != null) {
        var account = req.cookies["account"];
        var user = account.account;
        var hash = account.hash;
        if (authenticate(user, hash) == 0) {
            console.log(req.cookies.account.account + " had logined.");
            return true;
        }
    }
    return false;
};

/* GET home page. */
router.post('/', function (req, res) {
    var userName = req.body.name;
    var hash = hashPW(userName, req.body.pass);
    switch (authenticate(userName, hash)) {
        case 0:
            res.cookie("account", { account: userName, hash: hash }, { maxAge: 60000 });
            res.redirect('/');
            break;
        case 1:
            res.send('密码错误');
            break;
        case 2:
            res.send('用户名不存在');
            break;
    }
});

module.exports = router;