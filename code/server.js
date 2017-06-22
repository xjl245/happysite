var socketIO = require('socket.io');

module.exports.bindServer = function(server){
    var sio = socketIO.listen(server);

    sio.of('/first').on('connection', function(socket){
    });
}
