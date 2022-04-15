// Give a random integer between two numbers
export function random_int(min: number, max: number)
{
	return Math.floor(Math.random() * (max - min)) + min;
}

export function random_color()
{
	let letters = '0123456789ABCDEF';
	let color = '#';

	for (let i = 0; i < 6; i++)
		color += letters[Math.floor(Math.random() * 16)];

	return color;
}

export function is_color(color: string)
{
	return /^#[0-9A-F]{6}$/i.test(color);
}

export function get_required_xp(level: number)
{
	return Math.round(Math.sqrt(level) * 500 - 500);
}

export function delay (ms: number)
{
	return new Promise( resolve => setTimeout(resolve, ms) );
}

export function shuffle_array(array: string[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
