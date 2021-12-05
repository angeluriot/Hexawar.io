import * as Utils from '../utils/utils.js';
import { Cell, Change, ClientChange, to_client, ClientCell } from './cell.js';
import { Player } from '../players/player.js';
import { Global } from '../properties.js';

// Create the grid of cells
export function create_grid()
{
	for (let i = 0; i < Global.grid_size.x; i++)
	{
		Global.grid.push([]);

		for (let _ = 0; _ < Global.grid_size.y; _++)
			Global.grid[i].push(new Cell('#FFFFFF', null, 0));
	}
}

// Set cell values from a change
export function set_cell(change: Change)
{
	if (change.i < 0 || change.i >= Global.grid_size.x || change.j < 0 || change.j >= Global.grid_size.y)
		return;

	let cell = Global.grid[change.i][change.j];
	Player.update_sizes(cell.player, change.player);

	cell.color = change.color;
	cell.player = change.player;
	cell.nb_troops = change.nb_troops;

	Global.io.emit('change', to_client(change));
}

// Set cells values from changes
export function set_cells(changes: Change[], is_move: boolean)
{
	let valid_changes: ClientChange[] = [];

	for (let i = 0; i < changes.length; i++)
	{
		if (changes[i].i < 0 || changes[i].i >= Global.grid_size.x || changes[i].j < 0 || changes[i].j >= Global.grid_size.y)
			continue;

		let cell = Global.grid[changes[i].i][changes[i].j];
		Player.update_sizes(cell.player, changes[i].player);

		cell.color = changes[i].color;
		cell.player = changes[i].player;
		cell.nb_troops = changes[i].nb_troops;

		valid_changes.push(to_client(changes[i]));
	}

	Global.io.emit('changes', valid_changes, is_move);
}

// Give the cell at the given coordinates
export function get_cell(x: number, y: number)
{
	if (x < 0 || x >= Global.grid_size.x || y < 0 || y >= Global.grid_size.y)
		return null;

	return Global.grid[x][y];
}

// Give a random cell of the grid
export function get_random_cell()
{
	return { i: Utils.random_int(0, Global.grid_size.x), j: Utils.random_int(0, Global.grid_size.y) };
}

// Tell if the cell are neighbours
export function are_neighbours(cell_1: { i: number, j: number }, cell_2: { i: number, j: number })
{
	if (cell_1 == null || cell_2 == null)
		return false;

	if (cell_1.i == cell_2.i && Math.abs(cell_1.j - cell_2.j) == 1)
		return true;

	if (Math.abs(cell_1.i - cell_2.i) == 1)
	{
		if (cell_1.i % 2 == 0)
			return cell_2.j == cell_1.j || cell_2.j == cell_1.j - 1;
		else
			return cell_2.j == cell_1.j || cell_2.j == cell_1.j + 1;
	}

	return false;
}

// Remove all the cells of a player
export function remove_player_from_grid(player: Player)
{
	let changes: Change[] = [];

	for (let i = 0; i < Global.grid_size.x; i++)
		for (let j = 0; j < Global.grid_size.y; j++)
			if (Global.grid[i][j].player == player)
			{
				changes.push({
					i: i,
					j: j,
					color: '#FFFFFF',
					player: null,
					nb_troops: 0
				});
			}

	// Set the changes
	set_cells(changes, false);
}

export function get_client_grid()
{
	let grid: ClientCell[][] = [];

	for (let i = 0; i < Global.grid_size.x; i++)
	{
		grid.push([]);

		for (let j = 0; j < Global.grid_size.y; j++)
		{
			let cell = Global.grid[i][j];

			grid[i].push({
				color: cell.color,
				player_id: (cell.player == null ? '' : cell.player.socket.id),
				nb_troops: cell.nb_troops
			});
		}
	}

	return grid;
}
