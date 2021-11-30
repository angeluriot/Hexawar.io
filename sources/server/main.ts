import * as Path from 'path';
import * as Http from 'http';
import express from 'express';
import { Server, Socket } from 'socket.io';
import * as Grid from './grid/grid.js';
import * as Game from './game.js';

const app = express();
const server = Http.createServer(app);
const io = new Server(server);

// Set static folder
const __dirname = Path.resolve();
app.use(express.static(Path.join(__dirname, '/client')));
console.log(__dirname);

// Initialize the server game
Grid.create_grid();
Game.game_loop(io);

// When client connects
io.on('connection', (socket: Socket) =>
{
	Game.join_game(socket, io);
	Game.game_events(socket, io);
	Game.leave_game(socket, io);
});

const port = process.env.PORT || 80;
server.listen(port, () => console.log(`Server running on port ${port}`));
