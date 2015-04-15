/**
 * Created by esskov on 15.04.2015.
 */
var socket;
var messages = {};

window.onload = function() {
    socket = io.connect('http://localhost:3000');

    var simpleMessages = [];
    var privateRecipients = [];
    var confirmRecipients = [];

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
            +'onchange="changeRecipients(\''+data[user].id+'\', \'' + privateRecipients + '\');">'+'</td>'
            +'<td>'+'<input type="checkbox" '
            +'onchange="changeRecipients(\''+data[user].id+'\', ' + confirmRecipients + ');">'+'</td>'
            +'</td></tr>';
        }
        html += '</table>';
        usersOnline.innerHTML = html;

        console.log(html);

    });
};

function changeRecipients(id, recipArray) {
    console.log(recipArray);
    //for  ( var i in recipArray) console.log(i);
    //var index = recipArray.indexOf(id);
    //if (  index == -1 ) {
    //    recipArray.push(id);
    //}else {
    //    recipArray.splice(index, 1);
    //}
    //return recipArray;
    console.log('end of func arr = '+ recipArray);
}