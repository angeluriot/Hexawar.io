const socket = io();

// Main function
window.onload = function()
{
	load_background(socket);
	color_picker_events();
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
