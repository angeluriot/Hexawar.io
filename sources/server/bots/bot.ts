import * as Grid from '../grid/grid.js';
import { Global } from '../properties.js';
import { delay, random_int, shuffle_array } from '../utils/utils.js';
import { Move } from '../game.js';
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

	static list: Bot[] = [];

	static nb_bots: number = 0;     // Current number of bots
	static max_nb_bots: number = 7; // Maximum number of bots allowed in game
	static wait: number = 1000;     // Delay of bots between each action

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
		["T-800", 				true]
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

		Grid.set_cell(change);

		this.cells.push({ i: spawn.i, j: spawn.j });

		this.play();
	}

	// When a bot dies
	die()
	{
		Bot.nickname_map.set(this.nickname, true);
		Bot.nb_bots--;
		this.is_alive = false;
		Grid.remove_player_from_grid(this);

		Bot.remove_bot(this.id);

		if (Player.list.length > 0 && Bot.nb_bots < Bot.max_nb_bots)
		{
			let bot = new Bot();
			bot.spawn();
		}
	}

	static remove_bot(id: number)
	{
		for (let i = 0; i < Bot.list.length; i++)
		{
			if (Bot.list[i].id == id)
			{
				Bot.list.slice(i, 1);
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

	// Main play loop
	async play()
	{
		while (this.is_alive)
		{
			let best_play = this.best_play();

			if (best_play != null)
				this.move_event(best_play);


			if (Player.list.length == 0)
				this.die();

			else
				await delay(Bot.wait);
		}
	}

	// Find the "best play" at a given time
	best_play()
	{
		let best_score = 0;
		let score = 0;

		let plays = this.get_all_plays();

		if (plays.length > 0)
		{
			let best_plays = [];

			for (let play of plays)
			{

				score = Bot.analyse_play(play)

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

			else
				return null;	// if all plays are bad (better to do nothing)
		}

		else
			return null;		// if there is no possible play
	}

	// Gives a score to a play at a given time
	static analyse_play(play: Move)
	{
		let cell_from = Grid.get_cell(play.from.i, play.from.j)!;
		let cell_to = Grid.get_cell(play.to.i, play.to.j)!;

		if (cell_to.player == null)
			return 0; 												// if the cell is empty, then the play is decent

		else
		{
			if (cell_from.nb_troops < cell_to.nb_troops + 2)
				return -1; 											// if the bot's cell does not have 2 more troops than the attacked cell, then the attack will fail, so the play is bad

			else
				return 1;											// the attack succeeds, so the play is good
		}
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

	move_event(move: Move)
	{
		let cell_from = Grid.get_cell(move.from.i, move.from.j);
		let cell_to = Grid.get_cell(move.to.i, move.to.j);
		let dyingCells: Change[] = [];
		// If the move is valid
		if (cell_from != null && cell_to != null && cell_from.player == this && Grid.are_neighbours(move.from, move.to) && cell_from.nb_troops > 1)
		{
			let change_from = {
				i: move.from.i,
				j: move.from.j,
				color: cell_from.color,
				skin_id: cell_from.skin_id,
				player: cell_from.player,
				nb_troops: cell_from.nb_troops
			};

			let change_to = {
				i: move.to.i,
				j: move.to.j,
				color: cell_to.color,
				skin_id: cell_to.skin_id,
				player: cell_to.player,
				nb_troops: cell_to.nb_troops
			};

			// If it's a simple move
			if (change_to.player == this)
			{
				change_to.nb_troops += change_from.nb_troops - 1;
				change_from.nb_troops = 1;

				// If there are too many troops
				if (change_to.nb_troops > Global.troops_max)
				{
					change_from.nb_troops += change_to.nb_troops - Global.troops_max;
					change_to.nb_troops = Global.troops_max;
				}

				this.cells.push({ i: change_to.i, j: change_to.j });
			}

			// If it's an attack
			else
			{
				// If the attack succeeds
				if (change_from.nb_troops > change_to.nb_troops + 1)
				{
					let dyingPlayer = change_to.player;

					//If we attack a player
					if(cell_to.player!=null){
						//Find the starting point of the area detection
						let neighbours: [number, number][] = Grid.get_neighbours_coordinates([move.to.i, move.to.j]);
						let playerCellOffset: number = 0;
						while(neighbours[playerCellOffset][0] != move.from.i && neighbours[playerCellOffset][1] != move.from.j )
							playerCellOffset += 1;
						//Detect the differents areas
						let lastWasCell = false;
						let areas: [number, number][][] = [];
						let last_x = move.to.i;
						let last_y = move.to.j;
						for(let i=1; i < neighbours.length+1; i+=1){
							let [x, y] = neighbours[(playerCellOffset + i) % neighbours.length];
							if(Grid.get_cell(x, y)?.player == dyingPlayer){
								if(lastWasCell){
									//If we are not near a border (else jump between neighbours)
									if(Grid.get_relative_distance([x, y], [last_x, last_y]) == 1){
										areas[areas.length-1].push([x, y]);
									}else{
										areas.push([[x, y]]);
									}
								}else{
										areas.push([[x, y]]);
								}
								lastWasCell = true;
							}else{
								lastWasCell = false;
							}
							last_x = x;
							last_y = y;
						}

						//Find dying cells
						let toKill = Grid.dying_cells(areas, [[move.to.i, move.to.j]]);

						//Add dyingCells to array
						for(let killed of toKill){
							dyingCells.push({
								i: killed[0],
								j: killed[1],
								color: '#FFFFFF',
								skin_id: -1,
								player: null,
								nb_troops: 0
							});
						}

					}

					change_to.nb_troops = change_from.nb_troops - change_to.nb_troops - 1;
					change_from.nb_troops = 1;
					change_to.color = change_from.color;
					change_to.skin_id = change_from.skin_id;
					change_to.player = change_from.player;

					this.cells.push({ i: change_to.i, j: change_to.j });
				}

				// If the attack fails
				else
				{
					change_to.nb_troops -= change_from.nb_troops - 1;
					change_from.nb_troops = 1;

					// Add one troop to the defender if it's cell is empty
					if (change_to.nb_troops == 0)
						change_to.nb_troops = 1;
				}
			}

			Grid.set_cells([change_from, change_to], true);

			Grid.set_cells(dyingCells, false);
		}
	}
}