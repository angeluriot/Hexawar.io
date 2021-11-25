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

		if (is_color_dark(color_picker.value))
			color_text.style.color = '#ffffff';
		else
			color_text.style.color = '#000000';
	});

	color_picker.value = random_color();
	color_div.style.backgroundColor = color_picker.value;

	if (is_color_dark(color_picker.value))
			color_text.style.color = '#ffffff';
	else
		color_text.style.color = '#000000';
}

// Connection events
function form_events(socket)
{
	const form_div = document.querySelector('.connect_div');
	const form = document.querySelector('.connect_form');
	const name_input = document.querySelector('.nickname_input');
	const color_picker = document.querySelector('.color_input');
	const color_div = document.querySelector('.color_div');

	load_cookie_data(name_input, color_picker, color_div);

	// Start the game
	form.addEventListener('submit', e =>
	{
		e.preventDefault();
		start_game(socket, name_input.value, color_picker.value);
		joined = true;
		form_div.style.display = 'none';
	});
}

let s;

// Load user's data if he has any
load_cookie_data = (name_input, color_picker, color_div) => {
	let cookie = get_cookie();
	if (cookie.name != "") {
		name_input.value = cookie.name;
		color_picker.value = cookie.color;
		color_div.style.backgroundColor = cookie.color;
	}
}