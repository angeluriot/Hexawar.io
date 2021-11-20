// Render the canvas to the screen
function render()
{
	// Render the scene
	let canvas = document.getElementById('canvas');
	let context = canvas.getContext('2d');
	context.setTransform(1, 0, 0, 1, 0, 0);
	context.clearRect(0, 0, canvas.width, canvas.height);
	camera.apply(context);
	draw_grid(context);

	// Render the drag line
	if (dragging)
	{
		context.beginPath();
		context.lineTo(drag_from.x, drag_from.y);
		context.lineTo(drag_to.x, drag_to.y);
		context.strokeStyle = 'black';
		context.lineWidth = 0.1;
		context.lineCap = 'round';
		context.stroke();
	}
}
