import { Global } from '../properties.js';
import * as Cookie from './cookie.js';
import * as PlayerCookie from '../player/cookie.js';
import * as Menu from './menu.js';
import { Player } from '../player/player.js';
import * as Color from '../utils/color.js';
import * as Shop from '../shop/menus.js';
import { ClientSocket, ServerSocket } from '../properties.js';

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
		Player.set_skin(Global.user_data.skin_id);

		const name_input = document.querySelector('.nickname_input') as HTMLInputElement;
		const color_picker = document.querySelector('.color_input') as HTMLInputElement;
		const color_div = document.querySelector('.color_div') as HTMLDivElement;
		const color_text = document.querySelector('.color_text') as HTMLSpanElement;

		name_input.value = Global.user_data.nickname;
		color_picker.value = Global.user_data.color;
		color_div.style.backgroundColor = Global.user_data.color;

		if (Color.is_color_dark(color_picker.value))
			color_text.style.color = '#ffffff';
		else
			color_text.style.color = '#000000';

		PlayerCookie.create_cookie();
	}
}

export function connection_events()
{
	// Register

	Global.socket.on(ServerSocket.REGISTERED, (token: string | null, expiration: string | null, data: UserData | null) =>
	{
		if (token != null && expiration != null && data != null)
			Cookie.create_token_cookie(token, expiration);

		Global.connected = true;
		Global.user_data = data;
		Menu.clear();
		Menu.set_visible('.account');
		update_player_data();
	});

	Global.socket.on(ServerSocket.REGISTER_ERROR, (message: string) =>
	{
		Menu.show_message('#ED2E2E', 'ERROR', message, '.register');
	});

	// Login

	Global.socket.on(ServerSocket.LOGGED, (token: string | null, expiration: string | null, data: UserData | null) =>
	{
		if (token != null && expiration != null && data != null)
			Cookie.create_token_cookie(token, expiration);

		Global.connected = true;
		Global.user_data = data;
		Menu.clear();
		Menu.set_visible('.account');
		Shop.update_skin_connection();
		update_player_data();
	});

	Global.socket.on(ServerSocket.LOGIN_ERROR, (message: string) =>
	{
		Menu.show_message('#ED2E2E', 'ERROR', message, '.login');
	});

	// Logout

	Global.socket.on(ServerSocket.UNLOGGED, () =>
	{
		Cookie.erase_token_cookie();
		Global.connected = false;
		Global.user_data = null;
		Menu.clear();
		Menu.set_visible('.register_login');
		Player.set_skin(-1);
		Shop.update_skin_connection();
	});

	Global.socket.on(ServerSocket.LOGOUT_ERROR, (message: string) =>
	{
		Menu.show_message('#ED2E2E', 'ERROR', message, '.account');
	});

	// Auto login

	Global.socket.on(ServerSocket.AUTO_LOGGED, (data: UserData) =>
	{
		Global.connected = true;
		Global.user_data = data;
		Menu.clear();
		Menu.set_visible('.account');
		Shop.update_skin_connection();
		update_player_data();
	});

	Global.socket.on(ServerSocket.AUTO_LOGIN_ERROR, () =>
	{
		Cookie.erase_token_cookie();
		Menu.clear();
		Menu.set_visible('.register_login');
	});

	// Delete account

	Global.socket.on(ServerSocket.ACCOUNT_DELETED, () =>
	{
		Cookie.erase_token_cookie();
		Global.connected = false;
		Global.user_data = null;
		Menu.clear();
		Menu.show_message('#06d17d', 'SUCCESS', 'Your account has been deleted.', '.register_login');
		Player.set_skin(-1);
		Shop.update_skin_connection();
	});

	Global.socket.on(ServerSocket.DELETE_ACCOUNT_ERROR, (message: string) =>
	{
		Menu.clear();
		Menu.show_message('#ED2E2E', 'ERROR', message, '.account');
	});

	let token = Cookie.get_token();

	if (token != null)
		Global.socket.emit(ClientSocket.AUTO_LOGIN, token);
	else
	{
		Menu.clear();
		Menu.set_visible('.register_login');
	}
}

export function register(username: string, password: string)
{
	Global.socket.emit(ClientSocket.REGISTER, username, password);
}

export function login(username: string, password: string)
{
	Global.socket.emit(ClientSocket.LOGIN, username, password);
}

export function logout()
{
	Global.socket.emit(ClientSocket.LOGOUT);
}

export function delete_account(password: string)
{
	Global.socket.emit(ClientSocket.DELETE_ACCOUNT, password);
}
