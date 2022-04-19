import * as Grid from './grid/grid.js';
import { Player } from './players/player.js';
import { Global } from './properties.js';
import { Change } from './grid/cell.js';
import * as Utils from './utils/utils.js';

export type Move = {
	from: { i: number, j: number },
	to: { i: number, j: number }
}

// Handle a player joining the game
export function join(player: Player)
{
	// Send the grid
	player.socket.on('ask_for_grid', () =>
	{
		player.socket.emit('grid_to_client', Grid.get_client_grid());
	});

	// Register the player
	player.socket.on('join_game', (input_player: { nickname: string, color: string, skin_id: number }) =>
	{
		player.nickname = input_player.nickname.trim();

		if (player.nickname.length > 16)
			player.nickname = player.nickname.substring(0, 16);

		if (Utils.is_color(input_player.color))
			player.color = input_player.color;
		else
			player.color = Utils.random_color();

		if (input_player.skin_id == -1)
			player.skin_id = -1;
		else if (player.user != null && player.user.skins.includes(input_player.skin_id))
			player.skin_id = input_player.skin_id;
		else
			player.skin_id = -1;

		// Add the player in the players list
		if (player.join())
		{
			// Gives the player a spawn cell
			let spawn = Grid.get_spawn_cell();

			// Set the change
			const change = {
				i: spawn.i,
				j: spawn.j,
				color: player.color,
				skin_id: player.skin_id,
				player: player,
				nb_troops: Global.initial_nb_troops
			};

			Grid.set_cell(change);
			player.socket.emit('send_spawn', spawn);
			update_leaderboard();
		}
	});
}

// The events of the game
export function game_events(player: Player)
{
	player_moves(player);
}

// Loops of the game
export function game_loop()
{
	setInterval(() =>
	{
		troops_spawn();
	}, 1000);

	setInterval(() =>
	{
		update_leaderboard();
	}, 500);
}

// Handle a player leaving the game
export function leave_game(player: Player)
{
	// When client disconnects
	player.socket.on('disconnect', () =>
	{
		player.leave();
		Grid.remove_player_from_grid(player);
	});
}

// Handle player moves
export function player_moves(player: Player)
{
	function move_event(move: Move)
	{
		let cell_from = Grid.get_cell(move.from.i, move.from.j);
		let cell_to = Grid.get_cell(move.to.i, move.to.j);
		let dyingCells: Change[] = [];
		// If the move is valid
		if (cell_from != null && cell_to != null && cell_from.player == player && Grid.are_neighbours(move.from, move.to) && cell_from.nb_troops > 1)
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
			if (change_to.player == player)
			{
				change_to.nb_troops += change_from.nb_troops - 1;
				change_from.nb_troops = 1;

				// If there are too many troops
				if (change_to.nb_troops > Global.troops_max)
				{
					change_from.nb_troops += change_to.nb_troops - Global.troops_max;
					change_to.nb_troops = Global.troops_max;
				}
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

	player.socket.on('move', (move: Move) => { move_event(move); });
	player.socket.on('moves', (moves: Move[]) => { moves.forEach(move => move_event(move)); });
}

// Handle troops spawning
export function troops_spawn()
{
	let changes: Change[] = [];

	for (let _ = 0; _ < Global.spawn_per_sec; _++)
	{
		// Choose the cell
		let { i, j } = Grid.get_random_cell();
		let cell = Grid.get_cell(i, j);

		// If the cell isn't empty
		if (cell != null && cell.player != null)
		{
			let map_size = Global.grid_size.x * Global.grid_size.y;
			let territory = cell.player.size;
			let spawn_chance = Utils.random_int(0, map_size);

			// Add the change to the list
			let change = {
				i: i,
				j: j,
				color: cell.color,
				skin_id: cell.skin_id,
				player: cell.player,
				nb_troops: cell.nb_troops
			};

			// Add troops if there are not enough
			if (change.nb_troops < Global.troops_spawn_max && spawn_chance > ((map_size ** 3) * territory) ** (1 / 4))
			{
				change.nb_troops++;
				changes.push(change);
			}

			// Remove troops if there are too many
			else if (change.nb_troops > Global.troops_spawn_max)
			{
				change.nb_troops--;
				changes.push(change);
			}
		}
	}

	Grid.set_cells(changes, false);
}

export function update_leaderboard()
{
	let players_data = Player.list.map(player =>
	{
		return {
			id: player.socket.id,
			nickname: player.nickname,
			size: player.size,
			admin: player.user != null && player.user.admin
		};
	});

	players_data.sort((a, b) => b.size - a.size);

	Global.io.emit('leaderboard', players_data);
}
