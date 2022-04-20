import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Player } from '../players/player.js';
import { ClientSocket, Global, ServerSocket } from '../properties.js';
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
	player.socket.on(ClientSocket.REGISTER, (username: string, password: string) =>
	{
		if(!username)
			return;

		if(typeof username != 'string')
			return;

		if(!password)
			return;

		if(typeof password != 'string')
			return;

		username = username.trim();

		if (player.is_playing())
		{
			player.socket.emit(ServerSocket.REGISTER_ERROR, "You cannot register while playing.");
			return;
		}

		if (player.user != null)
		{
			player.socket.emit(ServerSocket.REGISTER_ERROR, "You are already logged in.");
			return;
		}

		if (username.length < 4 || username.length > 16 || !is_ascii(username))
		{
			player.socket.emit(ServerSocket.REGISTER_ERROR, "Invalid username.");
			return;
		}

		if (password.length < 4 || password.length > 32 || !is_ascii(password))
		{
			player.socket.emit(ServerSocket.REGISTER_ERROR, "Invalid password.");
			return;
		}

		bcrypt.hash(password, 11, (hash_error, hash) =>
		{
			if (hash_error != undefined)
			{
				player.socket.emit(ServerSocket.REGISTER_ERROR, 'Your password could not be hashed.');
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
						player.socket.emit(ServerSocket.REGISTERED, null, null, null);
						return;
					}
					console.log('[' + new Date().toTimeString().split(' ')[0] + '] Account created (' + player.socket.conn.remoteAddress + ') : ' + username);
					player.socket.emit(ServerSocket.REGISTERED, token, date.toUTCString(), Users.get_data(user));
				});
			}, (error) =>
			{
				if (error.code == 11000)
					player.socket.emit(ServerSocket.REGISTER_ERROR, 'This username is already taken.');
				else
					player.socket.emit(ServerSocket.REGISTER_ERROR, 'Your account could not be created.');
			});
		});
	});
}

function login(player: Player)
{
	player.socket.on(ClientSocket.LOGIN, (username: string, password: string) =>
	{
		if(!username)
			return;

		if(typeof username != 'string')
			return;
		
		if(!password)
			return;

		if(typeof password != 'string')
			return;

		username = username.trim();

		if (player.is_playing())
		{
			player.socket.emit(ServerSocket.LOGIN_ERROR, "You cannot login while playing.");
			return;
		}

		if (player.user != null)
		{
			player.socket.emit(ServerSocket.LOGIN_ERROR, "You are already logged in.");
			return;
		}

		if (username.length < 4 || username.length > 16 || !is_ascii(username))
		{
			player.socket.emit(ServerSocket.LOGIN_ERROR, "Invalid username.");
			return;
		}

		if (password.length < 4 || password.length > 32 || !is_ascii(password))
		{
			player.socket.emit(ServerSocket.LOGIN_ERROR, "Invalid password.");
			return;
		}

		Users.get_user(username, (user) =>
		{
			bcrypt.compare(password, user.hashed_password, (hash_error, result) =>
			{
				if (hash_error != undefined || !result)
				{
					player.socket.emit(ServerSocket.LOGIN_ERROR, 'Wrong password.');
					return;
				}

				player.user = user;

				let date = new Date();
				date.setDate(date.getDate() + Global.token_nb_days);

				jwt.sign({ data: username }, process.env.TOKEN_SECRET as any, { expiresIn: Global.token_nb_days.toString() + ' days' }, (token_error, token) =>
				{
					if (token_error != null)
					{
						player.socket.emit(ServerSocket.LOGGED, null, null, null);
						return;
					}
					console.log('[' + new Date().toTimeString().split(' ')[0] + '] User logged (' + player.socket.conn.remoteAddress + ') : ' + player.user?.nickname);
					player.socket.emit(ServerSocket.LOGGED, token, date.toUTCString(), Users.get_data(user));
				});
			});
		}, (error) =>
		{
			player.socket.emit(ServerSocket.LOGIN_ERROR, "This user does not exist.");
		});
	});
}

function logout(player: Player)
{
	player.socket.on(ClientSocket.LOGOUT, () =>
	{
		if (player.is_playing())
		{
			player.socket.emit(ServerSocket.LOGOUT_ERROR, "You cannot logout while playing.");
			return;
		}

		if (player.user == null)
		{
			player.socket.emit(ServerSocket.LOGOUT_ERROR, "You are already logged out.");
			return;
		}

		console.log('[' + new Date().toTimeString().split(' ')[0] + '] User unlogged (' + player.socket.conn.remoteAddress + ') : ' + player.user?.nickname);
		player.socket.emit(ServerSocket.UNLOGGED);
		player.user = null;
	});
}

function auto_login(player: Player)
{
	player.socket.on(ClientSocket.AUTO_LOGIN, (token: string) =>
	{

		if(!token)
			return;

		if(typeof token != 'string')
			return;

		if (player.is_playing())
		{
			player.socket.emit(ServerSocket.AUTO_LOGIN_ERROR);
			return;
		}

		if (player.user != null)
		{
			player.socket.emit(ServerSocket.AUTO_LOGIN_ERROR);
			return;
		}

		jwt.verify(token, process.env.TOKEN_SECRET as any, (err: any, decoded: any) =>
		{
			if (err != null)
			{
				player.socket.emit(ServerSocket.AUTO_LOGIN_ERROR);
				return;
			}

			Users.get_user(decoded.data, (user) =>
			{
				console.log('[' + new Date().toTimeString().split(' ')[0] + '] User logged (' + player.socket.conn.remoteAddress + ') : ' + player.user?.nickname);
				player.user = user;
				player.socket.emit(ServerSocket.AUTO_LOGGED, Users.get_data(user));
			},
			(error) =>
			{
				player.socket.emit(ServerSocket.AUTO_LOGIN_ERROR);
			});
		});
	});
}

function delete_account(player: Player)
{
	player.socket.on(ClientSocket.DELETE_ACCOUNT, (password : string) =>
	{
		if(!password)
			return;

		if(typeof password != 'string')
			return;

		if (player.is_playing())
		{
			player.socket.emit(ServerSocket.DELETE_ACCOUNT_ERROR, "You cannot delete your account while playing.");
			return;
		}

		if (player.user == null)
		{
			player.socket.emit(ServerSocket.DELETE_ACCOUNT_ERROR, "You are not logged in.");
			return;
		}

		if (password.length < 4 || password.length > 32 || !is_ascii(password))
		{
			player.socket.emit(ServerSocket.DELETE_ACCOUNT_ERROR, "Invalid password.");
			return;
		}

		Users.get_user(player.user.username, (user) =>
		{
			bcrypt.compare(password, user.hashed_password, (hash_error, result) =>
			{
				if (player.user == null)
				{
					player.socket.emit(ServerSocket.DELETE_ACCOUNT_ERROR, "You are not logged in.");
					return;
				}

				if (hash_error != undefined || !result)
				{
					player.socket.emit(ServerSocket.DELETE_ACCOUNT_ERROR, 'Wrong password.');
					return;
				}

				Users.remove_user(player.user.username, (user) =>
				{
					console.log('[' + new Date().toTimeString().split(' ')[0] + '] User deleted account (' + player.socket.conn.remoteAddress + ') : ' + player.user?.nickname);
					player.socket.emit(ServerSocket.ACCOUNT_DELETED);
					player.user = null;
				}, (error) =>
				{
					player.socket.emit(ServerSocket.DELETE_ACCOUNT_ERROR, 'Your account could not be deleted.');
				});
			});
		}, (error) =>
		{
			player.socket.emit(ServerSocket.DELETE_ACCOUNT_ERROR, "This user does not exist.");
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
