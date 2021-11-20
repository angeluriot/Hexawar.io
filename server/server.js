const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const { create_grid } = require('./grid/grid.js');
const { join_game, game_events, game_loop, leave_game } = require('./game.js');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, '../client')));

// Initialize the server game
create_grid();
game_loop(io);

// When client connects
io.on('connection', socket =>
{
	join_game(socket, io);
	game_events(socket, io);
	leave_game(socket, io);
});

const PORT = 80;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
