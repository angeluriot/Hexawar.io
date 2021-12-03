import * as Grid from './grid/grid.js';
import { User } from './users/users.js';
import { Socket } from 'socket.io';
import { Global } from './properties.js';
import { Change } from './grid/cell.js';

// Handle a user joining the game
export function join_game(socket: Socket)
{
	// Send the grid
	socket.on('ask_for_grid', () =>
	{
		socket.emit('grid_to_client', Grid.get_grid());
	});

	// Register the user
	socket.on('join_game', (input_user: { nickname: string, color: string }) =>
	{
		let user = new User(socket.id, input_user.nickname, input_user.color, 0);

		// Add the user in the users list
		User.user_join(user);

		// Give it a random cell
		let spawn = Grid.get_random_cell();

		// Set the change
		const change = {
			i: spawn.i,
			j: spawn.j,
			color: user.color,
			user_id: user.id,
			nb_troops: Global.initial_nb_troops
		};

		Grid.set_cell(change);
		socket.emit('send_joining_data', socket.id, spawn);
	});
}

// The events of the game
export function game_events(socket: Socket)
{
	move(socket);
}

// Loops of the game
export function game_loop()
{
	troops_spawn();
}

// Handle a user leaving the game
export function leave_game(socket: Socket)
{
	// When client disconnects
	socket.on('disconnect', () =>
	{
		const user = User.user_leave(socket.id);

		if (user != null)
			Grid.remove_user_from_grid(user);
	});
}

// Handle user moves
export function move(socket: Socket)
{
	socket.on('move', (cells: { from: { i: number, j: number }, to: { i: number, j: number } }) =>
	{
		let cell_from = Grid.get_cell(cells.from.i, cells.from.j);
		let cell_to = Grid.get_cell(cells.to.i, cells.to.j);

		// If the move is valid
		if (cell_from != null && cell_to != null && cell_from.user_id == socket.id && Grid.are_neighbours(cells.from, cells.to) && cell_from.nb_troops > 1)
		{
			let change_from = {
				i: cells.from.i,
				j: cells.from.j,
				color: cell_from.color,
				user_id: cell_from.user_id,
				nb_troops: cell_from.nb_troops
			};

			let change_to = {
				i: cells.to.i,
				j: cells.to.j,
				color: cell_to.color,
				user_id: cell_to.user_id,
				nb_troops: cell_to.nb_troops
			};

			// If it's a simple move
			if (change_to.user_id == socket.id)
			{
				change_to.nb_troops += change_from.nb_troops - 1;
				change_from.nb_troops = 1;

				// If there are too many troops
				if (change_to.nb_troops > Global.troops_max)
				{
					change_from.nb_troops += change_to.nb_troops - Global.troops_max;
					change_to.nb_troops = Global.troops_max;
				}
			}

			// If it's an attack
			else
			{
				// If the attack succeeds
				if (change_from.nb_troops > change_to.nb_troops + 1)
				{
					change_to.nb_troops = change_from.nb_troops - change_to.nb_troops - 1;
					change_from.nb_troops = 1;
					change_to.color = change_from.color;
					change_to.user_id = change_from.user_id;
				}

				// If the attack fails
				else
				{
					change_to.nb_troops -= change_from.nb_troops - 1;
					change_from.nb_troops = 1;

					// Add one troop to the defender if it's cell is empty
					if (change_to.nb_troops == 0)
						change_to.nb_troops = 1;
				}
			}

			Grid.set_cells([change_from, change_to], true);
		}
	});
}

// Handle troops spawning
export function troops_spawn()
{
	var troops_spawn_interval = setInterval(() =>
	{
		let changes: Change[] = [];

		for (let _ = 0; _ < Global.spawn_per_sec; _++)
		{
			// Choose the cell
			let { i, j } = Grid.get_random_cell();
			let cell = Grid.get_cell(i, j);

			// If the cell isn't empty
			if (cell != null && cell.user_id != '')
			{
				// Add the change to the list
				let change = {
					i: i,
					j: j,
					color: cell.color,
					user_id:cell.user_id,
					nb_troops: cell.nb_troops
				};

				// Add troops if there are not enough
				if (change.nb_troops < Global.troops_spawn_max)
				{
					change.nb_troops++;
					changes.push(change);
				}

				// Remove troops if there are too many
				else if (change.nb_troops > Global.troops_spawn_max)
				{
					change.nb_troops--;
					changes.push(change);
				}
			}
		}

		Grid.set_cells(changes, false);
	}, 1000);
}
