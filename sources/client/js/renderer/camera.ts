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
			if ((Player.spectator || Player.playing) && !Global.dragging && e.buttons == 4)
			{
				Camera.x += e.movementX;
				Camera.y += e.movementY;
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
			if ((Player.spectator || Player.playing) && !Global.dragging)
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
					render();
			}

			requestAnimationFrame(update);
		}

		// Zoom with the mouse wheel
		function on_zoom(e: Event)
		{
			if ((Player.spectator || Player.playing) && !Global.dragging)
			{
				let temp = Camera.screen_to_canvas(Camera.mouse_pos.x,Camera.mouse_pos.y);
				Camera.zoom *= 1 - (<WheelEvent>e).deltaY / 5000.;
				let pos = Camera.screen_to_canvas(Camera.mouse_pos.x, Camera.mouse_pos.y);
				Camera.x += (pos.x - temp.x) * Camera.zoom;
				Camera.y += (pos.y - temp.y) * Camera.zoom;
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
}
