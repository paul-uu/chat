var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});
app.use(function(req, res) {
	res.sendFile(__dirname + '/404.html');
});

app.set('port', process.env.PORT || 3000);
server.listen(app.get('port'), function() {
	console.log('  --- application initialized on localhost:3000 ---  ');
});

var username_list = {};
io.sockets.on('connection', function(socket) {

	// Events received from the client
	socket.on('client -- new user', function(data, callback) {
		// data = submitted username string
		if (data in username_list) {
			callback(false);
		} else {
			callback(true);
			socket.username = data;
			username_list[socket.username] = socket;
			//io.sockets.emit('server -- new user', data);
			socket.broadcast.emit('server -- new user', data);
			update_usernames();
		}
	});

	socket.on('client -- send message', function(data, callback) {
		var message = data.trim();
		io.sockets.emit('server -- new message', {
													message: message, 
													username: socket.username
													// time
												 });
	});

	socket.on('disconnect', function(data) {
		if (!socket.username) return;
		delete username_list[socket.username];
		update_usernames();
		io.sockets.emit('server -- user left', socket.username);
		console.log('user has left');
	});

	// Server emitted events/functions
	function update_usernames() {
		io.sockets.emit('server -- update usernames', Object.keys(username_list));
	}
});
