const hexagon_angle = 2 * Math.PI / 6.;

class Cell
{
	constructor(i, j, x, y, color)
	{
		this.i = i;
		this.j = j;
		this.x = x;
		this.y = y;
		this.color = color;
	}

	draw(context)
	{
		context.beginPath();

		for (var i = 0; i < 6; i++)
			context.lineTo(this.x + Math.cos(hexagon_angle * i), this.y + Math.sin(hexagon_angle * i));

		context.closePath();
		context.fillStyle = this.color;
		context.fill();
		context.strokeStyle = "black";
		context.lineWidth = 0.1;
		context.stroke();
	}
}
