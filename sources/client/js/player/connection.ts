import { Global } from '../properties.js';
import * as Color from '../utils/color.js';
import * as Cookie from './cookie.js';
import * as Game from '../game.js';
import { Player } from './player.js';

// Update the color picker div
export function color_picker_events()
{
	const color_picker = document.querySelector('.color_input') as HTMLInputElement;
	const color_div = document.querySelector('.color_div') as HTMLDivElement;
	const color_text = document.querySelector('.color_text') as HTMLSpanElement;

	color_picker.addEventListener('input', (e: Event) =>
	{
		color_div.style.backgroundColor = (e.target as HTMLInputElement).value;
		color_text.innerHTML = color_picker.value;

		if (Color.is_color_dark(color_picker.value, Global.dark_color_limit))
			color_text.style.color = '#ffffff';
		else
			color_text.style.color = '#000000';
	});

	color_picker.value = Color.random_color();
	color_div.style.backgroundColor = color_picker.value;
}

// Connection events
export function form_events()
{
	const form_div = document.querySelector('.connect_div') as HTMLDivElement;
	const name_input = document.querySelector('.nickname_input') as HTMLInputElement;
	const color_picker = document.querySelector('.color_input') as HTMLInputElement;
	const color_div = document.querySelector('.color_div') as HTMLDivElement;
	const color_text = document.querySelector('.color_text') as HTMLSpanElement;
	const submit_button = document.querySelector('.svg_button') as SVGElement;

	color_picker_events();
	Cookie.load_cookie_data(name_input, color_picker, color_div);

	if (Color.is_color_dark(color_picker.value, Global.dark_color_limit))
			color_text.style.color = '#ffffff';
	else
		color_text.style.color = '#000000';

	// Start the game
	submit_button.addEventListener('click', e =>
	{
		e.preventDefault();
		Game.start_game(name_input.value, color_picker.value);
		Player.playing = true;
		form_div.style.display = 'none';
	});
}
