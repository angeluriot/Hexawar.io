import { Global } from './properties.js';
import * as Grid from './grid/grid.js';
import { render } from './renderer/renderer.js';
import * as Cookie from './player/cookie.js';
import { Camera } from './renderer/camera.js';
import { Player } from './player/player.js';
import { Change } from './grid/cell.js';
import * as Menu from './user/menu.js';
import * as MatchResult from './player/match_result.js';
import { ClientSocket, ServerSocket } from './properties.js';

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
	Global.socket.on(ServerSocket.CHANGES, (changes: Change[]) =>
	{
		Grid.set_cells(changes);

		changes.forEach((change) => {
			if(change.player_id == Player.id && Player.last_move.i == change.i && Player.last_move.j == change.j)
				Global.cell_from = Grid.get_cell(change.i, change.j);
		});

		render();
	});

}

// Join the game
export function join_game()
{
	// When the server sends the spawn data
	Global.socket.on(ServerSocket.SPAWN, (spawn: {i: number, j: number}) =>
	{
		const form_div = document.querySelector('.connect_div') as HTMLDivElement;
		const spectator_div = document.querySelector('.spectator_div') as HTMLDivElement;
		const leaderboard = document.querySelector('.leaderboard') as HTMLDivElement;

		Player.playing = true;
		form_div.style.display = 'none';
		leaderboard.style.visibility = 'visible';
		spectator_div.style.display = 'none';

		game_events();
		Cookie.create_cookie();
		render();

		Player.id = Global.socket.id;
		let cell = Grid.get_cell(spawn.i, spawn.j);

		if (cell != null)
			Camera.move(cell.x, cell.y);

		Global.socket.emit(ClientSocket.GRID_REQUEST);
		render();
	});

	Menu.clear();

	// Tell the server that the player has joined
	Global.socket.emit(ClientSocket.JOIN_GAME, Player.get_object());
}

// Start the game
export function start_game(nickname: string, color: string)
{
	let canvas = document.getElementById('canvas') as HTMLCanvasElement;
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	// Create the player
	Player.nickname = nickname.trim();

	if (Player.nickname.length > 16)
		Player.nickname = Player.nickname.substring(0, 16);

	Player.color = color;
	Player.conquered_lands = 1;
	Player.highest_score = 1;
	Player.highest_rank = Number.MAX_SAFE_INTEGER;
	Player.start_time = Date.now();
	Player.score = [];

	join_game();

	//Send ping to server
	let ping_interval = setInterval(() => {
		Global.socket.emit(ClientSocket.PING, Date.now());
	}, 1000);

	// If the player dies
	Global.socket.on(ServerSocket.DEATH, (conquered_lands: number, max_size: number) =>
	{
		clearInterval(ping_interval);
		Player.conquered_lands = conquered_lands;
		Player.highest_score = max_size;
		MatchResult.display_results();
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

			Player.last_move = { i: cell_to.i, j: cell_to.j };
			Global.socket.emit(ClientSocket.MOVES, moves);
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
			if (cell != null && Global.cell_from != null) {
				Global.socket.emit(ClientSocket.MOVES, [{
					from: { i: Global.cell_from.i, j: Global.cell_from.j },
					to: { i: cell.i, j: cell.j }
				}]);
				Player.last_move = { i: cell.i, j: cell.j };
			}

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
				if (Global.cell_from != null && Grid.are_neighbours(cell, Global.cell_from) && Global.cell_from.nb_troops > 1) {
					Global.socket.emit(ClientSocket.MOVES, [{
						from: { i: Global.cell_from.i, j: Global.cell_from.j },
						to: { i: cell.i, j: cell.j }
					}]);

					Player.last_move = { i: cell.i, j: cell.j };
				// Change selected cell
				}
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
				if (Global.cell_from != null && Grid.are_neighbours(cell, Global.cell_from) && Global.cell_from.nb_troops > 1) {
					Global.socket.emit(ClientSocket.MOVES, [{
						from: { i: Global.cell_from.i, j: Global.cell_from.j },
						to: { i: cell.i, j: cell.j }
					}]);
					Player.last_move = { i: cell.i, j: cell.j };
				// The selected cell is far (choose the cell with the most troops)
				}
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

					if (best_cell != null) {
						Global.socket.emit(ClientSocket.MOVES, [{
							from: { i: best_cell.i, j: best_cell.j },
							to: { i: cell.i, j: cell.j }
						}]);
						Player.last_move = { i: cell.i, j: cell.j };
					}
				}
			}
		}
	}

	window.addEventListener('dblclick', e =>
	{
		e.preventDefault();
		double_click(e);
	});

	window.addEventListener('mousedown', e =>
	{
		e.preventDefault();

		if (e.buttons == 1)
		{
			move_by_clicking(e);
			start_dragging(e);
		}
	});

	window.addEventListener('mousemove', e =>
	{
		e.preventDefault();
		Global.mouse_pos = Camera.screen_to_canvas(e.clientX, e.clientY);
		when_dragging(e);
	});

	window.addEventListener('mouseup', e =>
	{
		e.preventDefault();
		finish_dragging(e);
	});
}
