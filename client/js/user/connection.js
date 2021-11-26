// Update the color picker div
function color_picker_events()
{
	const color_picker = document.querySelector('.color_input');
	const color_div = document.querySelector('.color_div');
	const color_text = document.querySelector('.color_text');

	color_picker.addEventListener('input', e =>
	{
		color_div.style.backgroundColor = e.target.value;
		color_text.innerHTML = color_picker.value;

		if (is_color_dark(color_picker.value, dark_color_limit))
			color_text.style.color = '#ffffff';
		else
			color_text.style.color = '#000000';
	});

	color_picker.value = random_color();
	color_div.style.backgroundColor = color_picker.value;
}

// Connection events
function form_events(socket)
{
	const form_div = document.querySelector('.connect_div');
	const form = document.querySelector('.connect_form');
	const name_input = document.querySelector('.nickname_input');
	const color_picker = document.querySelector('.color_input');
	const color_div = document.querySelector('.color_div');
	const color_text = document.querySelector('.color_text');
	const submit_button = document.querySelector('.svg_button');

	color_picker_events();
	load_cookie_data(name_input, color_picker, color_div);

	if (is_color_dark(color_picker.value, dark_color_limit))
			color_text.style.color = '#ffffff';
	else
		color_text.style.color = '#000000';

	// Start the game
	submit_button.addEventListener('click', e =>
	{
		e.preventDefault();
		start_game(socket, name_input.value, color_picker.value);
		joined = true;
		form_div.style.display = 'none';
	});
}
