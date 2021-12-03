import { Server } from 'socket.io';

export class Global
{
	// Server
	static io: Server<any>;

	// Game
	static initial_nb_troops = 10;
	static troops_spawn_max = 10;
	static troops_max = 999;
	static spawn_per_sec = 100;
}
