const socket = io();

let user = {
	id: 0,
	color: random_color()
}

window.onload = function()
{
	let canvas = document.getElementById('canvas');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	create_grid();

	camera.x = -(grid_boundaries.width / 2.) * inital_camera_zoom + window.innerWidth / 2.;
	camera.y = -(grid_boundaries.height / 2.) * inital_camera_zoom + window.innerHeight / 2.;
	camera.init();

	// Join
	socket.emit('join_game', user);

	// Initial grid from server
	socket.on('grid_to_client', server_grid =>
	{
		update_grid_from_server(server_grid);
		render();
	});

	// Changes
	socket.on('change_cell_to_client', change =>
	{
		grid[change.i][change.j].color = change.color;
		render();
	});

	// Listeners

	window.addEventListener('click', e =>
	{
		let cell = get_cell_from_mouse(e.clientX, e.clientY);

		if (cell != null)
		{
			cell.color = user.color;

			// Set changes
			socket.emit('change_cell_to_server', { i: cell.i, j: cell.j, color: user.color });
		}

		render();
	});
}

window.onresize = function()
{
	let canvas = document.getElementById('canvas');

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	render();
}

/*
window.onload = function()
{
	const user_list = document.getElementById('user_list');
	const chat_form = document.getElementById('chat_form');
	const messages = document.getElementById('messages');
	const message_list = document.getElementById('message_list');

	// Get user list
	socket.on('user_list', users =>
	{
		user_list.innerHTML = `${users.map(user => `<li>${user.name}</li>`).join('')}`;
	});

	// Message from server
	socket.on('message', message =>
	{
		message_list.innerHTML += `<li>${message.username} : ${message.message}</li>`;
		messages.scrollTop = messages.scrollHeight;
	});

	// Log from server
	socket.on('log', message =>
	{
		message_list.innerHTML += `<li>(${message})</li>`;
		messages.scrollTop = messages.scrollHeight;
	});

	// Message submit
	chat_form.addEventListener('submit', e =>
	{
		e.preventDefault();

		// Get message text
		const message = e.target.elements.input.value;

		// Emit message to server
		socket.emit('chat_message', message);

		// Clear input
		e.target.elements.input.value = '';
		e.target.elements.input.focus();
	});
}*/
