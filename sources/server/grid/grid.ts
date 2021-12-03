import * as Utils from '../utils/utils.js';
import { Cell, Change } from './cell.js';
import { User } from '../users/users.js';
import { Global } from '../properties.js';

// Properties
let grid_size = { x: 60, y: 30 };
let grid: Cell[][] = [];

// Create the grid of cells
export function create_grid()
{
	for (let i = 0; i < grid_size.x; i++)
	{
		grid.push([]);

		for (let j = 0; j < grid_size.y; j++)
			grid[i].push(new Cell("#FFFFFF", '', 0));
	}
}

// Set cell values from a change
export function set_cell(change: Change)
{
	if (change.i < 0 || change.i >= grid_size.x || change.j < 0 || change.j >= grid_size.y)
		return null;

	let cell = grid[change.i][change.j];
	User.update_sizes(cell.user_id, change.user_id);

	cell.color = change.color;
	cell.user_id = change.user_id;
	cell.nb_troops = change.nb_troops;

	Global.io.emit('change', change);
	return grid[change.i][change.j];
}

// Set cells values from changes
export function set_cells(changes: Change[], is_move: boolean)
{
	let valid_changes: Change[] = [];
	let result: Cell[] = [];

	for (let i = 0; i < changes.length; i++)
	{
		if (changes[i].i < 0 || changes[i].i >= grid_size.x || changes[i].j < 0 || changes[i].j >= grid_size.y)
			continue;

		let cell = grid[changes[i].i][changes[i].j];
		User.update_sizes(cell.user_id, changes[i].user_id);

		cell.color = changes[i].color;
		cell.user_id = changes[i].user_id;
		cell.nb_troops = changes[i].nb_troops;

		valid_changes.push(changes[i]);
		result.push(grid[changes[i].i][changes[i].j]);
	}

	Global.io.emit('changes', valid_changes, is_move);
	return result;
}

// Give the cell at the given coordinates
export function get_cell(x: number, y: number)
{
	if (x < 0 || x >= grid_size.x || y < 0 || y >= grid_size.y)
		return null;

	return grid[x][y];
}

// Give the grid
export function get_grid()
{
	return grid;
}

// Give a random cell of the grid
export function get_random_cell()
{
	return { i: Utils.random_int(0, grid_size.x), j: Utils.random_int(0, grid_size.y) };
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

// Remove all the cells of a user
export function remove_user_from_grid(user: User)
{
	let changes: Change[] = [];

	for (let i = 0; i < grid_size.x; i++)
		for (let j = 0; j < grid_size.y; j++)
			if (grid[i][j].user_id == user.id)
			{
				grid[i][j].color = '#ffffff';
				grid[i][j].user_id = '';
				grid[i][j].nb_troops = 0;

				changes.push({
					i: i,
					j: j,
					color: '#ffffff',
					user_id: '',
					nb_troops: 0
				});
			}

	// Send the changes to the clients
	Global.io.emit('changes', { changes: changes, is_move: false });
}
