// A class that represents the camera
class Camera
{
	// Construct the camera
	constructor(pos_x, pos_y, zoom)
	{
		this.x = pos_x;
		this.y = pos_y;
		this.zoom = zoom;
		this.mouse_pos = { x: 0, y: 0 };
	}

	// Initialize the camera
	init()
	{
		this.x = -(grid_boundaries.width / 2.) * inital_camera_zoom + window.innerWidth / 2.;
		this.y = -(grid_boundaries.height / 2.) * inital_camera_zoom + window.innerHeight / 2.;

		let left = false;
		let right = false;
		let up = false;
		let down = false;
		const camera_speed = 5.;

		// Move the camera with the mouse
		function on_move_mouse(e)
		{
			if (joined && !dragging && e.buttons == 4)
			{
				this.x += e.movementX;
				this.y += e.movementY;
				render();
			}

			this.mouse_pos.x = e.clientX;
			this.mouse_pos.y = e.clientY;
		}

		// Move the camera with the keyboard
		function on_key_down(e)
		{
			if (e.keyCode == 37 || e.keyCode == 81)
				left = true;

			if (e.keyCode == 39 || e.keyCode == 68)
				right = true;

			if (e.keyCode == 38 || e.keyCode == 90)
				up = true;

			if (e.keyCode == 40 || e.keyCode == 83)
				down = true;
		}

		function on_key_up(e)
		{
			if (e.keyCode == 37 || e.keyCode == 81)
				left = false;

			if (e.keyCode == 39 || e.keyCode == 68)
				right = false;

			if (e.keyCode == 38 || e.keyCode == 90)
				up = false;

			if (e.keyCode == 40 || e.keyCode == 83)
				down = false;
		}

		function update()
		{
			if (joined && !dragging)
			{
				if (left)
					this.x += camera_speed;

				if (right)
					this.x -= camera_speed;

				if (up)
					this.y += camera_speed;

				if (down)
					this.y -= camera_speed;

				if (left || right || up || down)
					render();
			}

			requestAnimationFrame(update.bind(this));
		}

		// Zoom with the mouse wheel
		function on_zoom(e)
		{
			if (joined && !dragging)
			{
				let temp = this.screen_to_canvas(this.mouse_pos.x, this.mouse_pos.y);
				this.zoom *= 1 - e.deltaY / 5000.;
				let pos = this.screen_to_canvas(this.mouse_pos.x, this.mouse_pos.y);
				this.x += (pos.x - temp.x) * this.zoom;
				this.y += (pos.y - temp.y) * this.zoom;
				render();
			}
		}

		// Event listeners
		window.addEventListener('mousemove', on_move_mouse.bind(this));
		window.addEventListener('keydown', on_key_down.bind(this));
		window.addEventListener('keyup', on_key_up.bind(this));
		window.addEventListener('mousewheel', on_zoom.bind(this));
		requestAnimationFrame(update.bind(this));
		render();
	}

	// Move the camera at the given screen position
	move(x, y)
	{
		this.x = -x * inital_camera_zoom + window.innerWidth / 2.;
		this.y = -y * inital_camera_zoom + window.innerHeight / 2.;
	}

	// Apply the camera transformations to the context
	apply(context)
	{
		context.setTransform(this.zoom, 0, 0, this.zoom, this.x, this.y);
	}

	// Give the canvas position from the screen position
	screen_to_canvas(x, y)
	{
		let pos = { x: 0, y: 0 };
		pos.x = (x - this.x) / this.zoom;
		pos.y = (y - this.y) / this.zoom;
		return pos;
	}
}

// The camera
camera = new Camera(0, 0, inital_camera_zoom);
