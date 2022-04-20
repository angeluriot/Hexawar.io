import * as Path from 'path';
import * as Http from 'http';
import express from 'express';
import { Server, Socket } from 'socket.io';
import * as Grid from './grid/grid.js';
import * as Game from './game.js';
import * as Connection from './users/connection.js';
import * as Blacklist from './users/blacklist.js';
import mongoose from 'mongoose';
import { Global, ClientSocket } from './properties.js';
import { Player } from './players/player.js';
import * as Payment from './users/payment.js';
import { config } from 'dotenv';
import { Bot } from './bots/bot.js';

config();
const app = express();
const server = Http.createServer(app);
Global.io = new Server(server);

// Deal with suspicious and banned players
app.get('/', (req, _, next) => {
	const ip_address: string = (req.socket.remoteAddress != null) ? req.socket.remoteAddress : '';

	if (Blacklist.is_allowed(ip_address))
		next();
});

// Set static folder
const __dirname = Path.resolve();
app.use(express.static(Path.join(__dirname, '/client')));

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
	Bot.spawn_bots(Bot.max_nb_bots);

	Global.io.on('connection', (socket: Socket) =>
	{
		console.log('[' + new Date().toTimeString().split(' ')[0] + '] User connected (' + socket.conn.remoteAddress + ')' );
		let player = new Player(socket);
		player.last_message = Date.now();
		Connection.connection_events(player);
		Payment.buy_skin_events(player);

		Game.join(player);
		Game.game_events(player);
		Game.leave_game(player);

		Blacklist.events(socket);
	});
}

const port = process.env.PORT || 80;

if (process.env.MONGODB_URL)
{
	if (process.env.MONGODB_USER && process.env.MONGODB_PASSWORD)
	{
		mongoose.connect(process.env.MONGODB_URL, {
			'auth': {
				'username': process.env.MONGODB_USER,
				'password': process.env.MONGODB_PASSWORD
			},
			'authSource': 'admin'
		})
		.then((result) =>
		{
			console.log('Connected to MongoDB');
			init();
			server.listen(port, () => console.log(`Server running on port ${port}`));
		})
		.catch((error) =>
		{
			console.log('MongoDB connection error:');
			console.log(error);
		});
	}

	else
	{
		mongoose.connect(process.env.MONGODB_URL)
		.then((result) =>
		{
			console.log('Connected to MongoDB');
			init();
			server.listen(port, () => console.log(`Server running on port ${port}`));
		})
		.catch((error) =>
		{
			console.log('MongoDB connection error:');
			console.log(error);
		});
	}
}
