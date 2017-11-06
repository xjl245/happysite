//window.onload = function(){
    var socket;
    if(typeof WebSocket != 'undefined'){
        socket = io.connect('/back', {transports: ['websocket']});
    }
    else{
        socket = io.connect('/back', {transports: ['polling']});
    }

    socket.emit('start');

    socket.on('shareData', function(docs){
        console.log(docs);
    })
//}