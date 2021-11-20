// Givea a random integer between two numbers
function random_int(min, max)
{
	return Math.floor(Math.random() * (max - min)) + min;
}

// Give a random color
function random_color()
{
	var letters = '0123456789ABCDEF';
	var color = '#';

	for (var i = 0; i < 6; i++)
		color += letters[Math.floor(Math.random() * 16)];

	return color;
}

// Tell if color is dark or light
function is_color_dark(color)
{
	var rgb = parseInt(color.slice(1), 16);
	var r = (rgb >> 16) & 0xff;
	var g = (rgb >> 8) & 0xff;
	var b = (rgb >> 0) & 0xff;
	var brightness = (r * 299 + g * 587 + b * 114) / 1000.;

	return brightness < 180;
}
