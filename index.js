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
var ntlm = require('express-ntlm');
app.use(ntlm());

app.get('/', function(req, res){
    res.cookie('cart', 'test', {expires: new Date(Date.now() + 120000), httpOnly: true});
    res.render('index', {});
});

var users = {};


io.sockets.on('connection', function(client){

    run_cmd( "whoami", [], function(text) { console.log (text);});
    //run_cmd( "Gwmi", [], function(text) { console.log (text);});

    if(client.handshake.address=='::ffff:192.168.0.67'){
        console.log(new Date().toString());
    //if(client.handshake.address=='::ffff:192.168.111.110') {
    //    client.emit('simpleMessage', {message: 'Привет, Пузо, мы тебя ждали'});
    //    client.broadcast.emit('simpleMessage', {message: 'К нам присоединилось Пузо'});
        io.sockets.emit('drawUsers', users);
    }
    // hello - при входе в чат. приветствие вошедшему и оповещение остальным
    client.on('hello', function (data) {
        users[client.id] = {name: data.name, id: client.id};
        //client.emit('simpleMessage', {message: 'Привет, ' + data.name + ', мы тебя ждали'});
        //client.broadcast.emit('simpleMessage', {message: 'К нам присоединился ' + data.name});
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
        if(Object.keys(users) > 2 ) {
            var a = users[client.id].name;
            client.broadcast.emit('simpleMessage', {message: 'Нас покидает ' + a});
            io.sockets.emit('drawUsers', users);
        }
        delete users[client.id];
    });

});  // end of sockets connection

function run_cmd(cmd, args, callBack ) {
    var spawn = require('child_process').spawn;
    var child = spawn(cmd, args);
    var resp = "";

    child.stdout.on('data', function (buffer) { resp += buffer.toString() });
    child.stdout.on('end', function() { callBack (resp) });
} // ()