import { Cell } from './grid/cell.js';
import { UserData } from './user/connection.js';

export class Global
{
	// User
	static connected = false;
	static user_data: UserData | null = null;

	// Client
	static socket: any;

	// Cell
	static hexagon_angle = 2 * Math.PI / 6.;
	static border_color = '#e1e2e8';
	static dark_color_limit = 200;

	// Grid
	static background_color = '#777A89';
	static grid_size = { x: 41, y: 41 }; // x = y = 4*k+1
	static grid: Cell[][] = [];
	static grid_boundaries = { x: 0, y: 0, width: 0, height: 0 };

	// Move
	static dragging = false;
	static show_drag = false;
	static drag_from = { x: 0, y: 0 };
	static drag_to = { x: 0, y: 0 };
	static cell_from: null | Cell = null;

	// Resources
	static skins: HTMLImageElement[] = [];
	static skin_colors: string[] = [];
}
