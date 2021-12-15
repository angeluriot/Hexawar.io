import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Player } from '../players/player.js';
import { Global } from '../properties.js';
import * as User from './users.js'

function register(global_user: { player: Player, user: any })
{
	global_user.player.socket.on('register', (username: string, password: string) =>
	{
		if (global_user.player.playing)
		{
			global_user.player.socket.emit('register_error', "You are playing :(");
			return;
		}

		bcrypt.hash(password, 11, (hash_error, hash) =>
		{
			User.add_user(username, hash, (user) =>
			{
				global_user.user = user;

				let date = new Date();
				date.setDate(date.getDate() + Global.token_nb_days);

				jwt.sign({ data: username }, process.env.TOKEN_SECRET as any, { expiresIn: Global.token_nb_days.toString() + ' days' }, (token_error, token) =>
				{
					global_user.player.socket.emit('registered', token, date.toUTCString(), user.data);
				});
			});
		});
	});
}

function login(global_user: { player: Player, user: any })
{
	global_user.player.socket.on('login', (username: string, password: string) =>
	{
		if (global_user.player.playing)
		{
			global_user.player.socket.emit('login_error', "You are playing :(");
			return;
		}

		User.get_user(username, (user) =>
		{
			bcrypt.compare(password, user.hashed_password, (hash_error, result) =>
			{
				if (result)
				{
					global_user.user = user;

					let date = new Date();
					date.setDate(date.getDate() + Global.token_nb_days);

					jwt.sign({ data: username }, process.env.TOKEN_SECRET as any, { expiresIn: Global.token_nb_days.toString() + ' days' }, (token_error, token) =>
					{
						global_user.player.socket.emit('logged', token, date.toUTCString(), user.data);
					});
				}
			});
		});
	});
}

function logout(global_user: { player: Player, user: any })
{
	global_user.player.socket.on('logout', () =>
	{
		if (global_user.player.playing)
		{
			global_user.player.socket.emit('logout_error', "You are playing :(");
			return;
		}

		global_user.player.socket.emit('unlogged');
		global_user.user = null;
	});
}

function auto_login(global_user: { player: Player, user: any })
{
	global_user.player.socket.on('auto_login', (token: string) =>
	{
		jwt.verify(token, process.env.TOKEN_SECRET as any, (err: any, decoded: any) =>
		{
			User.get_user(decoded.data, (user) =>
			{
				global_user.user = user;
				global_user.player.socket.emit('auto_logged', user.data);
			});
		});
	});
}

export function connection_events(user: { player: Player, user: any })
{
	register(user);
	login(user);
	logout(user);
	auto_login(user);
}
