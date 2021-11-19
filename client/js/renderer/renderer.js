function render()
{
	let canvas = document.getElementById('canvas');
	let context = canvas.getContext('2d');
	context.setTransform(1, 0, 0, 1, 0, 0);
	context.clearRect(0, 0, canvas.width, canvas.height);
	camera.apply(context);
	draw_grid(context);
}
