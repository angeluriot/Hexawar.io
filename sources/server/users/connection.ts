import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Player } from '../players/player.js';
import { Global } from '../properties.js';
import * as Users from './users.js'

function is_ascii(input: string)
{
	for (let i = 0; i < input.length; i++)
		if (input.charCodeAt(i) < 32 || input.charCodeAt(i) > 126)
			return false;

	return !input.includes('\"') && !input.includes('\'') && !input.includes('\`');
}

function register(player: Player)
{
	player.socket.on('register', (username: string, password: string) =>
	{
		username = username.trim();

		if (player.playing)
		{
			player.socket.emit('register_error', "You cannot register while playing.");
			return;
		}

		if (player.user != null)
		{
			player.socket.emit('register_error', "You are already logged in.");
			return;
		}

		if (username.length < 4 || username.length > 16 || !is_ascii(username))
		{
			player.socket.emit('register_error', "Invalid username.");
			return;
		}

		if (password.length < 4 || password.length > 32 || !is_ascii(password))
		{
			player.socket.emit('register_error', "Invalid password.");
			return;
		}

		bcrypt.hash(password, 11, (hash_error, hash) =>
		{
			if (hash_error != undefined)
			{
				player.socket.emit('register_error', 'Your password could not be hashed.');
				return;
			}

			Users.add_user(username, hash, (user) =>
			{
				player.user = user;

				let date = new Date();
				date.setDate(date.getDate() + Global.token_nb_days);

				jwt.sign({ data: username }, process.env.TOKEN_SECRET as any, { expiresIn: Global.token_nb_days.toString() + ' days' }, (token_error, token) =>
				{
					if (token_error != null)
					{
						player.socket.emit('registered', null, null, null);
						return;
					}

					player.socket.emit('registered', token, date.toUTCString(), Users.get_data(user));
				});
			}, (error) =>
			{
				if (error.code == 11000)
					player.socket.emit('register_error', 'This username is already taken.');
				else
					player.socket.emit('register_error', 'Your account could not be created.');
			});
		});
	});
}

function login(player: Player)
{
	player.socket.on('login', (username: string, password: string) =>
	{
		username = username.trim();

		if (player.playing)
		{
			player.socket.emit('login_error', "You cannot login while playing.");
			return;
		}

		if (player.user != null)
		{
			player.socket.emit('login_error', "You are already logged in.");
			return;
		}

		if (username.length < 4 || username.length > 16 || !is_ascii(username))
		{
			player.socket.emit('login_error', "Invalid username.");
			return;
		}

		if (password.length < 4 || password.length > 32 || !is_ascii(password))
		{
			player.socket.emit('login_error', "Invalid password.");
			return;
		}

		Users.get_user(username, (user) =>
		{
			bcrypt.compare(password, user.hashed_password, (hash_error, result) =>
			{
				if (hash_error != undefined || !result)
				{
					player.socket.emit('login_error', 'Wrong password.');
					return;
				}

				player.user = user;

				let date = new Date();
				date.setDate(date.getDate() + Global.token_nb_days);

				jwt.sign({ data: username }, process.env.TOKEN_SECRET as any, { expiresIn: Global.token_nb_days.toString() + ' days' }, (token_error, token) =>
				{
					if (token_error != null)
					{
						player.socket.emit('logged', null, null, null);
						return;
					}

					player.socket.emit('logged', token, date.toUTCString(), Users.get_data(user));
				});
			});
		}, (error) =>
		{
			player.socket.emit('login_error', "This user does not exist.");
		});
	});
}

function logout(player: Player)
{
	player.socket.on('logout', () =>
	{
		if (player.playing)
		{
			player.socket.emit('logout_error', "You cannot logout while playing.");
			return;
		}

		if (player.user == null)
		{
			player.socket.emit('logout_error', "You are already logged out.");
			return;
		}

		player.socket.emit('unlogged');
		player.user = null;
	});
}

function auto_login(player: Player)
{
	player.socket.on('auto_login', (token: string) =>
	{
		if (player.playing)
		{
			player.socket.emit('auto_login_error');
			return;
		}

		if (player.user != null)
		{
			player.socket.emit('auto_login_error');
			return;
		}

		jwt.verify(token, process.env.TOKEN_SECRET as any, (err: any, decoded: any) =>
		{
			if (err != null)
			{
				player.socket.emit('auto_login_error');
				return;
			}

			Users.get_user(decoded.data, (user) =>
			{
				player.user = user;
				player.socket.emit('auto_logged', Users.get_data(user));
			},
			(error) =>
			{
				player.socket.emit('auto_login_error');
			});
		});
	});
}

function delete_account(player: Player)
{
	player.socket.on('delete_account', (password) =>
	{
		if (player.playing)
		{
			player.socket.emit('delete_account_error', "You cannot delete your account while playing.");
			return;
		}

		if (player.user == null)
		{
			player.socket.emit('delete_account_error', "You are not logged in.");
			return;
		}

		if (password.length < 4 || password.length > 32 || !is_ascii(password))
		{
			player.socket.emit('delete_account_error', "Invalid password.");
			return;
		}

		Users.get_user(player.user.username, (user) =>
		{
			bcrypt.compare(password, user.hashed_password, (hash_error, result) =>
			{
				if (player.user == null)
				{
					player.socket.emit('delete_account_error', "You are not logged in.");
					return;
				}

				if (hash_error != undefined || !result)
				{
					player.socket.emit('delete_account_error', 'Wrong password.');
					return;
				}

				Users.remove_user(player.user.username, (user) =>
				{
					player.socket.emit('account_deleted');
					player.user = null;
				}, (error) =>
				{
					player.socket.emit('delete_account_error', 'Your account could not be deleted.');
				});
			});
		}, (error) =>
		{
			player.socket.emit('delete_account_error', "This user does not exist.");
		});
	});
}

export function connection_events(player: Player)
{
	register(player);
	login(player);
	logout(player);
	auto_login(player);
	delete_account(player);
}
