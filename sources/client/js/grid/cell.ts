import { Global } from '../properties.js';
import * as Color from '../utils/color.js';
import { Player } from '../player/player.js';

export type Change = {
	i: number,
	j: number,
	color: string,
	skin_id: number,
	player_id: string,
	nb_troops: number
};

// A class that represents a cell of the grid
export class Cell
{
	i: number;
	j: number;
	x: number;
	y: number;
	color: string;
	skin_id: number;
	player_id: string;
	nb_troops: number;

	// Contruct a cell
	constructor(i: number, j: number, x: number, y: number, color: string, skin_id: number, player_id: string, nb_troops: number)
	{
		this.i = i;
		this.j = j;
		this.x = x;
		this.y = y;
		this.color = color;
		this.skin_id = skin_id;
		this.player_id = player_id;
		this.nb_troops = nb_troops;
	}

	// Draw the cell on the screen
	draw(context: CanvasRenderingContext2D)
	{
		// Draw the shape
		context.beginPath();

		for (let i = 0; i < 6; i++)
			context.lineTo(this.x + Math.cos(Global.hexagon_angle * i), this.y + Math.sin(Global.hexagon_angle * i));

		context.closePath();
		context.fillStyle = this.color;

		if (this == Global.cell_from)
			context.fillStyle = Color.change_color(this.color, Global.dark_color_limit, 0.2);

		context.fill();
		context.strokeStyle = Global.border_color;
		context.lineWidth = 0.1;
		context.lineCap = 'round';

		if (this.player_id != '')
			context.strokeStyle = Color.change_color(this.color, Global.dark_color_limit, 0.2);

		context.stroke();

		// Draw the number of troops
		if (this.nb_troops > 0)
		{
			context.font = '0.75px Roboto_bold';

			if (Player.playing && this.player_id == Player.id)
				context.fillStyle = Color.is_color_dark(this.color, Global.dark_color_limit) ? 'white' : 'black';

			else
				context.fillStyle = Color.change_color(this.color, Global.dark_color_limit, 0.4);

			context.textAlign = 'center';
			context.fillText(this.nb_troops.toString(), this.x, this.y + 0.26);
		}
	}
}
