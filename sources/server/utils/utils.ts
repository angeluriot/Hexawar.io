// Give a random integer between two numbers
export function random_int(min: number, max: number)
{
	return Math.floor(Math.random() * (max - min)) + min;
}
