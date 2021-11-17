const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const { user_join, get_user, user_leave, get_user_list } = require('./users/users.js');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, '../client')));

// Run when client connects
io.on('connection', socket =>
{
	// Send user list
	io.emit('user_list', get_user_list());

	socket.on('join_game', username =>
	{
		// Register the user
		const user = user_join(socket.id, username);

		// Send user list
		io.emit('user_list', get_user_list());

		// Send log to all other users
		socket.broadcast.emit('log', `${user.name} has joined the game`);
	});

	// Listen for chat messages
	socket.on('chat_message', message =>
	{
		// Get user from id
		const user = get_user(socket.id);

		// Send message to all users
		io.emit('message', { username: user.name, message });
	});

	// Runs when client disconnects
	socket.on('disconnect', () =>
	{
		const user = user_leave(socket.id);

		// Send user list
		io.emit('user_list', get_user_list());

		// Send log to all other users
		if (user != null)
			socket.broadcast.emit('log', `${user.name} est malheureusement décédé`);
	});
});

const PORT = 80;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
