var dbHandler = require('../code/dbHandler.js');

var registerSql = 'insert into users(name,password) values';
//register
var registerQuery = function(name, pasword, response){
    var sql = registerSql + '(' + name + ',' + pasword + ');';
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

exports.registerQuery = registerQuery;
