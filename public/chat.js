/**
 * Created by esskov on 15.04.2015.
 */
var socket;
var messages = [];
var privateMessages = [];
var messagesWithConfirm = [];
var privateRecipients = [];
var confirmRecipients = {};
var users = {};

window.onload = function() {
    //jQuery(function($) {$(':checkbox').checkboxpicker();});
    //socket = io.connect('http://localhost:3000');
    socket = io.connect('192.168.0.67:3000');

    //run_cmd( "whoami", [], function(text) { console.log (text); alert(text); });


    var simpleMessages = [];
    var confirmReceived = '<list id="listToConfirm"></list>';
    document.getElementById('confirmReceived').innerHTML = confirmReceived;
    var confirmSended = '<list id="listSendedToConfirm"></list>';
    document.getElementById('confirmSended').innerHTML = confirmSended;

    // переделать на нормальный вход в чат :
    if(!name){
        var name = prompt('Ваше имя : ', 'Annabelle');
        socket.emit('hello', {name: name});
    }

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
            +'<td>'+'<input type="checkbox" class="checkbox checkbox-primary" '
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
        //}else if ( Object.keys(privateRecipients).length > 0){
        //    // нет получателей с подтверждением, зато есть приватные беседы, приватные получатели
        //
        }
        uncheckAllcheckboxes();


        privateRecipients = [];
        confirmRecipients = {};
        document.getElementById('textOfMessage').value = '';

        return false;
    };

    // вывод сообщения и кнопки "подтвердить"
    socket.on('toConfirm', function (data) {
        var list = document.getElementById('listToConfirm');
        var mB = document.createElement('li');
        mB.className = 'list-group-item';
        //console.log(data.users[data.id].name);
        mB.innerHTML = 'От ' +  data.userToConf[data.id].name
                        +  ' : '
                        + data.message
                        + '  <button class = "btn btn-xs btn-danger" onclick = "confirm(\''
                        + data.messageId + '\',\''
                        +  data.userToConf[data.id].id
                        + '\');this.disabled=true;this.className = \'btn btn-xs btn-info\';">Подтвердить</button>';
       list.appendChild(mB);
    });

    // перерисовка списка сообщений с подтверждением и списка тех, кто подтвердил
    socket.on('iConfirm', function(data){
        //    console.log('mess = '+ JSON.stringify(mess));
        messagesWithConfirm.forEach(function(obj){
           if(obj.idDate ===  data.messageId) {
               obj.confirm[data.id] = true;
           }
        });
        reDrawConfirmList();
    });

    socket.on('privateMessage', function (data) {
        var priv = document.getElementById('private');
        privateMessages.push('From ' + findUserNameById(data.idWho) + ' : ' + data.message + '<br/>');
        priv.innerHTML = privateMessages;
    });


};


function confirm(messageId, id){
        socket.emit('accept',
            {whoConfirmId: socket.id,
            whoAskConfirmId: id,
            messageId: messageId });
}



function changePrivateRecipients(id) {
    var index = privateRecipients.indexOf(id);
    if (  index == -1 ) {
        privateRecipients.push(id);
    }else {
        privateRecipients.splice(index, 1);
    }
}

function changeConfirmRecipients(id, name) {
    var index = confirmRecipients[id];
    if(index != undefined)
        delete confirmRecipients[id];
    else {
        confirmRecipients[id] = false;
    }
}

function reDrawConfirmList(){
    var tableConf = document.getElementById('confirmSended');
    var elems = tableConf.getElementsByTagName('li');
    messagesWithConfirm.forEach(function(obj){
        for(var i= 0, len = elems.length; i<len; i++){
            if(obj.idDate == elems[i].id){
                for(var j=1; j < elems[i].childNodes.length; j++) {
                    var sp = elems[i].childNodes[j];
                    var idWhoConf = findUserIdByName(sp.innerHTML);
                    for ( var whoConf in obj.confirm) {
                        if(whoConf == idWhoConf && obj.confirm[whoConf] ){
                            if(sp.className.match(/\bconfirmRed\b/)){
                                sp.className = ' confirmGreen';
                            }
                        }
                    }

                }

            }

        }
    });
}

function findUserIdByName(name){
    for ( var user in users){
        if (users[user].name == name) return users[user].id;
    }
}
function findUserNameById(id){
    for ( var user in users){
        if (users[user].id == id) return users[user].name;
    }
}

function uncheckAllcheckboxes(){
    var ch = document.getElementsByTagName("input");
    for(var i=0;i<ch.length;i++) {
        if (ch[i].type == 'checkbox' && ch[i].checked) ch[i].checked = !ch[i].checked;
    }
}

function run_cmd(cmd, args, callBack ) {
    //var spawn = require('child-proc').spawn;
    //var child = spawn(cmd, args);
    //var resp = "";
    //
    //child.stdout.on('data', function (buffer) { resp += buffer.toString() });
    //child.stdout.on('end', function() { callBack (resp) });
} // ()

