// Givea a random integer between two numbers
export function random_int(min: number, max: number)
{
	return Math.floor(Math.random() * (max - min)) + min;
}

export function get_required_xp(level: number)
{
	return Math.round(Math.sqrt(level) * 500 - 500);
}

export function add_spaces(input: number)
{
	return input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
