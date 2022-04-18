import { Server } from 'socket.io';
import { Cell, Change } from './grid/cell.js';

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
	static update_rate = 20; //Milliseconds
	static timeout_delay = 10000; //Milliseconds

	// Grid
	static grid_size = { x: 60, y: 30 };
	static grid: Cell[][] = [];
	
	static changes_list : Change[] = [];
}

export enum ClientSocket {
	DISCONNECT = '0',
	JOIN_GAME = '1',
	REGISTER = '2',
	LOGIN = '3',
	LOGOUT = '4',
	AUTO_LOGIN = '5',
	DELETE_ACCOUNT = '6',

	PING = '7',
	MOVES = '8',
	GRID_REQUEST = '9',

}

export enum ServerSocket {
	CHANGES = '0',
	GRID = '1',
	SPAWN = '2',
	DEATH = '3',
	LEADERBOARD = '4',
	

	REGISTER_ERROR = '5',
	REGISTERED = '6',

	LOGIN_ERROR = '7',
	LOGGED = '8',

	LOGOUT_ERROR = '9',
	UNLOGGED = 'A',

	AUTO_LOGIN_ERROR = 'B',
	AUTO_LOGGED = 'C',

	DELETE_ACCOUNT_ERROR = 'D',
	ACCOUNT_DELETED = 'E',
}
