let grid_size = { x: 50, y: 50 };
let grid = [];
let grid_boundaries = { x: 0, y: 0, width: 0, height: 0 };

function create_grid()
{
	let x = 0
	let y = 0;
	let y_offset = 0;

	grid = new Array(grid_size.x).fill(new Cell(0, 0, 0, 0, "#FFFFFF")).map(() => new Array(grid_size.y).fill(new Cell(0, 0, 0, 0, "#FFFFFF")));

	for (let i = 0; i < grid_size.x; i++)
	{
		y = 0;
		y_offset = i % 2 ? Math.sin(hexagon_angle) : 0;

		for (let j = 0; j < grid_size.y; j++)
		{
			grid[i][j] = new Cell(i, j, x, y + y_offset, "#FFFFFF");
			y += Math.sin(hexagon_angle) * 2;
		}

		x += 1 + Math.cos(hexagon_angle);
	}

	grid_boundaries.width = x;
	grid_boundaries.height = y + y_offset;
}

function draw_grid(context)
{
	for (let i = 0; i < grid_size.x; i++)
		for (let j = 0; j < grid_size.y; j++)
			grid[i][j].draw(context);
}

function get_cell_from_mouse(x, y)
{
	let mouse_pos = camera.screen_to_canvas(x, y);

	let distance = 100000;
	let index = { x: 0, y: 0 };

	for (let i = 0; i < grid_size.x; i++)
		for (let j = 0; j < grid_size.y; j++)
		{
			let temp = Math.sqrt(Math.pow(mouse_pos.x - grid[i][j].x, 2) + Math.pow(mouse_pos.y - grid[i][j].y, 2));

			if (temp < distance)
			{
				distance = temp;
				index = { x: i, y: j };
			}
		}

	if (distance > 1.)
		return null;

	return grid[index.x][index.y];
}

function update_grid_from_server(server_grid)
{
	for (let i = 0; i < grid_size.x; i++)
		for (let j = 0; j < grid_size.y; j++)
			grid[i][j].color = server_grid[i][j];
}
