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