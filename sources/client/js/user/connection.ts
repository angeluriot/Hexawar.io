import { Global } from '../properties.js';
import * as Cookie from './cookie.js';

const log_info = document.querySelector('.log_info') as HTMLSpanElement;

export function connection_events()
{
	// Register

	Global.socket.on('registered', (token: string, expiration: string, data: string) =>
	{
		Cookie.create_token_cookie(token, expiration);
		Global.connected = true;
		log_info.innerHTML = 'Logged<br>Data : ' + data;
	});

	Global.socket.on('register_error', (message: string) =>
	{
		console.log(message);
	});

	// Login

	Global.socket.on('logged', (token: string, expiration: string, data: string) =>
	{
		Cookie.create_token_cookie(token, expiration);
		Global.connected = true;
		log_info.innerHTML = 'Logged<br>Data : ' + data;
	});

	Global.socket.on('login_error', (message: string) =>
	{
		console.log(message);
	});

	// Logout

	Global.socket.on('unlogged', () =>
	{
		Cookie.erase_token_cookie();
		Global.connected = false;
		log_info.innerHTML = 'Not logged';
	});

	Global.socket.on('logout_error', (message: string) =>
	{
		console.log(message);
	});

	// Auto login

	Global.socket.on('auto_logged', (data: string) =>
	{
		Global.connected = true;
		log_info.innerHTML = 'Logged<br>Data : ' + data;
	});

	Global.socket.on('auto_login_error', () =>
	{
		Cookie.erase_token_cookie();
	});

	let token = Cookie.get_token();

	if (token != null)
		Global.socket.emit('auto_login', token);
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
