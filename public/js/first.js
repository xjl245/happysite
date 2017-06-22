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
            $('#register').submit();
        }
    })
}
