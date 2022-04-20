import { Server } from 'socket.io';
import { Cell } from './grid/cell.js';

export class Global
{
	// Users
	static token_nb_days = 365;

	// Server
	static io: Server<any>;

	// Game
	static initial_nb_troops = 10;
	static troops_spawn_max = 10;
	static troops_max = 999;
	static spawn_per_sec = 100;

	// Grid
	static grid_size = { x: 60, y: 30 };
	static grid: Cell[][] = [];
}
