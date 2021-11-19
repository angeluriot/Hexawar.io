class Camera
{
	constructor(pos_x, pos_y, zoom)
	{
		this.x = pos_x;
		this.y = pos_y;
		this.zoom = zoom;
		this.mouse_pos = { x: 0, y: 0 };
	}

	init()
	{
		function on_move(e)
		{
			if (e.buttons == 4)
			{
				this.x += e.movementX;
				this.y += e.movementY;
				render();
			}

			this.mouse_pos.x = e.clientX;
			this.mouse_pos.y = e.clientY;
		}

		function on_zoom(e)
		{
			let temp = this.screen_to_canvas(this.mouse_pos.x, this.mouse_pos.y);
			this.zoom *= 1 - e.deltaY / 5000.;
			let pos = this.screen_to_canvas(this.mouse_pos.x, this.mouse_pos.y);
			this.x += (pos.x - temp.x) * this.zoom;
			this.y += (pos.y - temp.y) * this.zoom;
			render();
		}

		window.addEventListener('mousemove', on_move.bind(this));
		window.addEventListener('mousewheel', on_zoom.bind(this));
		render();
	}

	apply(context)
	{
		context.setTransform(this.zoom, 0, 0, this.zoom, this.x, this.y);
	}

	screen_to_canvas(x, y)
	{
		let pos = { x: 0, y: 0 };
		pos.x = (x - this.x) / this.zoom;
		pos.y = (y - this.y) / this.zoom;
		return pos;
	}
}

let inital_camera_zoom = 50.;
let camera = new Camera(0, 0, inital_camera_zoom);
