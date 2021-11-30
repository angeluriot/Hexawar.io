import { Global } from '../properties.js';
import * as Grid from '../grid/grid.js';
import { Camera } from './camera.js';

// Render the canvas to the screen
export function render()
{
	// Render the scene
	let canvas = document.getElementById('canvas') as HTMLCanvasElement;
	let context = canvas.getContext('2d') as CanvasRenderingContext2D;
	context.setTransform(1, 0, 0, 1, 0, 0);
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = Global.background_color;
	context.fillRect(0, 0, canvas.width, canvas.height);
	Camera.apply(context);
	Grid.draw_grid(context);

	// Render the drag line
	if (Global.show_drag)
	{
		context.beginPath();
		context.lineTo(Global.drag_from.x, Global.drag_from.y);
		context.lineTo(Global.drag_to.x, Global.drag_to.y);
		context.strokeStyle = 'black';
		context.lineWidth = 0.1;
		context.lineCap = 'round';
		context.stroke();
	}
}
