const socket = io();

// Main function
window.onload = function()
{
	load_background(socket);
	form_events(socket);
}

// On window resize
window.onresize = function()
{
	let canvas = document.getElementById('canvas');

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	render();
}
