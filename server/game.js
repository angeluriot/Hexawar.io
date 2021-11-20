const { user_join, get_user, user_leave, get_user_list } = require('./users/users.js');
const { create_grid, set_cell, get_cell, get_grid, get_random_cell, are_neighbours, remove_user_from_grid } = require('./grid/grid.js');

// Properties
const initial_nb_troops = 10;
const troops_spawn_max = 10;
const troops_max = 999;
const spawn_time = 10;

// Handle a user joining the game
function join_game(socket, io)
{
	// Send the grid
	socket.on('ask_for_grid', () =>
	{
		socket.emit('grid_to_client', get_grid());
	});

	// Register the user
	socket.on('join_game', user =>
	{
		user.id = socket.id;
		user_join(user);

		// Give it a random cell
		let spawn = get_random_cell();

		// Send the change to the clients
		const change = {
			i: spawn.i,
			j: spawn.j,
			color: user.color,
			user_id: user.id,
			nb_troops: initial_nb_troops
		};

		io.emit('change', change);
		set_cell(change);
		socket.emit('send_joining_data', { socket_id: socket.id, spawn: spawn });
	});
}

// The events of the game
function game_events(socket, io)
{
	move(socket, io);
}

// Loops of the game
function game_loop(io)
{
	troops_spawn(io);
}

// Handle a user leaving the game
function leave_game(socket, io)
{
	// When client disconnects
	socket.on('disconnect', () =>
	{
		const user = user_leave(socket.id);

		if (user != null)
			remove_user_from_grid(user, io);
	});
}

// Handle user moves
function move(socket, io)
{
	socket.on('move', cells =>
	{
		let cell_from = get_cell(cells.from.i, cells.from.j);
		let cell_to = get_cell(cells.to.i, cells.to.j);

		// If the move is valid
		if (cell_from != null && cell_to != null && are_neighbours(cells.from, cells.to))
		{
			// If it's a simple move
			if (cell_from.user_id == cell_to.user_id)
			{
				cell_to.nb_troops += cell_from.nb_troops - 1;
				cell_from.nb_troops = 1;

				// If there are too many troops
				if (cell_to.nb_troops > troops_max)
				{
					cell_from.nb_troops += cell_to.nb_troops - troops_max;
					cell_to.nb_troops = troops_max;
				}
			}

			// If it's an attack
			else
			{
				// If the attack succeeds
				if (cell_from.nb_troops > cell_to.nb_troops + 1)
				{
					cell_to.nb_troops = cell_from.nb_troops - cell_to.nb_troops - 1;
					cell_from.nb_troops = 1;
					cell_to.color = cell_from.color;
					cell_to.user_id = cell_from.user_id;
				}

				// If the attack fails
				else
				{
					cell_to.nb_troops -= cell_from.nb_troops - 1;
					cell_from.nb_troops = 1;

					// Add one troop to the defender if it's cell is empty
					if (cell_to.nb_troops == 0)
						cell_to.nb_troops = 1;
				}
			}

			// Send the changes to the clients
			const change_1 = {
				i: cells.from.i,
				j: cells.from.j,
				color: cell_from.color,
				user_id: cell_from.user_id,
				nb_troops: cell_from.nb_troops
			};

			const change_2 = {
				i: cells.to.i,
				j: cells.to.j,
				color: cell_to.color,
				user_id: cell_to.user_id,
				nb_troops: cell_to.nb_troops
			};

			io.emit('changes', [change_1, change_2]);
		}
	});
}

// Handle troops spawning
function troops_spawn(io)
{
	var troops_spawn_interval = setInterval(() =>
	{
		// Choose the cell
		let { i, j } = get_random_cell();
		let cell = get_cell(i, j);

		// If the cell isn't empty
		if (cell.user_id != '' && cell.nb_troops < troops_spawn_max)
		{
			cell.nb_troops++;

			// Send the change to the clients
			const change = {
				i: i,
				j: j,
				color: cell.color,
				user_id:cell.user_id,
				nb_troops: cell.nb_troops
			};

			io.emit('change', change);
		}
	}, spawn_time);
}

module.exports =
{
	join_game,
	game_events,
	game_loop,
	leave_game
}
