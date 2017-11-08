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
    	})

    	socket.on('res', function(info){
            mongo.ResInsert({email: info.contact, res:info.res}, function(err){
                if(err){
                    console.log(err);
                }
            })
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

            mongo.ResFind(function(err, docs){
                if(err){
                    console.log(err);
                }
                else{
                    socket.emit('resData', docs);
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

        socket.on('delRes', function(id){
            console.log('delRes');
            mongo.ResRemove(id, function(err, result){
                if(err){
                    console.log(err);
                }
                else{
                    socket.emit('delResSuccess', id);
                }
            })
        })

        socket.on('searchBelong', function(name){
            var names = [];
            mongo.Find(name, function(err, docs){      
                if(!err){
                    for(var i = 0; i < docs.length; i++){
                        if(docs[i].type === 0){
                            docs[i].realName += '(电影)';
                        }
                        else if(docs[i].type === 1){
                            docs[i].realName += '(电视剧)';
                        }

                        names.push(docs[i].realName);
                    }

                    socket.emit('result', names);
                }
            })
        })

        socket.on('handledShare', function(data){
        	data.belong = data.belong.substr(0, data.belong.length - 4);
        	mongo.Update(data, function(err, result){
        		if(err){
        			console.log(err);
        		}
        	})
        });
    });
}
