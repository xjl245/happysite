window.onload = function(){
    var socket;
    if(typeof WebSocket != 'undefined'){
        socket = io.connect('/user', {transports: ['websocket']});
    }
    else{
        socket = io.connect('/user', {transports: ['polling']});
    }

    $('#savefilm').click(function(){
        var name = $('#sharefilmname').val().trim();
        var url = $('#sharefilmurl').val().trim();
        var info = {name:name, url:url};
        socket.emit('share', info);
    })

    $('#saveres').click(function(){
        var contact = $('#contact').val().trim();
        var res = $('#res').val().trim();
        var info = {contact:contact, res:res};
        socket.emit('res', info);
    })
}
