var mysql=require("mysql");

var pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'admin',
    port: '3306',
    database: 'test'
})

/* var pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '12345',
    port: '3306',
    database: 'test'
}) */

var db = {};

db.con = function (sql, result) { 
    pool.getConnection(function (err, connection) {
        if (err) {    
            console.log('get connection error');
        } else {
            connection.query(sql, function(error, rows){
				if(error){
					console.log(error);
					result(error);
				}
				else{
					result(null, rows);
				}
			});
        }
        connection.release();
    })
}

module.exports = db;