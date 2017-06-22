var dbHandler = require('../code/dbHandler.js');
var crypto = require('crypto');

var registerSql = 'insert into users(name,password) values(';
//register
var registerQuery = function(name, password, response){
    var sql = registerSql + "'" +name + "'"+',' + "'"+GetHashPW(name, password) +"'"+ ');';
    dbHandler.query(sql, function(err, vals, fields){
        if(err){
            response(err);
        }
        else{
            response(null);
        }
    });
}

//login


function GetHashPW(username, pwd) {
    var hash = crypto.createHash('md5');
    hash.update(username + pwd);
    return hash.digest('hex');
}

exports.registerQuery = registerQuery;
exports.GetHashPW = GetHashPW;
