// @ts-ignore
import { io } from 'https://cdn.socket.io/4.3.0/socket.io.esm.min.js';
import * as Game from './game.js';
import * as PlayerConnection from './player/connection.js';
import * as UserConnection from './user/connection.js';
import * as Login from './user/menu.js';
import { render } from './renderer/renderer.js';
import { Global } from './properties.js';

Global.socket = io();

// Main function
window.onload = function()
{
	Login.user_menu_events();
	UserConnection.connection_events();
	Game.load_background();
	PlayerConnection.form_events();
}

// On window resize
window.onresize = function()
{
	let canvas = document.getElementById('canvas') as HTMLCanvasElement;

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	render();
}
