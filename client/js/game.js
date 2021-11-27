// Load the map and the change events
function load_background(socket)
{
	let canvas = document.getElementById('canvas');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	create_grid();
	camera.init();
	update_grid_from_server(socket);

	// Changes from server
	socket.on('change', change =>
	{
		set_cell(change);
		render();
	});

	socket.on('changes', update =>
	{
		for (let i = 0; i < update.changes.length; i++)
			set_cell(update.changes[i]);

		if (user != null && update.is_move && update.changes[0].user_id == user.id && update.changes[1].user_id == user.id)
			cell_from = get_cell(update.changes[1].i, update.changes[1].j);

		render();
	});
}

// Join the game
function join_game(socket, user)
{
	// When the server sends the spawn data
	socket.on('send_joining_data', data =>
	{
		user.id = data.socket_id;
		let cell = get_cell(data.spawn.i, data.spawn.j);
		camera.move(cell.x, cell.y);
		render();
	});

	// Tell the server that the user has joined
	socket.emit('join_game', user);
}

// Start the game
function start_game(socket, name, color)
{
	let canvas = document.getElementById('canvas');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	// Create the user
	user = {
		id: '',
		name: name,
		color: color
	};

	join_game(socket, user);
	game_events(socket, user);
	create_cookie(user);
	render();

	// If the user dies
	socket.on('death', () =>
	{
		setTimeout(() =>
		{
			location.reload();
		}, 1000);
	});
}

// The game events
function game_events(socket, user)
{
	move(socket, user);
}

// The troops moves
function move(socket, user)
{
	function double_click(e)
	{
		let cell = get_cell_from_mouse(e.clientX, e.clientY);

		if (cell != null && cell.user_id == user.id)
		{
			let cell_to = cell;
			let cells_from = get_neighbours(cell_to);

			for (let i = 0; i < cells_from.length; i++)
				if (cells_from[i].user_id == cell_to.user_id)
					socket.emit('move', {
						from: { i: cells_from[i].i, j: cells_from[i].j },
						to: { i: cell_to.i, j: cell_to.j }
					});

			render();
		}
	}

	function start_dragging(e)
	{
		if (!dragging)
		{
			let cell = get_cell_from_mouse(e.clientX, e.clientY);

			if (cell != null && cell.user_id == user.id && cell.nb_troops > 1)
			{
				cell_from = cell;
				drag_from = { x: cell.x, y: cell.y };
				drag_to = camera.screen_to_canvas(e.clientX, e.clientY);
				dragging = true;
			}
		}
	}

	function when_dragging(e)
	{
		if (dragging)
		{
			let cell = get_cell_from_mouse(e.clientX, e.clientY);

			if (cell != null && cell != cell_from && are_neighbours(cell_from, cell))
			{
				drag_to = { x: cell.x, y: cell.y };
				show_drag = true;
				render();
			}

			else
				show_drag = false;

			render();
		}
	}

	function finish_dragging(e)
	{
		if (dragging)
		{
			let cell = get_cell_from_mouse(e.clientX, e.clientY);

			// Send the move data to the server
			if (cell != null)
				socket.emit('move', {
					from: { i: cell_from.i, j: cell_from.j },
					to: { i: cell.i, j: cell.j }
				});

			show_drag = false;
			dragging = false;
			render();
		}
	}

	function move_by_clicking(e)
	{
		let cell = get_cell_from_mouse(e.clientX, e.clientY);

		if (cell != null && cell != cell_from)
		{
			// In our side
			if (cell.user_id == user.id)
			{
				// Simple move
				if (cell_from != null && are_neighbours(cell, cell_from) && cell_from.nb_troops > 1)
					socket.emit('move', {
						from: { i: cell_from.i, j: cell_from.j },
						to: { i: cell.i, j: cell.j }
					});

				// Change selected cell
				else
				{
					cell_from = cell;
					render();
				}
			}

			// Enemy side
			else
			{
				// The selected cell is close
				if (are_neighbours(cell, cell_from) && cell_from.nb_troops > 1)
					socket.emit('move', {
						from: { i: cell_from.i, j: cell_from.j },
						to: { i: cell.i, j: cell.j }
					});

				// The selected cell is far (choose the cell with the most troops)
				else
				{
					let cells_from = get_neighbours(cell);
					let nb_troops = -1;
					let best_cell = null;

					for (let i = 0; i < cells_from.length; i++)
						if (cells_from[i].user_id == user.id && cells_from[i].nb_troops > nb_troops)
						{
							nb_troops = cells_from[i].nb_troops;
							best_cell = cells_from[i];
						}

					if (best_cell != null)
						socket.emit('move', {
							from: { i: best_cell.i, j: best_cell.j },
							to: { i: cell.i, j: cell.j }
						});
				}
			}
		}
	}

	window.addEventListener('dblclick', e => { double_click(e); });

	window.addEventListener('mousedown', e =>
	{
		if (e.buttons == 1)
		{
			move_by_clicking(e);
			start_dragging(e);
		}
	});

	window.addEventListener('mousemove', e => { when_dragging(e); });
	window.addEventListener('mouseup', e => { finish_dragging(e); });
}
