import * as Utils from '../utils/utils.js';
import { Cell, Change, ClientChange, to_client, ClientCell } from './cell.js';
import { Player } from '../players/player.js';
import { Bot } from '../bots/bot.js';
import { Global } from '../properties.js';

// Create the grid of cells
export function create_grid()
{
	for (let i = 0; i < Global.grid_size.x; i++)
	{
		Global.grid.push([]);

		for (let _ = 0; _ < Global.grid_size.y; _++)
			Global.grid[i].push(new Cell('#FFFFFF', -1, null, 0));
	}
}

// Set cells values from changes
export function set_cells(changes: Change[])
{

	for (let i = 0; i < changes.length; i++)
	{
		if (changes[i].i < 0 || changes[i].i >= Global.grid_size.x || changes[i].j < 0 || changes[i].j >= Global.grid_size.y)
			continue;

		let cell = Global.grid[changes[i].i][changes[i].j];
		Player.update_sizes(cell.player, changes[i].player);

		cell.color = changes[i].color;
		cell.skin_id = changes[i].skin_id;
		cell.player = changes[i].player;
		cell.nb_troops = changes[i].nb_troops;

		Global.changes_list.push(changes[i]);
	}

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

// Gives a cell by prioritising empty cells
export function get_spawn_cell()
{
	let cell = Global.grid[0][0];
	let res: { i: number, j: number } = { i: 0, j: 0 };

	for (let i = 0; i < 50; i++)
	{
		res = { i: Utils.random_int(0, Global.grid_size.x), j: Utils.random_int(0, Global.grid_size.y) };
		let x: number = Utils.random_int(0, Global.grid_size.x);
		let y: number = Utils.random_int(0, Global.grid_size.y);

		cell = Global.grid[x][y];

		if (cell.player == null)
			return {i: x, j: y};
	}
	return res;
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
export function remove_player_from_grid(player: Player | Bot)
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
					skin_id: -1,
					player: null,
					nb_troops: 0
				});
			}

	// Set the changes
	set_cells(changes);
}

export function get_client_grid() : ClientChange[]
{
	let grid: ClientChange[] = [];

	for (let i = 0; i < Global.grid_size.x; i++)
	{

		for (let j = 0; j < Global.grid_size.y; j++)
		{
			let cell = Global.grid[i][j];
			if(cell.nb_troops > 0)
			{
				grid.push({
					i: i,
					j: j,
					color: cell.color,
					skin_id: cell.skin_id,
					player_id: (cell.player == null ? '' : cell.player instanceof Bot ? cell.player.id as unknown as string : cell.player.socket.id),
					nb_troops: cell.nb_troops
				});
			}
		}
	}

	return grid;
}

//Find the neighbours from a cell in a cyclic order
//@see https://www.redblobgames.com/grids/hexagons/#neighbors
export function get_neighbours_coordinates(cell: [number, number]){

	if (cell[0] < 0 || cell[0] >= Global.grid_size.x || cell[1] < 0 || cell[1] >= Global.grid_size.y)
		return [];

	let neighbours: [number, number][] = [];
	let parity = cell[0] % 2;
	let offsets: number[][][] = [
		// even cols
		[[+1,  0], [+1, -1], [ 0, -1],
		 [-1, -1], [-1,  0], [ 0, +1]],
		// odd cols
		[[+1, +1], [+1,  0], [ 0, -1],
		 [-1,  0], [-1, +1], [ 0, +1]],
	]

	for (let i = 0; i < offsets[parity].length; i++)
	{
		if(get_cell(cell[0] + offsets[parity][i][0], cell[1] + offsets[parity][i][1]) != null)
			neighbours.push([cell[0] + offsets[parity][i][0], cell[1] + offsets[parity][i][1]]);
	}

	return neighbours;

}

//Return the number of cells we have to cross to go from c1 to c2
//@see https://www.redblobgames.com/grids/hexagons/#distances
export function get_relative_distance(cell_1: [number,number], cell_2: [number,number]){
	let axial_1:  [number,number] = [cell_1[0], cell_1[1] - (cell_1[0] - (cell_1[0] & 1)) / 2];
	let axial_2:  [number,number] = [cell_2[0], cell_2[1] - (cell_2[0] - (cell_2[0] & 1)) / 2];

	return (Math.abs(axial_1[0] - axial_2[0])
		+ Math.abs(axial_1[0] + axial_1[1] - axial_2[0] - axial_2[1])
		+ Math.abs(axial_1[1] - axial_2[1])) / 2;
}

//Return array of dying cells
export function dying_cells(areas: [number, number][][], excludedCells: [number, number][]): [number, number][]{
	if(areas.length>1){
		let dyingCells: [number,number][] = [];
		let player: Player | Bot = get_cell(areas[areas.length-1][0][0], areas[areas.length-1][0][1])!.player!;

		//Execute the A* algorithm between the last 2 areas of the array
		let cost_so_far: (number|null)[][] = [];
		for(let i = 0; i < Global.grid_size.x; i += 1){
			cost_so_far.push([]);
			for(let j = 0; j < Global.grid_size.y; j += 1){
				cost_so_far[i].push(null);
			}
		}
		let frontier: [[number, number], number][] = areas[areas.length-1].map(x => [x, 0]);
		for(let f of frontier)
			cost_so_far[f[0][0]][f[0][1]] = 0;

		let connected = false;
		let territory1: [number, number][] = [];
		let territory1Value: number = 0;
		let tmp;
		while(tmp = frontier.pop()){
			let current: [number, number] = tmp[0];

			territory1.push(current);
			territory1Value += get_cell(current[0],current[1])!.nb_troops;
			if(current[0] == areas[areas.length-2][0][0] && current[1] == areas[areas.length-2][0][1]){
				areas[areas.length-2].concat(areas[areas.length-1]);
				//If the areas are linked, they're the same area
				areas.pop();
				connected = true;
				break;
			}

			//Neighbours have to be from your territory and no from the dying cell (not changed yet)
			let next = get_neighbours_coordinates(current).filter(([x, y])=> get_cell(x, y)!.player! === player &&
																			 excludedCells.filter(([x1, y1])=> x==x1 && y==y1).length == 0);
			for(let nextCell of next){
				let new_cost: number = cost_so_far[current[0]][current[1]]! + 1;
				if(cost_so_far[nextCell[0]][nextCell[1]] == null || new_cost < cost_so_far[nextCell[0]][nextCell[1]]!){
					cost_so_far[nextCell[0]][nextCell[1]] = new_cost;
					let priority = new_cost + get_relative_distance(areas[areas.length-2][0], nextCell);
					frontier.push([nextCell, priority]);
					frontier.sort(([x1, y1], [x2, y2]) => y2 - y1);
				}
			}
		}

		if(!connected){
			//We execute flood fill algorithm to mesure the size of the second area
			let frontiers = areas[areas.length-2];
			let visited: boolean[][] = [];

			for(let i = 0; i < Global.grid_size.x; i += 1){
				visited.push([]);
				for(let j = 0; j < Global.grid_size.y; j += 1){
					visited[i].push(false);
				}
			}
			for(let exclude of excludedCells)
				visited[exclude[0]][exclude[1]]=true;

			let territory2 = frontiers;
			let territory2Value: number = 0;
			for(let frontier of frontiers){
				territory2Value += get_cell(frontier[0],frontier[1])!.nb_troops;
				visited[frontier[0]][frontier[1]]=true;
			}


			while(frontiers.length != 0){

				let newFrontiers: [number, number][] = [];

				for(let f of frontiers){
					let cells = get_neighbours_coordinates(f);
					for(let cell of cells){
						if(visited[cell[0]][cell[1]] == false){
							if (get_cell(cell[0], cell[1])!.player! == player){
								newFrontiers.push(cell);
								territory2Value += get_cell(cell[0],cell[1])!.nb_troops;
							}
							visited[cell[0]][cell[1]] = true;
						}
					}
				}

				territory2 = territory2.concat(newFrontiers);
				frontiers = newFrontiers;
			}

			//Only one territory remain between the two areas
			if(territory1.length > territory2.length){
				areas[areas.length-2] = areas[areas.length-1];
				dyingCells = territory2;
			}else{
				if(territory1.length < territory2.length){
					dyingCells = territory1;
				}else{
					if(territory1Value > territory2Value){
						areas[areas.length-2] = areas[areas.length-1];
						dyingCells = territory2;
					}else{
						dyingCells = territory1;
					}
				}
			}
			areas.pop();
		}

		//If there remain two area (3 at the start), we execute the algorithm again
		dyingCells = dyingCells.concat(dying_cells(areas, excludedCells));
		return dyingCells
	}

	return [];
}
