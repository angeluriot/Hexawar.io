import { Global } from '../properties.js';
import { Cell, Change } from './cell.js';
import { render } from '../renderer/renderer.js';
import { Player } from '../player/player.js';
import { Camera } from '../renderer/camera.js';
import { PlayerCells } from './players.js';
import { ClientSocket, ServerSocket } from '../properties.js';

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
export function set_cells(changes: Change[])
{
	changes.forEach(change => {
		if (change.i < 0 || change.i >= Global.grid_size.x || change.j < 0 || change.j >= Global.grid_size.y)
			return;

		Global.grid[change.i][change.j].color = change.color;
		Global.grid[change.i][change.j].skin_id = change.skin_id;
		Global.grid[change.i][change.j].player_id = change.player_id;
		Global.grid[change.i][change.j].nb_troops = change.nb_troops;
	});

}

// Give the cell from the mouse position
export function get_cell_from_mouse(x : number, y : number) {
	let mouse_pos = Camera.screen_to_canvas(x, y);

    if(mouse_pos.x + 1 < 0 || mouse_pos.y + Math.sqrt(3) / 2 < 0)
        return null;

	mouse_pos.x += 1;
    mouse_pos.y += Math.sqrt(3)/2;

    let i = Math.floor((2 * mouse_pos.x) / 3);
    let j = Math.floor((2 * mouse_pos.y) / Math.sqrt(3));

    let u = mouse_pos.x - (i * 1.5);
    let v = mouse_pos.y - (j * Math.sqrt(3) / 2)

    let up = u * 2 / 3;
    let vp = v * 2/ Math.sqrt(3);

    let lowerhalf = (mouse_pos.y) / Math.sqrt(3) % 1 > 0.5;
    if(mouse_pos.x % 3 > 1.5 ) lowerhalf = !lowerhalf;

    if(lowerhalf && vp > 3 * up  || !lowerhalf && (1 - vp) > 3 * up ) i -= 1;
    
    j = Math.floor((j - (i % 2)) / 2);


    if (i < 0 || i >= Global.grid_size.x || j < 0 || j >= Global.grid_size.y)
        return null;

	return Global.grid[i][j];
}

// Update the grid from the server data
export function update_grid_from_server()
{
	// When the server send the grid
	Global.socket.on(ServerSocket.GRID, (server_grid: Cell[]) =>
	{
		let gridValIdx = 0
		for (let i = 0; i < Global.grid_size.x; i++)
			{
				for (let j = 0; j < Global.grid_size.y; j++)
				{
					if(gridValIdx < server_grid.length && server_grid[gridValIdx].i == i && server_grid[gridValIdx].j == j) {
						Global.grid[i][j].color = server_grid[gridValIdx].color;
						Global.grid[i][j].skin_id = server_grid[gridValIdx].skin_id;
						Global.grid[i][j].player_id = server_grid[gridValIdx].player_id;
						Global.grid[i][j].nb_troops = server_grid[gridValIdx].nb_troops;
						gridValIdx += 1
					} 
					else {
						Global.grid[i][j].color = '#FFFFFF';
						Global.grid[i][j].skin_id = -1;
						Global.grid[i][j].player_id = '';
						Global.grid[i][j].nb_troops = 0;
					}
					
				}
			}

		render();
	});

	// Ask the server for the grid
	Global.socket.emit(ClientSocket.GRID_REQUEST);
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

// Find the neighbours of a cell
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
