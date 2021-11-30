import { Cell } from './grid/cell.js';

export class Global
{
	// Cell
	static hexagon_angle = 2 * Math.PI / 6.;
	static border_color = '#D3D4DC';
	static dark_color_limit = 200;

	// Grid
	static background_color = '#777A89';
	static grid_size = { x: 60, y: 30 };
	static grid: Cell[][] = [];
	static grid_boundaries = { x: 0, y: 0, width: 0, height: 0 };

	// Move
	static dragging = false;
	static show_drag = false;
	static drag_from = { x: 0, y: 0 };
	static drag_to = { x: 0, y: 0 };
	static cell_from: null | Cell = null;
}
