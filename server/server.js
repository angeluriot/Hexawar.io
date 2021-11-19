const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const { user_join, get_user, user_leave, get_user_list } = require('./users/users.js');
const { create_grid, set_cell, get_cell, get_grid } = require('./grid/grid.js');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, '../client')));

create_grid();

// Run when client connects
io.on('connection', socket =>
{
	socket.on('join_game', user =>
	{
		// Register the user
		user.id = socket.id;
		user_join(user);

		// Send the grid
		socket.emit('grid_to_client', get_grid());
	});

	socket.on('change_cell_to_server', change =>
	{
		let color = set_cell(change.i, change.j, change.color);

		if (color != null)
			socket.broadcast.emit('change_cell_to_client', change);
	});

	// Runs when client disconnects
	socket.on('disconnect', () =>
	{
		const user = user_leave(socket.id);
	});
});

const PORT = 80;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
