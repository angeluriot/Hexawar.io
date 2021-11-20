// A class that represents a cell of the grid
class Cell
{
	// Contruct a cell
	constructor(i, j, x, y, color, user_id, nb_troops)
	{
		this.i = i;
		this.j = j;
		this.x = x;
		this.y = y;
		this.color = color;
		this.user_id = user_id;
		this.nb_troops = nb_troops;
	}

	// Draw the cell on the screen
	draw(context)
	{
		// Draw the shape
		context.beginPath();

		for (var i = 0; i < 6; i++)
			context.lineTo(this.x + Math.cos(hexagon_angle * i), this.y + Math.sin(hexagon_angle * i));

		context.closePath();
		context.fillStyle = this.color;
		context.fill();
		context.strokeStyle = 'black';
		context.lineWidth = 0.1;
		context.stroke();

		// Draw the number of troops
		if (this.nb_troops > 0)
		{
			context.font = 'bold 0.75px sans-serif';
			context.fillStyle = is_color_dark(this.color) ? 'white' : 'black';
			context.textAlign = 'center';
			context.fillText(this.nb_troops.toString(), this.x, this.y + 0.26);
		}
	}
}
