window.onload = function(){
    var socket;
    if(typeof WebSocket != 'undefined'){
        socket = io.connect('/first', {transports: ['websocket']});
    }
    else{
        socket = io.connect('/first', {transports: ['polling']});
    }

    $('#register').click(function(){
        var name = $('#registername').val().trim();
        var password = $('#registerpass').val();
        if(name === ''){
            $('#registernameerr').css('display', 'block');
        }
        else{
            $('#registernameerr').css('display', 'none');
        }

        if(password === ''){
            $('#registerpasserr').css('display', 'block');
        }
        else{
            $('#registerpasserr').css('display', 'none');
        }

        if(name !== '' && password !== '') {
            var userinfo = {name: name, password: password};
            socket.emit('register', userinfo);
        }
    })

    socket.on('registerOK', function(){
        $('#registerOK').css('display', 'block');
    });

    socket.on('registerFail', function(){
        $('#registerFail').css('display', 'block');
    });
}
