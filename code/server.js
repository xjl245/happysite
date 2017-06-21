var socketIO = require('socket.io');
var dbuserInfo = require('../code/dbUserinfoHandler.js');

module.exports.bindServer = function(server){
    var sio = socketIO.listen(server);

    sio.of('/first').on('connection', function(socket){
        socket.on('register', function(data){
            dbuserInfo.registerQuery(data.name, data.password, function(err){
                if(err){
                    sokcet.emit('registerFail');
                }
                else{
                    socket.emit('registerOK');
                }
            });
        });
    });
}
