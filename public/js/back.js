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
        Insert(docs);
    })

    socket.on('delSuccess', function(id){
        var table = document.getElementById("share");
        var rows = table.rows;
        console.log(rows[0].cells[0].innerText);
        console.log(id);
        for (var i = rows.length - 1; i >= 0; i--) {
            if(rows[i].cells[0].innerText === id){
                table.deleteRow(i);
                break;
            } 
        }
    })

    function Insert(docs){
        for (var i = docs.length - 1; i >= 0; i--) {
            var table = document.getElementById("share");    
            var oneRow = table.insertRow(); 
            var cell1 = oneRow.insertCell(); 
            var cell2 = oneRow.insertCell(); 
            var cell3 = oneRow.insertCell(); 
            var cell4 = oneRow.insertCell(); 
            cell1.innerHTML = "<a id = " + i + "><span data-toggle='modal' data-target='#filmShare'>" + docs[i]._id + "</span></a>";
            cell2.innerHTML = docs[i].filmName; 
            cell3.innerHTML = docs[i].filmUrl;
            cell4.innerHTML = "<button class='btn' id = " + docs[i]._id + ">删除</button>";
            $('#' + docs[i]._id).click(function(){
                socket.emit('delFilm', this.id);
            })

            $('#' + i).click(function(){
                $('#name').val(docs[this.id].filmName);
                $('#url').val(docs[this.id].filmUrl);
            })
        }
    }

    $('#searchBelong').click(function(){
        socket.emit('searchBelong', $('#name').val());
    });

    socket.on('result', function(names){
        $('#belong').empty();
        for (var i = names.length - 1; i >= 0; i--) {            
            $('#belong').append("<option> " + names[i] + "</option>");
        }
    })

    $('#saveBelong').click(function(){
        var actualInfo = {name:$('#name').val(), url:$('#url').val(), belong:$("#belong option:selected").val()};
        socket.emit('handledShare', actualInfo);
    })
//}