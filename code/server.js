var socketIO = require('socket.io');
var mongo = require('../netReptile/public/javascripts/mongo');

module.exports.bindServer = function(server){
    var sio = socketIO.listen(server);

    sio.of('/user').on('connection', function(socket){
    	socket.on('share', function(info){
    		mongo.ShareInsert({filmName: info.name, filmUrl: info.url}, function(err){
    			if(err){
    				console.log(err);
    			}
    		})

    		/*mongo.ShareFind(function(err, docs){
    			if(err){
    				console.log(err);
    			}
    			console.log(docs);
    		})*/
    		//console.log(info.name);
    		//console.log(info.url);
    	})

    	socket.on('res', function(info){
    		console.log(info.contact);
    		console.log(info.res);
    	})
    });

    sio.of('/back').on('connection', function(socket){
    	socket.on('start', function(){
    		mongo.ShareFind(function(err, docs){
    			if(err){
    				console.log(err);
    			}
    			else{
    				socket.emit('shareData', docs);
    			}
    		})
    	});

        socket.on('delFilm', function(id){
            mongo.ShareRemove(id, function(err, result){
                if(err){
                    console.log(err);
                }
                else{
                    socket.emit('delSuccess', id);
                }
            })
        })
    });
}
