// @ts-ignore
import { io } from 'https://cdn.socket.io/4.3.0/socket.io.esm.min.js';
import * as Game from './game.js';
import * as Connection from './players/connection.js';
import { render } from './renderer/renderer.js';
import { Global } from './properties.js';

Global.socket = io();

// Main function
window.onload = function()
{
	Game.load_background();
	Connection.form_events();
}

// On window resize
window.onresize = function()
{
	let canvas = document.getElementById('canvas') as HTMLCanvasElement;

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	render();
}
