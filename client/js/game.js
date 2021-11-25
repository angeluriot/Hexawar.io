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
	// When double clicking
	window.addEventListener('dblclick', e =>
	{
		console.log("double clic");
		let cell = get_cell_from_mouse(e.clientX, e.clientY);

		if (cell != null && cell.user_id == user.id)
		{
			let cell_to = cell;
			let cell_1 = get_cell(cell_to.i - 1, cell_to.j + ((cell_to.i + 1) % 2 == 0));
			let cell_2 = get_cell(cell_to.i    , cell_to.j - 1);
			let cell_3 = get_cell(cell_to.i - 1, cell_to.j - ((cell_to.i + 1) % 2 != 0));
			let cell_4 = get_cell(cell_to.i    , cell_to.j + 1);
			let cell_5 = get_cell(cell_to.i + 1, cell_to.j + ((cell_to.i + 1) % 2 == 0));
			let cell_6 = get_cell(cell_to.i + 1, cell_to.j - ((cell_to.i + 1) % 2 != 0));

			if(cell_1.user_id == cell_to.user_id)
			{
				socket.emit('move', {
					from: { i: cell_1.i, j: cell_1.j },
					to: { i: cell_to.i, j: cell_to.j }
				});
			}
			
			if(cell_2.user_id == cell_to.user_id)
			{
				socket.emit('move', {
					from: { i: cell_2.i, j: cell_2.j },
					to: { i: cell_to.i, j: cell_to.j }
				});
			}

			if(cell_3.user_id == cell_to.user_id)
			{
				socket.emit('move', {
					from: { i: cell_3.i, j: cell_3.j },
					to: { i: cell_to.i, j: cell_to.j }
				});
			}

			if(cell_4.user_id == cell_to.user_id)
			{
				socket.emit('move', {
					from: { i: cell_4.i, j: cell_4.j },
					to: { i: cell_to.i, j: cell_to.j }
				});
			}

			if(cell_5.user_id == cell_to.user_id)
			{
				socket.emit('move', {
					from: { i: cell_5.i, j: cell_5.j },
					to: { i: cell_to.i, j: cell_to.j }
				});
			}

			if(cell_6.user_id == cell_to.user_id)
			{
				socket.emit('move', {
					from: { i: cell_6.i, j: cell_6.j },
					to: { i: cell_to.i, j: cell_to.j }
				});
			}
			
			render();
		}
	});

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
}
