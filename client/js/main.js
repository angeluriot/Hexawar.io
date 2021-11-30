import { io } from 'https://cdn.socket.io/4.3.0/socket.io.esm.min.js';
import * as Game from "./game.js";
import * as Connection from "./user/connection.js";
import { render } from './renderer/renderer.js';
const socket = io();
window.onload = function () {
    Game.load_background(socket);
    Connection.form_events(socket);
};
window.onresize = function () {
    let canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    render();
};
