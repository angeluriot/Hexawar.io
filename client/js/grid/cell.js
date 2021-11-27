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

		if (this == cell_from)
			context.fillStyle = change_color(this.color, dark_color_limit, 0.2);

		context.fill();
		context.strokeStyle = border_color;
		context.lineWidth = 0.1;
		context.lineCap = 'round';

		if (this.user_id != '')
			context.strokeStyle = change_color(this.color, dark_color_limit, 0.2);

		context.stroke();

		// Draw the number of troops
		if (this.nb_troops > 0)
		{
			context.font = '0.75px Roboto_bold';

			if (user != null && this.user_id == user.id)
				context.fillStyle = is_color_dark(this.color, dark_color_limit) ? 'white' : 'black';

			else
				context.fillStyle = change_color(this.color, dark_color_limit, 0.4);

			context.textAlign = 'center';
			context.fillText(this.nb_troops.toString(), this.x, this.y + 0.26);
		}
	}
}
