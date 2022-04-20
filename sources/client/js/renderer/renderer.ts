import { Global } from '../properties.js';
import * as Grid from '../grid/grid.js';
import { Camera } from './camera.js';
import { PlayerCells } from '../grid/players.js';
import { Player } from '../player/player.js';

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

	// Force Roboto loading
	context.font = '0.75px Roboto_bold';
	context.fillStyle = '#000000';
	context.textAlign = 'center';
	context.fillText('load', -10000, -10000);

	if (Player.playing && Global.cell_from != null && Global.cell_from.player_id != Player.id)
		Global.cell_from = null;

	// Update player cells and draw grid
	Grid.update_player_cells_and_draw_grid(context);

	// Draw player cells
	PlayerCells.draw_players(context);

	// Render the drag arrow
	if (Global.show_drag)
	{
		let arrow_length = Math.sqrt((Global.mouse_pos.x - Global.drag_from.x) ** 2 + (Global.mouse_pos.y - Global.drag_from.y) ** 2);
		let arrow_angle = Math.atan2(Global.mouse_pos.y - Global.drag_from.y, Global.mouse_pos.x - Global.drag_from.x);
		let arrow_shift = 0.7;

		if ((arrow_angle > Math.PI / 2 && arrow_angle < Math.PI) || (arrow_angle < -Math.PI / 2 && arrow_angle > -Math.PI))
		{
			context.translate(Global.drag_from.x - Math.sin(arrow_angle) * arrow_shift, Global.drag_from.y + Math.cos(arrow_angle) * arrow_shift);
			context.rotate(arrow_angle);
			context.rotate(Math.PI);
			context.scale(-1, 1);
		}

		else
		{
			context.translate(Global.drag_from.x + Math.sin(arrow_angle) * arrow_shift, Global.drag_from.y - Math.cos(arrow_angle) * arrow_shift);
			context.rotate(arrow_angle);
		}

		context.drawImage(Global.arrow, 0, 0, arrow_length, 1);
	}
}
