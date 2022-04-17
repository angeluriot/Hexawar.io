import {Global} from '../properties.js'

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

export function is_valid_cell(i: number, j: number)
{
	let length: number = Global.grid_size.x;
	let quarter: number = length >> 2;

	return true &&
		j > - ((i+1)>> 1) -1 + quarter && // NO
		j < length + quarter - ((i+1)>>1) && // SE
		j > (i >> 1) -1 - quarter && // NE
		j < length - quarter + (i >> 1) && // SO
		true;
}
