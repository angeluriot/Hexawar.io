import * as Grid from '../grid/grid.js';
import { Global } from '../properties.js';
import { delay, random_int, shuffle_array } from '../utils/utils.js';
import { Move, move_event } from '../game.js';
import { random_color } from '../utils/utils.js';
import { Change } from '../grid/cell.js';
import { Player } from '../players/player.js';

export type Coordinates = {
	i: number,
	j: number
}

export class Bot
{
	id: number;
	static last_id: number = 0;
	nickname: string;
	color: string;
	skin_id: number;
	size: number;
	max_size: number;
	conquered_lands: number;
	is_alive: boolean;
	cells: Coordinates[] = [];

	is_attacked: boolean;
	is_defending: boolean;
	is_spreading: boolean;
	lost_cell: Coordinates;
	objective_cell: Coordinates;
	army_coords: Coordinates;
	spread_coords: Coordinates;

	time_lived: number;

	static list: Bot[] = [];

	static nb_bots: number = 0;				// Current number of bots
	static max_nb_bots: number = 10;		// Maximum number of bots allowed in game
	static wait: number = 1000;				// Delay of bots between each action
	static time_to_live: number = 300000;	// Amount of time a bot plays before dying automatically

	static nickname_map: Map<string, boolean> = new Map<string, boolean>(
	[
		["Bender", 				true], // string is the nickname and boolean if it is already taken or not
		["Wall-E", 				true],
		["EVE", 				true],
		["R2-D2", 				true],
		["C3-PO", 				true],
		["R4-P17", 				true],
		["General Grievous", 	true],
		["T-1000", 				true],
		["Ultron", 				true],
		["Jarvis", 				true],
		["Skynet", 				true],
		["Optimus Prime", 		true],
		["Vision", 				true],
		["Bumblebee", 			true],
		["Mettaton", 			true],
		["IG-11", 				true],
		["GLaDOS", 				true],
		["Bastion", 			true],
		["T-800", 				true],
		["BB-8",				true]
	]);

	constructor()
	{
		this.id = Bot.last_id + 1;
		Bot.last_id++;
		this.nickname = Bot.select_nickname();
		this.color = random_color();
		this.skin_id = -1;
		this.size = 0;
		this.max_size = 0;
		this.conquered_lands = 0;
		this.is_alive = true;
		this.is_attacked = false;
		this.is_defending = false;
		this.is_spreading = false;
		this.lost_cell = { i: -1, j: -1 };
		this.objective_cell = { i: -1, j: -1 };
		this.army_coords = { i: -1, j: -1 };
		this.spread_coords = { i: -1, j: -1 };
		this.time_lived = 0;

		Bot.list.push(this);
	}

	static select_nickname()
	{
		let nickname_list = [];

		for (let nickname_pair of Bot.nickname_map)
			nickname_list.push(nickname_pair[0]);

		shuffle_array(nickname_list);

		for (let nickname of nickname_list)
		{
			if (Bot.nickname_map.get(nickname))
			{
				Bot.nickname_map.set(nickname, false);
				return nickname;
			}
		}

		return '';
	}

	// When a bot spawns
	async spawn()
	{
		await delay(2000);

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

		Grid.set_cells([change]);

		this.cells.push({ i: spawn.i, j: spawn.j });
		console.log('[' + new Date().toTimeString().split(' ')[0] + '] Spawned bot : ' + this.nickname);
		this.play();
	}

	static async spawn_bots(n: number)
	{
		for (let i = 0; i < n; i++)
		{
			if (Bot.nb_bots < Bot.max_nb_bots - Player.list.length)
			{
				let bot = new Bot();
				bot.spawn();
			}

			else
				return;

			await delay(Bot.time_to_live / Bot.max_nb_bots);
		}
	}

	// When a bot dies
	die()
	{
		Bot.nickname_map.set(this.nickname, true);
		Bot.nb_bots--;
		this.is_alive = false;
		Grid.remove_player_from_grid(this);

		Bot.remove_bot(this.id);

		if (Bot.nb_bots < Bot.max_nb_bots - Player.list.length)
		{
			let bot = new Bot();
			bot.spawn();
		}
	}

	static kill_oldest()
	{
		let oldest_age = 0;
		let oldest_index = 0;

		for (let i = 0; i < Bot.list.length; i++)
		{
			let age = Bot.list[i].time_lived
			if (age > oldest_age)
			{
				oldest_age = age;
				oldest_index = i;
			}
		}

		Bot.list[oldest_index].die();
	}

	static remove_bot(id: number)
	{
		for (let i = 0; i < Bot.list.length; i++)
		{
			if (Bot.list[i].id == id)
			{
				console.log('[' + new Date().toTimeString().split(' ')[0] + '] Removed bot : ' + Bot.list[i].nickname);
				Bot.list.splice(i, 1);
				return;
			}
		}
	}

	// Removes a cell from the cell list
	remove_cell(i: number, j: number)
	{
		for (let k = 0; k < this.cells.length; k++)
		{
			if (this.cells[k].i == i && this.cells[k].j == j)
			{
				this.cells.splice(k, 1);
				return;
			}
		}
	}

	alert(i: number, j: number)
	{
		this.is_attacked = true;
		this.lost_cell = { i, j };
	}

	// Main play loop
	async play()
	{
		while (this.is_alive)
		{
			if (this.time_lived >= Bot.time_to_live)
			{
				this.die();
				return;
			}

			let best_play = this.best_play();

			if (best_play != null)
				move_event(best_play, this);

			this.time_lived += Bot.wait;
			await delay(Bot.wait);
		}
	}

	// Finds the "best play" at a given time
	best_play()
	{
		let is_regrouping = false;
		let regroup_cell = { i: -1, j: -1 };
		let best_score = 0;
		let score = 0;

		let plays = this.get_all_plays();
		let best_plays = [];

		if (this.is_attacked && !this.is_defending)
		{
			regroup_cell = this.find_regroup_cell();
			is_regrouping = true;
			best_score = 3;
		}

		else if (this.is_defending)
			best_score = 3;

		else if (this.is_spreading)
			best_score = 2;

		if (plays.length > 0)
			for (let play of plays)
			{

				score = this.analyse_play(play)

				if (score > best_score)
				{
					best_score = score;
					best_plays = [];
					best_plays.push(play);
				}

				else if (score == best_score)
					best_plays.push(play);

			}

		if (best_plays.length > 0) // if there are good or decent plays, picks one at random
		{
			let best_play_index = random_int(0, best_plays.length);

			return best_plays[best_play_index];
		}

		if (this.is_defending)
		{
			if (!Grid.are_neighbours(this.army_coords, this.lost_cell) && Grid.get_cell(this.army_coords.i, this.army_coords.j)!.player == this)
				this.advance(this.army_coords.i, this.army_coords.j, this.lost_cell.i, this.lost_cell.j);

			else
			{
				this.is_attacked = false;
				this.is_defending = false;
			}
		}

		else if (is_regrouping)
		{
			this.regroup(regroup_cell);
			this.is_defending = true;
			this.army_coords = regroup_cell;
		}

		else if (this.is_spreading)
		{
			if (this.is_isolated(this.spread_coords))
				this.advance(this.spread_coords.i, this.spread_coords.j, this.objective_cell.i, this.objective_cell.j);

			else
				this.is_spreading = false;
		}

		else
		{
			regroup_cell = this.find_regroup_cell();

			if (Grid.get_cell(regroup_cell.i, regroup_cell.j)!.nb_troops > 2)
			{
				this.regroup(regroup_cell);
				this.is_spreading = true;
				this.objective_cell = this.find_objective_cell(regroup_cell);
				this.spread_coords = regroup_cell;
			}
		}

		return null;
	}

	// Gives a score to a play at a given time
	analyse_play(play: Move)
	{
		let cell_from = Grid.get_cell(play.from.i, play.from.j)!;
		let cell_to = Grid.get_cell(play.to.i, play.to.j)!;

		if (cell_to.player == null)
			return 0; 												// if the cell is empty, decent play

		else if (cell_from.nb_troops > cell_to.nb_troops + 1)
		{
			if (this.is_attacked)
				if (this.lost_cell == play.to)
				{
					this.is_attacked = false;
					this.is_defending = false;
					this.army_coords = { i: -1, j: -1 };

					return 4;										// if bot can recapture the lost cell
				}

			return 1;												// if the cell belongs to a player, good play
		}

		return -1;													// if the bot's cell does not have 2 more troops than the attacked cell, then the attack will fail, bad play
	}

	// Get coordinates of all cells that can be captured
	get_all_plays()
	{
		let plays: Move[] = [];

		for (let cell of this.cells)
		{

			if (Grid.get_cell(cell.i, cell.j)!.nb_troops > 1)
			{
				let neighbours = Grid.get_neighbours_coordinates([cell.i, cell.j]);

				for (let neighbour of neighbours)
					if (Grid.get_cell(neighbour[0], neighbour[1]) != null)
						if (Grid.get_cell(neighbour[0], neighbour[1])!.player != this)
						{
							let play: Move = { from: { i: cell.i, j: cell.j }, to: { i: neighbour[0], j: neighbour[1] } };
							plays.push(play);
						}
			}

		}

		return plays;
	}

	find_regroup_cell()
	{
		let best_cell_index = 0;
		let max_troops = 1;
		let index = 0;

		for (let cell of this.cells)
		{
			let troops = Grid.get_cell(cell.i, cell.j)!.nb_troops;

			if (troops > max_troops)
			{
				best_cell_index = index;
				max_troops = troops;
			}

			index++;
		}

		return this.cells[best_cell_index];
	}

	find_objective_cell(regroup_cell: Coordinates)
	{
		if (regroup_cell.i > Global.grid_size.x / 3 && regroup_cell.i < 2 * Global.grid_size.x / 3 && regroup_cell.j > Global.grid_size.y / 3 && regroup_cell.j < 2 * Global.grid_size.y / 3)
		{
			let left_or_right = random_int(0, 1);
			let up_or_down = random_int(0, 1);

			return { i: left_or_right * Global.grid_size.x, j: up_or_down * Global.grid_size.y };
		}

		return { i: Math.floor(Global.grid_size.x / 2), j: Math.floor(Global.grid_size.y / 2)}
	}

	regroup(regroup_cell: Coordinates)
	{
		let cell_to = Grid.get_cell(regroup_cell.i, regroup_cell.j)!;
		let cells_from = Grid.get_neighbours_coordinates([regroup_cell.i, regroup_cell.j]);

		for (let k = 0; k < cells_from.length; k++)
		{
			let cell_from = Grid.get_cell(cells_from[k][0], cells_from[k][1]);
			if (cell_from != null)
				if (cell_from.player instanceof Bot && cell_to.player instanceof Bot)
					if (cell_from.player.id == cell_to.player!.id)
						move_event({
							from: { i: cells_from[k][0], j: cells_from[k][1] },
							to: { i: regroup_cell.i, j: regroup_cell.j }
						}, this);
		}
	}

	is_isolated(cell_coords: Coordinates)
	{
		for (let neighbour of Grid.get_neighbours_coordinates([cell_coords.i, cell_coords.j]))
		{
			let cell = Grid.get_cell(neighbour[0], neighbour[1]);
			if (cell != null)
				if (cell.player != this)
					return false;
		}

		return true;
	}

	advance(i: number, j: number, i_dest: number, j_dest: number)
	{
		let new_coords = { i: i, j: j };

		if (i == i_dest)
		{
			if (j < j_dest)
			{
				move_event({ from: { i: i, j: j}, to: { i: i, j: j + 1 }}, this);
				new_coords = { i: i, j: j + 1};
			}

			else
			{
				move_event({ from: { i: i, j: j}, to: { i: i, j: j - 1 }}, this);
				new_coords = { i: i, j: j - 1};
			}
		}

		else if (i % 2 == 0)
		{
			if (i < i_dest)
			{
				if (j <= j_dest)
				{
					move_event({ from: { i: i, j: j}, to: { i: i + 1, j: j }}, this);
					new_coords = { i: i + 1, j: j};
				}

				else
				{
					move_event({ from: { i: i, j: j}, to: { i: i + 1, j: j - 1 }}, this);
					new_coords = { i: i + 1, j: j - 1};
				}
			}

			else
			{
				if (j <= j_dest)
				{
					move_event({ from: { i: i, j: j}, to: { i: i - 1, j: j }}, this);
					new_coords = { i: i - 1, j: j};
				}

				else
				{
					move_event({ from: { i: i, j: j}, to: { i: i - 1, j: j - 1 }}, this);
					new_coords = { i: i - 1, j: j - 1 };
				}
			}
		}

		else
		{
			if (i < i_dest)
			{
				if (j < j_dest)
				{
					move_event({ from: { i: i, j: j}, to: { i: i + 1, j: j + 1 }}, this);
					new_coords = { i: i + 1, j: j + 1 };
				}

				else
				{
					move_event({ from: { i: i, j: j}, to: { i: i + 1, j: j }}, this);
					new_coords = { i: i + 1, j: j };
				}
			}

			else
			{
				if (j < j_dest)
				{
					move_event({ from: { i: i, j: j}, to: { i: i - 1, j: j + 1 }}, this);
					new_coords = { i: i - 1, j: j + 1 };
				}

				else
				{
					move_event({ from: { i: i, j: j}, to: { i: i - 1, j: j }}, this);
					new_coords = { i: i - 1, j: j };
				}
			}
		}

		if (this.is_defending)
			this.army_coords = new_coords;

		else
			this.spread_coords = new_coords;
	}
}
