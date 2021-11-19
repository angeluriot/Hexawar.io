function color_picker_events()
{
	const color_picker = document.querySelector('.color_input');

	color_picker.addEventListener('change', e =>
	{
		color_picker.style.backgroundColor = e.target.value;
	});
}
