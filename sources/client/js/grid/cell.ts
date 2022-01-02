import { Global } from '../properties.js';
import * as Color from '../utils/color.js';
import { Player } from '../player/player.js';
import * as Grid from './grid.js';

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
	draw_empty(context: CanvasRenderingContext2D)
	{
		// Draw the shape
		context.beginPath();

		for (let i = 0; i < 6; i++)
			context.lineTo(this.x + Math.cos(Global.hexagon_angle * i), this.y + Math.sin(Global.hexagon_angle * i));

		context.closePath();
		context.fillStyle = 'white';
		context.fill();

		context.strokeStyle = Global.border_color;
		context.lineWidth = 0.1;
		context.lineCap = 'round';
		context.lineJoin = 'round';
		context.stroke();
	}

	create_clip(context: CanvasRenderingContext2D)
	{
		context.moveTo(this.x + 1, this.y);

		for (let i = 1; i < 6; i++)
			context.lineTo(this.x + Math.cos(Global.hexagon_angle * i), this.y + Math.sin(Global.hexagon_angle * i));

		context.closePath();
	}

	draw_inside(context: CanvasRenderingContext2D)
	{
		context.beginPath();

		for (let i = 0; i < 6; i++)
			context.lineTo(this.x + Math.cos(Global.hexagon_angle * i), this.y + Math.sin(Global.hexagon_angle * i));

		context.closePath();

		if (this == Global.cell_from)
		{
			context.fillStyle = Color.is_color_dark(this.color) || this.skin_id != -1 ? 'white' : 'black';
			context.fill();
		}

		context.lineWidth = 0.1;
		context.lineCap = 'round';
		context.lineJoin = 'round';
		context.strokeStyle = this.skin_id == -1 && Color.is_color_dark(this.color) ? 'white' : 'black';
		context.stroke();
	}

	draw_number(context: CanvasRenderingContext2D)
	{
		context.font = '0.75px Roboto_bold';
		context.textAlign = 'center';

		if (this.skin_id == -1)
			context.fillStyle = Color.is_color_dark(this.color) ? 'white' : 'black';

		else
		{
			context.fillStyle = 'white';
			context.strokeStyle = this.skin_id == -1 ? 'black' : Global.skin_colors[this.skin_id];
			context.lineWidth = 0.14;
			context.lineCap = 'round';
			context.lineJoin = 'round';
			context.strokeText(this.nb_troops.toString(), this.x, this.y + 0.26);
		}

		context.fillText(this.nb_troops.toString(), this.x, this.y + 0.26);
	}

	draw_border(context: CanvasRenderingContext2D, color: string, is_main: boolean)
	{
		let neighbours = Grid.get_all_neighbours(this);
		let border_id_list: number[] = [];

		for (let i = 0; i < neighbours.length; i++)
		{
			let neighbour = neighbours[i];

			if (neighbour == null || (neighbour != null && neighbour.player_id != this.player_id))
				border_id_list.push(i);
		}

		context.beginPath();

		border_id_list.forEach(i =>
		{
			context.moveTo(this.x + Math.cos(Global.hexagon_angle * i), this.y + Math.sin(Global.hexagon_angle * i));
			context.lineTo(this.x + Math.cos(Global.hexagon_angle * (i + 1)), this.y + Math.sin(Global.hexagon_angle * (i + 1)));
		});

		context.closePath();

		context.lineWidth = is_main ? 0.15 : 0.14;
		context.lineCap = 'round';
		context.lineJoin = 'round';
		context.strokeStyle = color;
		context.stroke();
	}

	create_border(context: CanvasRenderingContext2D)
	{
		let neighbours = Grid.get_all_neighbours(this);
		let border_id_list: number[] = [];

		for (let i = 0; i < neighbours.length; i++)
		{
			let neighbour = neighbours[i];

			if (neighbour == null || (neighbour != null && neighbour.player_id != this.player_id))
				border_id_list.push(i);
		}

		border_id_list.forEach(i =>
		{
			context.moveTo(this.x + Math.cos(Global.hexagon_angle * i), this.y + Math.sin(Global.hexagon_angle * i));
			context.lineTo(this.x + Math.cos(Global.hexagon_angle * (i + 1)), this.y + Math.sin(Global.hexagon_angle * (i + 1)));
		});
	}
}
