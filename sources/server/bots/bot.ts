import * as Grid from '../grid/grid.js';
import { Global } from '../properties.js';

export class Bot
{
	nickname: string;
	color: string;
	skin_id: number;
	size: number;
	max_size: number;
	conquered_lands: number;
	is_alive: boolean;
	//static list: Bot[] = [];

	static nb_bots: number = 0;

	constructor()
	{
		this.nickname = '';
		this.color = '#ff0000';
		this.skin_id = -1;
		this.size = 0;
		this.max_size = 0;
		this.conquered_lands = 0;
		this.is_alive = true;
	}

	spawn()
	{
		Bot.nb_bots++;

		// Gives the bot a spawn cell
		let spawn = Grid.get_spawn_cell();

		// Set the change
		const change = {
			i: spawn.i,
			j: spawn.j,
			color: this.color,
			skin_id: this.skin_id,
			player: this,
			nb_troops: Global.initial_nb_troops
		};

		Grid.set_cell(change);
	}

	die()
	{
		this.is_alive = false;
	}
}