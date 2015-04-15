/**
 * Created by esskov on 15.04.2015.
 */
var socket;
var messages = {};

window.onload = function() {
    socket = io.connect('http://localhost:3000');
    // переделать на нормальный вход в чат :
    var name = prompt('Ваше имя : ', 'Annabelle');
    socket.emit('hello', {name: name});
};