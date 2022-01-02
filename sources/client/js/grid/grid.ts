import { Global } from '../properties.js';
import { Cell, Change } from './cell.js';
import { render } from '../renderer/renderer.js';
import { Player } from '../player/player.js';
import { Camera } from '../renderer/camera.js';
import { PlayerCells } from './players.js';

// Create the grid of cells
export function create_grid()
{
	let x = 0
	let y = 0;
	let y_offset = 0;

	for (let i = 0; i < Global.grid_size.x; i++)
	{
		Global.grid.push([]);
		y = 0;
		y_offset = i % 2 ? Math.sin(Global.hexagon_angle) : 0;

		for (let j = 0; j < Global.grid_size.y; j++)
		{
			Global.grid[i].push(new Cell(i, j, x, y + y_offset, '#FFFFFF', -1, '', 0));
			y += Math.sin(Global.hexagon_angle) * 2;
		}

		x += 1 + Math.cos(Global.hexagon_angle);
	}

	Global.grid_boundaries.width = x;
	Global.grid_boundaries.height = y + y_offset;
}

export function update_player_cells_and_draw_grid(context: CanvasRenderingContext2D)
{
	PlayerCells.list = [];
	PlayerCells.main = null;

	if (!Player.playing && Global.cell_from != null && Global.cell_from.player_id != Player.id)
		Global.cell_from = null;

	/*for (let i = 0; i < Global.grid_size.x; i++)
		for (let j = 0; j < Global.grid_size.y; j++)
			if (Global.grid[i][j].player_id != '')
				Global.grid[i][j].skin_id = 0;*/

	for (let i = 0; i < Global.grid_size.x; i++)
		for (let j = 0; j < Global.grid_size.y; j++)
		{
			if (Global.grid[i][j].player_id != '')
			{
				if (Global.grid[i][j].player_id == Player.id)
				{
					if (PlayerCells.main == null)
						PlayerCells.main = new PlayerCells(Global.grid[i][j]);
					else
						PlayerCells.main.add_cell(Global.grid[i][j]);
				}

				else
				{
					let player_cells = PlayerCells.list.find(player_cells => player_cells.player_id == Global.grid[i][j].player_id);

					if (player_cells == undefined)
						PlayerCells.list.push(new PlayerCells(Global.grid[i][j]));
					else
						player_cells.add_cell(Global.grid[i][j]);
				}
			}

			else
				Global.grid[i][j].draw_empty(context);
		}
}

// Give the cell at the given coordinates
export function get_cell(x: number, y: number)
{
	if (x < 0 || x >= Global.grid_size.x || y < 0 || y >= Global.grid_size.y)
		return null;

	return Global.grid[x][y];
}

// Set cell values from a change
export function set_cell(change: Change)
{
	if (change.i < 0 || change.i >= Global.grid_size.x || change.j < 0 || change.j >= Global.grid_size.y)
		return null;

	Global.grid[change.i][change.j].color = change.color;
	Global.grid[change.i][change.j].skin_id = change.skin_id;
	Global.grid[change.i][change.j].player_id = change.player_id;
	Global.grid[change.i][change.j].nb_troops = change.nb_troops;

	return Global.grid[change.i][change.j];
}

// Give the cell from the mouse position
export function get_cell_from_mouse(x: number, y: number)
{
	let mouse_pos = Camera.screen_to_canvas(x, y);

	let distance = 100000;
	let index = { x: 0, y: 0 };

	for (let i = 0; i < Global.grid_size.x; i++)
		for (let j = 0; j < Global.grid_size.y; j++)
		{
			let temp = Math.sqrt(Math.pow(mouse_pos.x - Global.grid[i][j].x, 2) + Math.pow(mouse_pos.y - Global.grid[i][j].y, 2));

			if (temp < distance)
			{
				distance = temp;
				index = { x: i, y: j };
			}
		}

	if (distance > 1.)
		return null;

	return Global.grid[index.x][index.y];
}

// Update the grid from the server data
export function update_grid_from_server()
{
	// When the server send the grid
	Global.socket.on('grid_to_client', (server_grid: Cell[][]) =>
	{
		for (let i = 0; i < Global.grid_size.x; i++)
			for (let j = 0; j < Global.grid_size.y; j++)
			{
				Global.grid[i][j].color = server_grid[i][j].color;
				Global.grid[i][j].skin_id = server_grid[i][j].skin_id;
				Global.grid[i][j].player_id = server_grid[i][j].player_id;
				Global.grid[i][j].nb_troops = server_grid[i][j].nb_troops;
			}

		render();
	});

	// Ask the server for the grid
	Global.socket.emit('ask_for_grid');
}

// Tell if the cell are neighbours
export function are_neighbours(cell_1: Cell, cell_2: Cell)
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

export function get_neighbours(cell: Cell)
{
	let temp = get_all_neighbours(cell);
	let neighbours: Cell[] = [];

	temp.forEach(cell =>
	{
		if (cell != null)
			neighbours.push(cell);
	});

	return neighbours;
}

export function get_all_neighbours(cell: Cell)
{
	let neighbours: (Cell | null)[] = [];

	neighbours.push(get_cell(cell.i + 1, cell.j + (cell.i % 2)));
	neighbours.push(get_cell(cell.i    , cell.j + 1));
	neighbours.push(get_cell(cell.i - 1, cell.j + (cell.i % 2)));
	neighbours.push(get_cell(cell.i - 1, cell.j - ((cell.i + 1) % 2)));
	neighbours.push(get_cell(cell.i    , cell.j - 1));
	neighbours.push(get_cell(cell.i + 1, cell.j - ((cell.i + 1) % 2)));

	return neighbours;
}
