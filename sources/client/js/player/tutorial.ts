const text:string[] =
[
	"Tutorial",
	"Customise your player!",
	"Move your troops.",
	"Gather troops.",
	"Attack your opponents!",
	"Split your opponents!",
	"Good luck!"
];

let id_img:number = 0;
let nb_tuto_img:number = text.length-1;

export function events()
{
	const start_button = document.querySelector('.tutorial .tutorial_button') as SVGElement;
	const next_button = document.querySelector('.tutorial .next_button') as SVGElement;
	const back_button = document.querySelector('.tutorial .back_button') as SVGElement;

	const start_div = document.querySelector('.tutorial .tuto_start') as HTMLDivElement;
	const navigate_div = document.querySelector('.tutorial .tuto_navigate') as HTMLDivElement;

	// events when clicking on the start_button
	start_button.addEventListener('click', e =>
	{
		e.preventDefault();

		if (id_img == 0)
		{
			start_div.style.visibility = 'hidden';
			navigate_div.style.visibility = 'visible';
			id_img++;
		}

		update();
	});

	// events when clicking on the next_button
	next_button.addEventListener('click', e =>
	{
		e.preventDefault();

		if (id_img < nb_tuto_img)
		{
			id_img++;

			if (id_img == nb_tuto_img)
				inactive_button(next_button);
		}

		update();
	});

	// events when clicking on the back_button
	back_button.addEventListener('click', e =>
	{
		e.preventDefault();

		if (id_img >= 1)
		{
			if (id_img == 1)
			{
				start_div.style.visibility = 'visible';
				navigate_div.style.visibility = 'hidden';
			}

			if (id_img == nb_tuto_img)
				active_button(next_button);

			id_img--;
		}

		update();
	});

	next_button.addEventListener('mousedown', e =>
	{
		e.preventDefault();
	});

	back_button.addEventListener('mousedown', e =>
	{
		e.preventDefault();
	});
}

// update tutorial content
function update()
{
	const title = document.querySelector('.tutorial .title') as HTMLSpanElement;
	const image = document.querySelector('.tutorial .image') as HTMLImageElement;

	title.innerText = text[id_img];
	image.src = "resources/gifs/tuto_" + id_img + ".gif";
}

function inactive_button(button: SVGElement)
{
	button.style.opacity = '0.5';
	button.style.cursor = 'default';
	button.style.pointerEvents = 'none';
}

function active_button(button: SVGElement)
{
	button.style.opacity = '1';
	button.style.cursor = 'pointer';
	button.style.pointerEvents = 'auto';
}
