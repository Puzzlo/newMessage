/**
 * Created by esskov on 15.04.2015.
 */
var express = require('express');
var app = express();
var port = 3000;
var io = require('socket.io').listen(app.listen(port));

app.set('views', __dirname + '/templates');
app.set('view engine', 'jade');
app.engine('jade', require('jade').__express);
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
    res.render('index', {});
});

var users = {};

io.sockets.on('connection', function(client){

    // hello - при входе в чат. приветствие вошедшему и оповещение остальным
    client.on('hello', function (data) {
        users[client.id] = {name: data.name, id: client.id};
        client.emit('simpleMessage', {message: 'Привет, ' + data.name + ', мы тебя ждали'});
        client.broadcast.emit('simpleMessage', {message: 'К нам присоединился ' + data.name});
        io.sockets.emit('drawUsers', users);
    });

    client.on('sendMessageToServer', function(data){
        //console.log('cabj here');
        //client.emit('drawUsers', users);
        if(Object.keys(data.confirm).length > 0){

            for( sender in data.confirm) {
                //console.log('sender='+sender);
                //console.log('sender_value='+sender.value  );
                io.sockets.connected[sender].emit('toConfirm',
                    {messageId: data.idDate,
                        id: client.id,
                        userToConf: users,
                        message: data.message});

                //console.log('users = '+ JSON.stringify(users));
            }
        }else if(Object.keys(data.priv).length > 0){
            console.log('private messages = '+ JSON.stringify(data.priv));
         // есть приватные получатели. нет с подтверждением ( условие задачи )
            for(var i=0; i<data.priv.length; i++){
                io.sockets.connected[data.priv[i]].emit('privateMessage',
                    { message: data.message,
                        idWho: data.idWhoSend
                    });
            }
        }
    });

    client.on('accept', function (data) {
        io.sockets.connected[data.whoAskConfirmId].emit('iConfirm' ,
            {messageId: data.messageId, id: data.whoConfirmId});
    });
    client.on('disconnect', function(data){

       console.log('disconnect '+client.id);
    });

});  // end of sockets connection