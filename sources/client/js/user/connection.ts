import { Global } from '../properties.js';
import * as Cookie from './cookie.js';
import * as PlayerCookie from '../player/cookie.js';
import * as Menu from './menu.js';
import { Player } from '../player/player.js';
import * as Color from '../utils/color.js';

export type UserData = {
	username: string,
	nickname: string,
	color: string,
	skin_id: number,
	skins: number[],
	xp_level: number,
	xp: number,
	games_played: number,
	conquered_lands: number,
	highest_score: number,
	total_score: number
};

function update_player_data()
{
	if (Global.user_data != null && Global.user_data.color != '')
	{
		Player.nickname = Global.user_data.nickname;
		Player.color = Global.user_data.color;
		Player.skin_id = Global.user_data.skin_id;

		const name_input = document.querySelector('.nickname_input') as HTMLInputElement;
		const color_picker = document.querySelector('.color_input') as HTMLInputElement;
		const color_div = document.querySelector('.color_div') as HTMLDivElement;
		const color_text = document.querySelector('.color_text') as HTMLSpanElement;

		name_input.value = Global.user_data.nickname;
		color_picker.value = Global.user_data.color;
		color_div.style.backgroundColor = Global.user_data.color;

		if (Color.is_color_dark(color_picker.value, Global.dark_color_limit))
			color_text.style.color = '#ffffff';
		else
			color_text.style.color = '#000000';

		PlayerCookie.create_cookie();
	}
}

export function connection_events()
{
	// Register

	Global.socket.on('registered', (token: string | null, expiration: string | null, data: UserData | null) =>
	{
		if (token != null && expiration != null && data != null)
			Cookie.create_token_cookie(token, expiration);

		Global.connected = true;
		Global.user_data = data;
		Menu.clear();
		Menu.set_visible('.account');
		update_player_data();
	});

	Global.socket.on('register_error', (message: string) =>
	{
		Menu.show_message('#ED2E2E', 'ERROR', message, '.register');
	});

	// Login

	Global.socket.on('logged', (token: string | null, expiration: string | null, data: UserData | null) =>
	{
		if (token != null && expiration != null && data != null)
			Cookie.create_token_cookie(token, expiration);

		Global.connected = true;
		Global.user_data = data;
		Menu.clear();
		Menu.set_visible('.account');
		update_player_data();
	});

	Global.socket.on('login_error', (message: string) =>
	{
		Menu.show_message('#ED2E2E', 'ERROR', message, '.login');
	});

	// Logout

	Global.socket.on('unlogged', () =>
	{
		Cookie.erase_token_cookie();
		Global.connected = false;
		Global.user_data = null;
		Menu.clear();
		Menu.set_visible('.register_login');
	});

	Global.socket.on('logout_error', (message: string) =>
	{
		Menu.show_message('#ED2E2E', 'ERROR', message, '.account');
	});

	// Auto login

	Global.socket.on('auto_logged', (data: UserData) =>
	{
		Global.connected = true;
		Global.user_data = data;
		Menu.clear();
		Menu.set_visible('.account');
		update_player_data();
	});

	Global.socket.on('auto_login_error', () =>
	{
		Cookie.erase_token_cookie();
		Menu.clear();
		Menu.set_visible('.register_login');
	});

	// Delete account

	Global.socket.on('account_deleted', () =>
	{
		Cookie.erase_token_cookie();
		Global.connected = false;
		Global.user_data = null;
		Menu.clear();
		Menu.show_message('#06d17d', 'SUCCESS', 'Your account has been deleted.', '.register_login');
	});

	Global.socket.on('delete_account_error', (message: string) =>
	{
		Menu.clear();
		Menu.show_message('#ED2E2E', 'ERROR', message, '.account');
	});

	let token = Cookie.get_token();

	if (token != null)
		Global.socket.emit('auto_login', token);
	else
	{
		Menu.clear();
		Menu.set_visible('.register_login');
	}
}

export function register(username: string, password: string)
{
	Global.socket.emit('register', username, password);
}

export function login(username: string, password: string)
{
	Global.socket.emit('login', username, password);
}

export function logout()
{
	Global.socket.emit('logout');
}

export function delete_account(password: string)
{
	Global.socket.emit('delete_account', password);
}
