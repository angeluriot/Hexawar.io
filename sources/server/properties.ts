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

	// Skins
	static nb_veteran_skins = 10;
	static nb_premium_skins = 10;
	static skin_price = 99;

	static changes_list : Change[] = [];
}

export enum ClientSocket
{
	JOIN_GAME = '0',
	REGISTER = '1',
	LOGIN = '2',
	LOGOUT = '3',
	AUTO_LOGIN = '4',
	DELETE_ACCOUNT = '5',

	PING = '6',
	MOVES = '7',
	GRID_REQUEST = '8',

	PAYMENT = '9'
}

export enum ServerSocket
{
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

	PAYMENT_SESSION = 'F',
	PAYMENT_SUCCESS = 'G'
}
