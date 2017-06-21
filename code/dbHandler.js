var mysql = require('mysql');

var pool = mysql.createPool({
    host:'localhost',
    user:'root',
    password:'12345',
    database:'site_data'
});

var query = function(sql, callback){
    pool.getConnection(function(err, conn){
       if(err){
           callback(err, null, null);
       }
       else{
           conn.query(sql, function(err, vals, fields){
               //release connection
               conn.release();
               callback(err, vals, fields);
           });
       }
    });
}

exports.query = query;
