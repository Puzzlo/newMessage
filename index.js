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

});  // end of sockets connection