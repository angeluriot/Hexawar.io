import * as Grid from './grid/grid.js';
import { Player } from './players/player.js';
import { Global, ClientSocket, ServerSocket } from './properties.js';
import { Change, ClientChange, to_client } from './grid/cell.js';
import * as Utils from './utils/utils.js';
import { Bot } from './bots/bot.js';

export type Move = {
	from: { i: number, j: number },
	to: { i: number, j: number }
}

// Handle a player joining the game
export function join(player: Player)
{
	// Send the grid
	player.socket.on(ClientSocket.GRID_REQUEST, () =>
	{
		player.last_message = Date.now();
		player.socket.emit(ServerSocket.GRID, Grid.get_client_grid());
	});

	// Register the player
	player.socket.on(ClientSocket.JOIN_GAME, (input_player: { nickname: string, color: string, skin_id: number }) =>
	{
		if(!input_player)
			return;

		if(typeof input_player.nickname != 'string' || typeof input_player.color != 'string' || typeof input_player.skin_id != 'number')
			return;

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
			let getSpawn = Grid.get_cell(spawn.i,spawn.j);
			let playerSpawn = getSpawn?.player;
			if (playerSpawn != null){
				let neighboursSpawn = Grid.get_neighbours_coordinates([spawn.i,spawn.j]);
				let playerCellOffset : number = 0;

				for(playerCellOffset = 0; playerCellOffset < neighboursSpawn.length; playerCellOffset++){
					if(Grid.get_cell(neighboursSpawn[playerCellOffset][0],neighboursSpawn[playerCellOffset][1])?.player != playerSpawn){
						break;
					}
				}

				if(playerCellOffset != neighboursSpawn.length){
					let lastWasCell = false;
					let areas: [number, number][][] = [];
					let last_x = neighboursSpawn[playerCellOffset][0];
					let last_y = neighboursSpawn[playerCellOffset][1];
					for(let i=1; i < neighboursSpawn.length+1; i+=1){
						let [x, y] = neighboursSpawn[(playerCellOffset + i) % neighboursSpawn.length];
						if(Grid.get_cell(x, y)?.player == playerSpawn){
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
					let toKill = Grid.dying_cells(areas, [[spawn.i, spawn.j]]);
					let dyingCells: Change[] = [];
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
					Grid.set_cells(dyingCells);
				}
			}

			// Set the change
			const change = {
				i: spawn.i,
				j: spawn.j,
				color: player.color,
				skin_id: player.skin_id,
				player: player,
				nb_troops: Global.initial_nb_troops
			};

			Grid.set_cells([change]);
			player.socket.emit(ServerSocket.SPAWN, spawn);
			player.last_message = Date.now();
			update_leaderboard();
		}
	});
}

// The events of the game
export function game_events(player: Player)
{
	player_moves(player);
	player_ping(player);
}

// Send changes to clients
export function send_changes() {
	let clientList : ClientChange [] = [];
	Global.changes_list.forEach(e => {
		clientList.push(to_client(e));
	});
	if(clientList.length > 0)
		Global.io.emit(ServerSocket.CHANGES, clientList)
}

// Reset changes list
export function reset_changes() {
	Global.changes_list = [];
}

//Disconnect client if timed out
export function check_timeout() {
	Player.list.map(player =>
		{
			if(Date.now() - (player.last_message - player.latency) > Global.timeout_delay) {
				player.die();
				Grid.remove_player_from_grid(player);
			}
		});
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
		send_changes();
		reset_changes();
	}, Global.update_rate);

	setInterval(() =>
	{
		check_timeout();
	}, 2000);

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
		console.log('[' + new Date().toTimeString().split(' ')[0] + '] User disconnected (' + player.socket.conn.remoteAddress + ')');
	});
}

// Handle player ping
export function player_ping(player: Player) {
	player.socket.on(ClientSocket.PING, (send_date: number) => {
		if(!send_date)
			return;

		if(typeof send_date != 'number')
			return;

		player.latency = Date.now() - send_date;
		player.last_message = Date.now();
	});
}

// Handle player moves
export function player_moves(player: Player)
{
	player.socket.on(ClientSocket.MOVES, (moves: any) =>
	{
		if (!moves)
			return;

		if (!Array.isArray(moves))
			return;

		for (let move of moves)
			if (!is_move(move))
				return;

		player.last_message = Date.now();
		moves.forEach(move => move_event(move, player));
	});
}

// Check incoming Move packet type
function is_move(move : any) : move is Move
{
	let is_valid = typeof (move as Move).from.i == 'number';
	is_valid = is_valid && typeof (move as Move).from.j == 'number';
	is_valid = is_valid && typeof (move as Move).to.i == 'number';
	is_valid = is_valid && typeof (move as Move).to.j == 'number';

	return is_valid;
}

export function move_event(move: Move, player: Player | Bot)
{
	let cell_from = Grid.get_cell(move.from.i, move.from.j);
	let cell_to = Grid.get_cell(move.to.i, move.to.j);
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
				// If the attacked player is a bot, remove their cell from their cell list
				if (cell_to.player instanceof Bot)
				{
					cell_to.player.remove_cell(change_to.i, change_to.j);

					if (!cell_to.player.is_attacked)
						cell_to.player.alert(change_to.i, change_to.j);
				}

				let dyingPlayer = change_to.player;
				let dyingCells: Change[] = [];
				//If we attack a player
				if(cell_to.player!=null){
					//Find the starting point of the area detection
					let neighbours: [number, number][] = Grid.get_neighbours_coordinates([move.to.i, move.to.j]);
					let playerCellOffset: number = 0;
					while(neighbours[playerCellOffset][0] != move.from.i && neighbours[playerCellOffset][1] != move.from.j )
						playerCellOffset++;

					//Detect the differents areas
					let lastWasCell = false;
					let areas: [number, number][][] = [];
					let last_x = move.from.i;
					let last_y = move.from.j;
					for(let i=1; i < neighbours.length+1; i++){
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

						// If the attacked player is a bot, remove their cell from their cell list
						if (cell_to.player instanceof Bot)
							cell_to.player.remove_cell(killed[0], killed[1]);
					}

					Grid.set_cells(dyingCells);
				}

				change_to.nb_troops = change_from.nb_troops - change_to.nb_troops - 1;
				change_from.nb_troops = 1;
				change_to.color = change_from.color;
				change_to.skin_id = change_from.skin_id;
				change_to.player = change_from.player;

				if (player instanceof Bot)
					player.cells.push({ i: change_to.i, j: change_to.j });
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

		Grid.set_cells([change_from, change_to]);
	}
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
			if (change.nb_troops < Global.troops_spawn_max && spawn_chance > (map_size * territory) ** (1 / 2))
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

	Grid.set_cells(changes);
}

export function update_leaderboard()
{
	let players_data = Player.list.map(player =>
	{
		return {
			id: player.socket.id,
			nickname: player.nickname,
			size: player.size,
			admin: player.user != null && player.user.admin,
			bot: false
		};
	});

	let bots_data = Bot.list.map(bot =>
	{
		return {
			id: bot.id as unknown as string,
			nickname: bot.nickname,
			size: bot.size,
			admin: false,
			bot: true
		};
	});

	let all_data = players_data;

	for (let bot_data of bots_data)
		all_data.push(bot_data);

	all_data.sort((a, b) => b.size - a.size);

	Global.io.emit(ServerSocket.LEADERBOARD, all_data);
}
