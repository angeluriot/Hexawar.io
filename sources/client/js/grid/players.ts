import { Cell } from '../grid/cell.js';
import { Global } from '../properties.js';
import { Player } from '../player/player.js';
import * as Color from '../utils/color.js';

export class PlayerCells
{
	player_id: string;
	color: string;
	skin_id: number;
	border_path: { x: number, y: number }[];
	private cell_list: Cell[];
	private bounding_box: { left: number, top: number, right: number, bottom: number };
	static list: PlayerCells[] = [];
	static main: PlayerCells | null = null;

	constructor(cell: Cell)
	{
		this.player_id = cell.player_id;
		this.color = cell.color;
		this.skin_id = cell.skin_id;
		this.border_path = [];
		this.cell_list = [cell];
		this.bounding_box = { left: cell.x - 1, top: cell.y - 1, right: cell.x + 1, bottom: cell.y + 1 };
	}

	add_cell(cell: Cell)
	{
		this.cell_list.push(cell);

		if (cell.x - 1 < this.bounding_box.left)
			this.bounding_box.left = cell.x - 1;

		else if (cell.x + 1 > this.bounding_box.right)
			this.bounding_box.right = cell.x + 1;

		if (cell.y - 1 < this.bounding_box.top)
			this.bounding_box.top = cell.y - 1;

		else if (cell.y + 1 > this.bounding_box.bottom)
			this.bounding_box.bottom = cell.y + 1;
	}

	draw(context: CanvasRenderingContext2D)
	{
		// Is main player?
		const is_main = Player.playing && this.player_id == Player.id;
		const opacity = this.skin_id == -1 ? 0.9 : 0.7;

		// Create clipping path
		context.save();
		context.beginPath();

		for (let i = 0; i < this.cell_list.length; i++)
			this.cell_list[i].create_clip(context);

		context.clip();

		// Draw background image
		const image_parameters = get_image_parameters(this.bounding_box);
		this.draw_background(context, image_parameters, 1);

		// Draw inside borders
		for (let i = 0; i < this.cell_list.length; i++)
			this.cell_list[i].draw_inside(context);

		// Lower opacity of the inside borders
		this.draw_background(context, image_parameters, is_main ? opacity : (opacity * 0.9));

		// Draw the numbers
		for (let i = 0; i < this.cell_list.length; i++)
			this.cell_list[i].draw_number(context);

		// Lower the opacity of the numbers
		if (!is_main)
			this.draw_background(context, image_parameters, opacity * 0.5);

		context.restore();

		// Draw the borders
		if (this.skin_id == -1)
		{
			this.draw_border(context, is_main, this.color, 1);
			this.draw_border(context, is_main, Color.is_color_dark(this.color) ? 'white' : 'black', 0.3);
		}

		else
			this.draw_border(context, is_main, Global.skin_colors[this.skin_id], 1);
	}

	draw_background(context: CanvasRenderingContext2D, image_parameters: { x: number, y: number, width: number, height: number }, alpha: number)
	{
		if (this.skin_id == -1)
		{
			context.globalAlpha = alpha;
			context.fillStyle = this.color;
			context.fillRect(image_parameters.x, image_parameters.y, image_parameters.width, image_parameters.height);
			context.globalAlpha = 1;
		}

		else
		{
			context.globalAlpha = alpha;
			context.drawImage(Global.skins[this.skin_id], image_parameters.x, image_parameters.y, image_parameters.width, image_parameters.height);
			context.globalAlpha = 1;
		}
	}

	draw_border(context: CanvasRenderingContext2D, is_main: boolean, color: string, alpha: number)
	{
		context.beginPath();
		context.globalAlpha = alpha;

		for (let i = 0; i < this.cell_list.length; i++)
			this.cell_list[i].create_border(context);

		context.closePath();

		context.lineWidth = is_main ? 0.15 : 0.14;
		context.lineCap = 'round';
		context.lineJoin = 'round';
		context.strokeStyle = color;
		context.stroke();
		context.globalAlpha = 1;
	}

	static draw_players(context: CanvasRenderingContext2D)
	{
		for (let i = 0; i < PlayerCells.list.length; i++)
			PlayerCells.list[i].draw(context);

		if (PlayerCells.main != null)
			PlayerCells.main.draw(context);
	}
}

function get_image_parameters(bounding_box: { left: number, top: number, right: number, bottom: number })
{
	let width = bounding_box.right - bounding_box.left;
	let height = bounding_box.bottom - bounding_box.top;

	let size = Math.max(width, height);

	let x_offset = (size - width) / 2;
	let y_offset = (size - height) / 2;

	return { x: bounding_box.left - x_offset, y: bounding_box.top - y_offset, width: size, height: size };
}
