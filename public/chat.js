/**
 * Created by esskov on 15.04.2015.
 */
var socket;
var messages = [];
var messagesWithConfirm = [];
var privateRecipients = [];
var confirmRecipients = {};
var users = {};

window.onload = function() {
    socket = io.connect('http://localhost:3000');

    var simpleMessages = [];
    var confirmReceived = '<list id="listToConfirm"></list>';
    document.getElementById('confirmReceived').innerHTML = confirmReceived;
    var confirmSended = '<list id="listSendedToConfirm"></list>';
    document.getElementById('confirmSended').innerHTML = confirmSended;

    // переделать на нормальный вход в чат :
    var name = prompt('Ваше имя : ', 'Annabelle');
    socket.emit('hello', {name: name});

    // сообщения при входе в чат вошедшему, остальным что он пришёл
    socket.on('simpleMessage', function(data){
        simpleMessages.push(data.message);
        var html = '';
        for ( var i = 0, len = simpleMessages.length; i < len; i++){
            html += simpleMessages[i] + '<br />';
        }
        document.getElementById('simple').innerHTML = html;
    });


    // draw users, check click on checkboxes
    socket.on('drawUsers', function(data){
        var html = '<table>';
        html += '<tr><td>Имя</td><td>Отослать</td><td>С подтверждением</td><tr>';
        for ( var user in data ) {
            html += '<tr><td>' + data[user].name + '</td>'
            +'<td>'+'<input type="checkbox" '
            //+'onchange="changePrivate();">'+'</td>'
            +'onchange="changePrivateRecipients(\''+data[user].id + '\');">'+'</td>'
            +'<td>'+'<input type="checkbox" '
            +'onchange="changeConfirmRecipients(\''+data[user].id+'\', \'' + data[user].name + '\');">'+'</td>'
            +'</td></tr>';
        }
        html += '</table>';
        usersOnline.innerHTML = html;
        users = data;

        //console.log(html);

    });

    forma.onsubmit = function () {
        var message = document.getElementById('textOfMessage');
        //console.log(message.value);
        var idMessage = new Date().getTime().toString();
        socket.emit('sendMessageToServer', {idDate: idMessage,
                                            idWhoSend: socket.id,
                                            message: message.value,
                                            priv: privateRecipients,
                                            confirm: confirmRecipients });

        //console.log('messages = '+ JSON.stringify(messages));

        if(Object.keys(confirmRecipients).length > 0){
            // есть получатели с подтверждением

            messagesWithConfirm.push(
                { idDate: idMessage,
                    idWhoSend: socket.id,
                    message: message.value,
                    priv: privateRecipients,
                    confirm: confirmRecipients
                }
            );
            var list = document.getElementById('listSendedToConfirm');
            var newLi = document.createElement('li');
            newLi.id = idMessage;
            var mess = message.value;
            //console.log('confrec = '+ JSON.stringify(confirmRecipients));
            for ( var man in confirmRecipients) {
                mess += '<span class="confirmRed">' + users[man].name + '</span>';
            }
            newLi.innerHTML = mess;
            list.appendChild(newLi);
        }
        privateRecipients = [];
        confirmRecipients = {};
        document.getElementById('textOfMessage').value = '';
        return false;
    };

    socket.on('toConfirm', function (data) {
        var list = document.getElementById('listToConfirm');
        var mB = document.createElement('li');
        //console.log(data.users[data.id].name);
        mB.innerHTML = 'От ' +  data.userToConf[data.id].name +  ' : '+ data.message + '  <button onclick = "confirm(\'' + data.messageId + '\',\''
                        +  data.userToConf[data.id].id + '\');">Подтвердить</button>';
       list.appendChild(mB);
    });

    socket.on('iConfirm', function(data){
        //for ( mess in messagesWithConfirm) {
        //    console.log('mess = '+ JSON.stringify(mess));
        //    if(messagesWithConfirm[mess].id == data.messageId){
        //        messagesWithConfirm[mess].confirm[data.id] = true;
        //        console.log('confirm = ' + messagesWithConfirm[mess].confirm[data.id]);
        //    }
        //}
        //console.log('messagesWithConfirm = '+ JSON.stringify(messagesWithConfirm));
        //console.log('users = '+ JSON.stringify(users));
        messagesWithConfirm.forEach(function(obj){
            //console.log('obj = '+ JSON.stringify(obj));
            //console.log('idDate=' + obj.idDate + '  messId = ' + data.messageId);
            //console.log(typeof(data.messageId));
            //console.log('data = '+ JSON.stringify(data));
           if(obj.idDate ===  data.messageId) {
               //console.log('im in');
               obj.confirm[data.id] = true;
           }
        });
        reDrawConfirmList();
        console.log('messagesWithConfirm = '+ JSON.stringify(messagesWithConfirm));
    });


};


function confirm(messageId, id){
    //console.log('confrec = '+ JSON.stringify(confirmRecipients));
    //var index = confirmRecipients[id];
    //console.log(index);
    //if(index != undefined){
    //    confirmRecipients[socket.id] = true;
        socket.emit('accept',
            {whoConfirmId: socket.id,
            whoAskConfirmId: id,
            messageId: messageId });
    //}else{
    //    console.log('не нашёл кого менять на труе');
    //}
}



function changePrivateRecipients(id) {
    //console.log(recipArray);
    //for  ( var i in recipArray) console.log(i);
    var index = privateRecipients.indexOf(id);
    if (  index == -1 ) {
        privateRecipients.push(id);
    }else {
        privateRecipients.splice(index, 1);
    }
    //console.log('end of func arr = '+ privateRecipients);
}

function changeConfirmRecipients(id, name) {
    var index = confirmRecipients[id];
    if(index != undefined)
        delete confirmRecipients[id];
    else {
        //var n = {confirm: false, name: name};
        confirmRecipients[id] = false;
        //confirmRecipients[id].name = name;
    //confirmRecipients[id].push(n);
    }

    //console.log('confrec = '+ JSON.stringify(confirmRecipients));
}

function reDrawConfirmList(){
    var tableConf = document.getElementById('confirmSended');
    var elems = tableConf.getElementsByTagName('li');
    messagesWithConfirm.forEach(function(obj){
        for(var i= 0, len = elems.length; i<len; i++){
            if(obj.idDate == elems[i].id){
                //console.log('elems['+ i+']='+elems[i].id);
                //elems[i].className = elems[i].className.replace('confirmRed', 'confirmGreen');
                for(var j=1; j < elems[i].childNodes.length; j++) {
                    //console.log(elems[i].childNodes[j]);
                    console.log(elems[i].childNodes[j].innerHTML);
                    //console.log(elems[i].childNodes[j].nodeValue);
                }

            }

        }
    });
}