let grid_size = { x: 50, y: 50 };
let grid = [];

function create_grid()
{
	grid = new Array(grid_size.x).fill("#FFFFFF").map(() => new Array(grid_size.y).fill("#FFFFFF"));
}

function set_cell(x, y, color)
{
	if (x < 0 || x >= grid_size.x || y < 0 || y >= grid_size.y)
		return null;

	grid[x][y] = color;
	return color;
}

function get_cell(x, y)
{
	if (x < 0 || x >= grid_size.x || y < 0 || y >= grid_size.y)
		return null;

	return grid[x][y];
}

function get_grid()
{
	return grid;
}

module.exports =
{
	create_grid,
	set_cell,
	get_cell,
	get_grid
}
