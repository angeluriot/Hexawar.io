import * as Path from 'path';
import * as Http from 'http';
import express from 'express';
import { Server, Socket } from 'socket.io';
import * as Grid from './grid/grid.js';
import * as Game from './game.js';
import * as Connection from './users/connection.js';
import mongoose from 'mongoose';
import { Global } from './properties.js';
import { Player } from './players/player.js';
import { User } from '../models/user.js';
import { config } from 'dotenv';

config();
const app = express();
const server = Http.createServer(app);
Global.io = new Server(server);

// Set static folder
const __dirname = Path.resolve();
app.use(express.static(Path.join(__dirname, '/client')));
console.log(__dirname);

// Redirect all 404
app.get('*', function(req, res)
{
	res.redirect('/');
});

// Initialize the server game
function init()
{
	Grid.create_grid();
	Game.game_loop();

	Global.io.on('connection', (socket: Socket) =>
	{
		let user = {
			player: new Player(socket, '', '', 0),
			user: null
		};

		Connection.connection_events(user);

		Game.join(user.player);
		Game.game_events(user.player);
		Game.leave_game(user.player);
	});
}

const port = process.env.PORT || 80;

mongoose.connect('mongodb://localhost/hexawar')
.then((result) =>
{
	init();
	server.listen(port, () => console.log(`Server running on port ${port}`));
})
.catch((error) =>
{
	console.log(error);
});
