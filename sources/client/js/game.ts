import { Global } from './properties.js';
import * as Grid from './grid/grid.js';
import { render } from './renderer/renderer.js';
import * as Cookie from './player/cookie.js';
import { Camera } from './renderer/camera.js';
import { Player } from './player/player.js';
import { Change } from './grid/cell.js';

export type Move = {
	from: { i: number, j: number },
	to: { i: number, j: number }
}

// Load the map and the change events
export function load_background()
{
	let canvas = document.getElementById('canvas') as HTMLCanvasElement;
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	Grid.create_grid();
	Camera.init();
	Grid.update_grid_from_server();

	// Changes from server
	Global.socket.on('change', (change: Change) =>
	{
		Grid.set_cell(change);
		render();
	});

	Global.socket.on('changes', (changes: Change[], is_move: boolean) =>
	{
		for (let i = 0; i < changes.length; i++)
			Grid.set_cell(changes[i]);

		if (Player.playing && is_move && changes[0].player_id == Player.id && changes[1].player_id == Player.id)
			Global.cell_from = Grid.get_cell(changes[1].i, changes[1].j);

		render();
	});
}

// Join the game
export function join_game()
{
	// When the server sends the spawn data
	Global.socket.on('send_spawn', (spawn: {i: number, j: number}) =>
	{
		Player.id = Global.socket.id;
		let cell = Grid.get_cell(spawn.i, spawn.j);

		if (cell != null)
			Camera.move(cell.x, cell.y);

		render();
	});

	// Tell the server that the player has joined
	Global.socket.emit('join_game', Player.get_object());
}

// Start the game
export function start_game(nickname: string, color: string)
{
	let canvas = document.getElementById('canvas') as HTMLCanvasElement;
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	// Create the player
	Player.nickname = nickname;
	Player.color = color;

	join_game();
	game_events();
	Cookie.create_cookie();
	render();

	// If the player dies
	Global.socket.on('die', () =>
	{
		setTimeout(() => { location.reload(); }, 1000);
	});
}

// The game events
export function game_events()
{
	move();
}

// The troops moves
export function move()
{
	function double_click(e: MouseEvent)
	{
		let cell = Grid.get_cell_from_mouse(e.clientX, e.clientY);

		if (cell != null && cell.player_id == Player.id)
		{
			let cell_to = cell;
			let cells_from = Grid.get_neighbours(cell_to);
			let moves: Move[] = [];

			for (let i = 0; i < cells_from.length; i++)
				if (cells_from[i].player_id == cell_to.player_id)
					moves.push({
						from: { i: cells_from[i].i, j: cells_from[i].j },
						to: { i: cell_to.i, j: cell_to.j }
					});

			Global.socket.emit('moves', moves);
			render();
		}
	}

	function start_dragging(e: MouseEvent)
	{
		if (!Global.dragging)
		{
			let cell = Grid.get_cell_from_mouse(e.clientX, e.clientY);

			if (cell != null && cell.player_id == Player.id && cell.nb_troops > 1)
			{
				Global.cell_from = cell;
				Global.drag_from = { x: cell.x, y: cell.y };
				Global.drag_to = Camera.screen_to_canvas(e.clientX, e.clientY);
				Global.dragging = true;
			}
		}
	}

	function when_dragging(e: MouseEvent)
	{
		if (Global.dragging)
		{
			let cell = Grid.get_cell_from_mouse(e.clientX, e.clientY);

			if (cell != null && Global.cell_from != null && cell != Global.cell_from && Grid.are_neighbours(Global.cell_from, cell))
			{
				Global.drag_to = { x: cell.x, y: cell.y };
				Global.show_drag = true;
				render();
			}

			else
				Global.show_drag = false;

			render();
		}
	}

	function finish_dragging(e: MouseEvent)
	{
		if (Global.dragging)
		{
			let cell = Grid.get_cell_from_mouse(e.clientX, e.clientY);

			// Send the move data to the server
			if (cell != null && Global.cell_from != null)
				Global.socket.emit('move', {
					from: { i: Global.cell_from.i, j: Global.cell_from.j },
					to: { i: cell.i, j: cell.j }
				});

			Global.show_drag = false;
			Global.dragging = false;
			render();
		}
	}

	function move_by_clicking(e: MouseEvent)
	{
		let cell = Grid.get_cell_from_mouse(e.clientX, e.clientY);

		if (cell != null && cell != Global.cell_from)
		{
			// In our side
			if (cell.player_id == Player.id)
			{
				// Simple move
				if (Global.cell_from != null && Grid.are_neighbours(cell, Global.cell_from) && Global.cell_from.nb_troops > 1)
					Global.socket.emit('move', {
						from: { i: Global.cell_from.i, j: Global.cell_from.j },
						to: { i: cell.i, j: cell.j }
					});

				// Change selected cell
				else
				{
					Global.cell_from = cell;
					render();
				}
			}

			// Enemy side
			else
			{
				// The selected cell is close
				if (Global.cell_from != null && Grid.are_neighbours(cell, Global.cell_from) && Global.cell_from.nb_troops > 1)
					Global.socket.emit('move', {
						from: { i: Global.cell_from.i, j: Global.cell_from.j },
						to: { i: cell.i, j: cell.j }
					});

				// The selected cell is far (choose the cell with the most troops)
				else
				{
					let cells_from = Grid.get_neighbours(cell);
					let nb_troops = -1;
					let best_cell = null;

					for (let i = 0; i < cells_from.length; i++)
						if (cells_from[i].player_id == Player.id && cells_from[i].nb_troops > nb_troops)
						{
							nb_troops = cells_from[i].nb_troops;
							best_cell = cells_from[i];
						}

					if (best_cell != null)
						Global.socket.emit('move', {
							from: { i: best_cell.i, j: best_cell.j },
							to: { i: cell.i, j: cell.j }
						});
				}
			}
		}
	}

	window.addEventListener('dblclick', double_click);

	window.addEventListener('mousedown', e =>
	{
		if (e.buttons == 1)
		{
			move_by_clicking(e);
			start_dragging(e);
		}
	});

	window.addEventListener('mousemove', when_dragging);
	window.addEventListener('mouseup', finish_dragging);
}
