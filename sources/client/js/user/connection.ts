import { Global } from '../properties.js';
import * as Cookie from './cookie.js';
import * as Menu from './menu.js';

const log_info = document.querySelector('.account .log_info') as HTMLSpanElement;

export function connection_events()
{
	// Register

	Global.socket.on('registered', (token: string, expiration: string, data: string) =>
	{
		Cookie.create_token_cookie(token, expiration);
		Global.connected = true;
		log_info.innerHTML = 'Logged<br>Data : ' + data;
		Menu.set_visible('.account');
	});

	Global.socket.on('register_error', (message: string) =>
	{
		console.log(message);
		Menu.set_visible('.register');
	});

	// Login

	Global.socket.on('logged', (token: string, expiration: string, data: string) =>
	{
		Cookie.create_token_cookie(token, expiration);
		Global.connected = true;
		log_info.innerHTML = 'Logged<br>Data : ' + data;
		Menu.set_visible('.account');
	});

	Global.socket.on('login_error', (message: string) =>
	{
		console.log(message);
		Menu.set_visible('.login');
	});

	// Logout

	Global.socket.on('unlogged', () =>
	{
		Cookie.erase_token_cookie();
		Global.connected = false;
		log_info.innerHTML = 'Not logged';
		Menu.set_visible('.register_login');
	});

	Global.socket.on('logout_error', (message: string) =>
	{
		console.log(message);
		Menu.set_visible('.account');
	});

	// Auto login

	Global.socket.on('auto_logged', (data: string) =>
	{
		Global.connected = true;
		log_info.innerHTML = 'Logged<br>Data : ' + data;
		Menu.set_visible('.account');
	});

	Global.socket.on('auto_login_error', () =>
	{
		Cookie.erase_token_cookie();
		Menu.set_visible('.register_login');
	});

	// Delete account

	Global.socket.on('account_deleted', () =>
	{
		Cookie.erase_token_cookie();
		Global.connected = false;
		log_info.innerHTML = 'Not logged';
		Menu.set_visible('.register_login');
	});

	Global.socket.on('delete_account_error', (message: string) =>
	{
		console.log(message);
		Menu.set_visible('.account');
	});

	let token = Cookie.get_token();

	if (token != null)
		Global.socket.emit('auto_login', token);
	else
		Menu.set_visible('.register_login');
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

export function delete_account()
{
	Global.socket.emit('delete_account');
}
