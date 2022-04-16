import { Global } from '../properties.js';
import { Player } from '../player/player.js';
import { render } from '../renderer/renderer.js';

// A class that represents the camera
export class Camera
{
	static x = 0;
	static y = 0;
	static zoom = 50.;
	static mouse_pos = { x: 0, y: 0 };

	// Initialize the camera
	static init()
	{
		Camera.x = -(Global.grid_boundaries.width / 2.) * Camera.zoom + window.innerWidth / 2.;
		Camera.y = -(Global.grid_boundaries.height / 2.) * Camera.zoom + window.innerHeight / 2.;

		let left = false;
		let right = false;
		let up = false;
		let down = false;
		const camera_speed = 5.;

		// Move the camera with the mouse
		function on_move_mouse(e: MouseEvent)
		{
			if (Player.playing && !Global.dragging && e.buttons == 4)
			{
				Camera.x += e.movementX;
				Camera.y += e.movementY;
				Camera.clamp();
				render();
			}

			Camera.mouse_pos.x = e.clientX;
			Camera.mouse_pos.y = e.clientY;
		}

		// Move the camera with the keyboard
		function on_key_down(e: KeyboardEvent)
		{
			if (e.key == 'ArrowLeft' || e.key == 'q')
				left = true;

			if (e.key == 'ArrowRight' || e.key == 'd')
				right = true;

			if (e.key == 'ArrowUp' || e.key == 'z')
				up = true;

			if (e.key == 'ArrowDown' || e.key == 's')
				down = true;
		}

		function on_key_up(e: KeyboardEvent)
		{
			if (e.key == 'ArrowLeft' || e.key == 'q')
				left = false;

			if (e.key == 'ArrowRight' || e.key == 'd')
				right = false;

			if (e.key == 'ArrowUp' || e.key == 'z')
				up = false;

			if (e.key == 'ArrowDown' || e.key == 's')
				down = false;
		}

		function update()
		{
			if (Player.playing && !Global.dragging)
			{
				if (left)
					Camera.x += camera_speed;

				if (right)
					Camera.x -= camera_speed;

				if (up)
					Camera.y += camera_speed;

				if (down)
					Camera.y -= camera_speed;

				if (left || right || up || down)
				{
					Camera.clamp();
					render();
				}
			}

			requestAnimationFrame(update);
		}

		// Zoom with the mouse wheel
		function on_zoom(e: Event)
		{
			if (Player.playing && !Global.dragging)
			{
				let temp = Camera.screen_to_canvas(Camera.mouse_pos.x,Camera.mouse_pos.y);
				Camera.zoom *= 1 - (<WheelEvent>e).deltaY / 5000.;
				let pos = Camera.screen_to_canvas(Camera.mouse_pos.x, Camera.mouse_pos.y);
				Camera.x += (pos.x - temp.x) * Camera.zoom;
				Camera.y += (pos.y - temp.y) * Camera.zoom;
				Camera.clamp();
				render();
			}
		}

		// Event listeners
		window.addEventListener('mousemove', on_move_mouse);
		window.addEventListener('keydown', on_key_down);
		window.addEventListener('keyup', on_key_up);
		window.addEventListener('wheel', on_zoom);
		requestAnimationFrame(update);
		render();
	}

	// Move the camera at the given screen position
	static move(x: number, y: number)
	{
		this.x = -x * Camera.zoom + window.innerWidth / 2.;
		this.y = -y * Camera.zoom + window.innerHeight / 2.;
	}

	// Apply the camera transformations to the context
	static apply(context: CanvasRenderingContext2D)
	{
		context.setTransform(this.zoom, 0, 0, this.zoom, this.x, this.y);
	}

	// Give the canvas position from the screen position
	static screen_to_canvas(x: number, y: number)
	{
		let pos = { x: 0, y: 0 };
		pos.x = (x - this.x) / this.zoom;
		pos.y = (y - this.y) / this.zoom;
		return pos;
	}

	// Keep the camera inside the player's territory
	static clamp()
	{
		let pos =
		{
			x: - (Camera.x - window.innerWidth / 2) / Camera.zoom,
			y: - (Camera.y - window.innerHeight / 2) / Camera.zoom
		};
		
		let borders =
		{
			x1: 0,
			y1: 0,
			x2: Global.grid_size.x,
			y2: Global.grid_size.y,
			off1: false,
			off2: true
		};

		let offset: number = Math.sin(Global.hexagon_angle);

		if (Player.playing)
			get_player_borders(borders);

		Camera.move(
			clamp(pos.x, borders.x1 * (1 + Math.cos(Global.hexagon_angle)), borders.x2 * (1 + Math.cos(Global.hexagon_angle))),
			clamp(pos.y, borders.y1 * Math.sin(Global.hexagon_angle) * 2 + (borders.off1 ? offset : 0), borders.y2 * Math.sin(Global.hexagon_angle) * 2 + (borders.off2 ? offset : 0))
		);
	}
}

// Clamp number between two values
const clamp = (value: number, min: number, max: number) => Math.max(min,(Math.min(max, value)));


// Set borders to the player's borders
function get_player_borders(borders: {x1:number, y1: number, x2: number, y2: number, off1: boolean, off2: boolean})
{
	get_one_cell(borders);

	for (let i = 0; i < Global.grid_size.x; i++)
		for (let j = 0; j < Global.grid_size.y; j++)
			if (Global.grid[i][j].player_id == Player.id)
				update_borders(i,j, borders);
}

// Set the borders of a player to the first cell found
function get_one_cell(borders: {x1:number, y1: number, x2: number, y2: number, off1: boolean, off2: boolean})
{
	for (let i = 0; i < Global.grid_size.x; i++)
		for (let j = 0; j < Global.grid_size.y; j++)
			if (Global.grid[i][j].player_id == Player.id) 
			{
				borders.x1 = i;
				borders.x2 = i;

				borders.y1 = j;
				borders.y2 = j;

				if (i % 2)
				{
					borders.off1 = true;
					borders.off2 = true;
				} 
				else
				{
					borders.off1 = false;
					borders.off2 = false;
				}

				return;
			}
}

// Update borders according to a player's cell
function update_borders(i: number, j: number, borders: {x1:number, y1: number, x2: number, y2: number, off1: boolean, off2: boolean})
{
	if (i < borders.x1)
		borders.x1  = i;

	if (i > borders.x2)
		borders.x2  = i;

	if (j < borders.y1)
	{
		borders.y1  = j;
		borders.off1 = (i % 2 == 1);
	}

	if (j > borders.y2)
	{
		borders.y2  = j;
		borders.off2 = (i % 2 == 1);
	}
}
