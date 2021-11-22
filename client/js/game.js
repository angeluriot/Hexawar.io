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

	socket.on('changes', changes =>
	{
		for (let i = 0; i < changes.length; i++)
			set_cell(changes[i]);

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
		id: 0,
		name: name,
		color: color
	};

	join_game(socket, user);
	game_events(socket, user);
	create_cookie(user);
	render();
}

// The game events
function game_events(socket, user)
{
	move(socket, user);
}

// The troops moves
function move(socket, user)
{
	// Start dragging
	window.addEventListener('mousedown', e =>
	{
		if (!dragging && e.buttons == 1)
		{
			let cell = get_cell_from_mouse(e.clientX, e.clientY);

			if (cell != null && cell.user_id == user.id && cell.nb_troops > 1)
			{
				cell_from = cell;
				drag_from = { x: cell.x, y: cell.y };
				drag_to = camera.screen_to_canvas(e.clientX, e.clientY);
				dragging = true;
				render();
			}
		}
	});

	// When dragging
	window.addEventListener('mousemove', e =>
	{
		if (dragging)
		{
			drag_to = camera.screen_to_canvas(e.clientX, e.clientY);
			render();
		}
	});

	// Finish dragging
	window.addEventListener('mouseup', e =>
	{
		if (dragging)
		{
			let cell = get_cell_from_mouse(e.clientX, e.clientY);

			if (cell != null)
			{
				cell_to = cell;

				// Send the move data to the server
				socket.emit('move', {
					from: { i: cell_from.i, j: cell_from.j },
					to: { i: cell_to.i, j: cell_to.j }
				});
			}

			dragging = false;
			render();
		}
	});

	// Move by clicking
	window.addEventListener('click', e => {
		let cell = get_cell_from_mouse(e.clientX, e.clientY);

		if (cell)
		if (move_is_cell_from) {
			if (are_neighbours(cell, move_cell_from)) {
				socket.emit('move', {
					from: { i: move_cell_from.i, j: move_cell_from.j },
					to: { i: cell.i, j: cell.j }
				});
				/*
					Version 1 : Le clic double doit être répété plusieurs fois pour déplacer des unités
				 */
				// move_is_cell_from = false;

				/*
					Version 2 : Le clic après déplacement est retenu comme déplacement, possibilité de faire un déplacement
					plus rapide si les cases visées appartiennent déjà au joueur
				 */
				
				if (cell.user_id == user.id) {
					move_cell_from = true;
					move_cell_from = cell;
				} else
					move_is_cell_from = false;
			
			} else if (cell.user_id == user.id)
				move_cell_from = cell;
			else {
				move_is_cell_from = false;
			}
		} else if (cell.nb_troops > 1 && cell.user_id == user.id) {
			move_is_cell_from = true;
			move_cell_from = cell;
		}
	});
}
