// Give a random color
function random_color()
{
	let letters = '0123456789ABCDEF';
	let color = '#';

	for (let i = 0; i < 6; i++)
		color += letters[Math.floor(Math.random() * 16)];

	return color;
}

// Hexa color to RGB color
function hexa_to_rgb(color)
{
	let rgb = parseInt(color.slice(1), 16);
	let r = (rgb >> 16) & 0xff;
	let g = (rgb >> 8) & 0xff;
	let b = (rgb >> 0) & 0xff;

	return { r: r, g: g, b: b };
}

// RGB color to Hexa color
function rgb_to_hexa(rgb)
{
	function component_to_hex(c)
	{
		let hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	}

	return "#" + component_to_hex(rgb.r) + component_to_hex(rgb.g) + component_to_hex(rgb.b);
}

// Tell if color is dark or light
function is_color_dark(color, level)
{
	let rgb = hexa_to_rgb(color);
	let brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000.;

	return brightness < level;
}

// Lighten or darken the color
function change_color(color, dark_level, change_level)
{
	function apply_change(value, target, change_level)
	{
		return Math.floor((1. - change_level) * value + change_level * target);
	}

	let rgb = hexa_to_rgb(color);

	if (rgb.r > 160 && rgb.b < 160 && rgb.g < 160)
		change_level *= (rgb.r - 160) / 60.;

	else if (rgb.r > 160 && rgb.b > 160 && rgb.g < 160)
		change_level *= (rgb.r + rgb.b - 160 * 2) / 80.;

	else if (rgb.g > 160 && rgb.r < 160)
		change_level *= (rgb.g - 160) / 40.;

	if (change_level > 1.)
		change_level = 1.;

	if (is_color_dark(color, dark_level))
		return rgb_to_hexa({ r: apply_change(rgb.r, 255, change_level), g: apply_change(rgb.g, 255, change_level), b: apply_change(rgb.b, 255, change_level) });

	return rgb_to_hexa({ r: apply_change(rgb.r, 0, change_level), g: apply_change(rgb.g, 0, change_level), b: apply_change(rgb.b, 0, change_level) });
}
