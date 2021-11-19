// Get random integer between two numbers
function random_int(min, max)
{
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Get random color
function random_color()
{
	var letters = '0123456789ABCDEF';
	var color = '#';

	for (var i = 0; i < 6; i++)
		color += letters[Math.floor(Math.random() * 16)];

	return color;
}
