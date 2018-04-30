const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server); // pdpinanie socket.io do serwera http
const UsersService = require('./UsersService');

const userService = new UsersService();

app.use(express.static(__dirname + '/public')); //ustawienie w aplikacji Express miejsca, z którego będą serwowane pliki

app.get('/', function (req, res) { //skonfigurowanie prostego routingu nasłuchującego na '/', który w odpowiedzi będzie odsyłał plik index.html
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    socket.on('join', name => {
        userService.addUser({
            id: socket.id,
            name: name
        });
        socket.emit('update', {
            users: userService.getAllUsers()
        });
    });
    socket.on('disconnect', () => {
        userService.removeUser(socket.id);
        socket.broadcast.emit('update', {
            users: userService.getAllUsers()
        });
    });
    socket.on('message', message => {
        const {
            name
        } = userService.getUserById(socket.id);
        socket.broadcast.emit('message', {
            text: message.text,
            from: name
        });
    });
});

server.listen(3000, function () {
    console.log('listening on *:3000');
});
