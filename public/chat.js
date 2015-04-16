/**
 * Created by esskov on 15.04.2015.
 */
var socket;
var messages = {};
var privateRecipients = [];
var confirmRecipients = {};

window.onload = function() {
    socket = io.connect('http://localhost:3000');

    var simpleMessages = [];
    var confirmReceived = '<list id="listToConfirm"></list>';
    document.getElementById('confirmReceived').innerHTML = confirmReceived;

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
            +'onchange="changeConfirmRecipients(\''+data[user].id+'\');">'+'</td>'
            +'</td></tr>';
        }
        html += '</table>';
        usersOnline.innerHTML = html;

        console.log(html);

    });

    forma.onsubmit = function () {
        var message = document.getElementById('textOfMessage');
        console.log(message.value);
        socket.emit('sendMessageToServer', {idDate: new Date(), message: message.value, priv: privateRecipients, confirm: confirmRecipients});
        privateRecipients = [];
        confirmRecipients = {};
        document.getElementById('textOfMessage').value = '';
        return false;
    };

    socket.on('toConfirm', function (data) {
        var list = document.getElementById('listToConfirm');
        var mB = document.createElement('li');
        mB.innerHTML = data.message + '  <button onclick = " ">Подтвердить</button>';
       list.appendChild(mB);
    });
};





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

function changeConfirmRecipients(id) {
    var index = confirmRecipients[id];
    if(index != undefined)
        delete confirmRecipients[id];
    else confirmRecipients[id] = false;

    //console.log('end of func arr = '+ JSON.stringify(confirmRecipients));
}