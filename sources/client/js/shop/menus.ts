import { Player } from "../player/player.js";

let tab_index = 0;

const nb_veteran_skins = 10;
const nb_premium_skins = 10;

let left_arrow_active = false;
let right_arrow_active = true;
const max_veteran_right = (nb_veteran_skins - 4) * 154;
const max_premium_right = (nb_premium_skins - 4) * 154;
const max_right = [max_veteran_right, max_premium_right];

function tabs()
{
	const veteran_tab = document.querySelector('.shop .tab .tab_background_veteran') as SVGElement;
	const premium_tab = document.querySelector('.shop .tab .tab_background_premium') as SVGElement;
	const veteran_tab_path = document.querySelector('.shop .tab .tab_background_veteran .tab_path_2') as SVGPathElement;
	const premium_tab_path = document.querySelector('.shop .tab .tab_background_premium .tab_path_2') as SVGPathElement;
	const veteran_text = document.querySelector('.shop .tab .text_veteran') as HTMLSpanElement;
	const premium_text = document.querySelector('.shop .tab .text_premium') as HTMLSpanElement;
	const veteran_list = document.querySelector('.shop .veteran_list') as HTMLDivElement;
	const premium_list = document.querySelector('.shop .premium_list') as HTMLDivElement;

	veteran_tab_path.addEventListener('click', e =>
	{
		e.preventDefault();

		veteran_tab.style.visibility = 'hidden';

		veteran_text.style.color = 'white';
		premium_text.style.color = 'rgb(45, 47, 58)';

		veteran_list.style.visibility = 'hidden';
		premium_list.style.visibility = 'visible';

		tab_index = 1;
		update_active();

		premium_tab.style.visibility = 'visible';
	});

	premium_tab_path.addEventListener('click', e =>
	{
		e.preventDefault();

		premium_tab.style.visibility = 'hidden';

		premium_text.style.color = 'white';
		veteran_text.style.color = 'rgb(45, 47, 58)';

		premium_list.style.visibility = 'hidden';
		veteran_list.style.visibility = 'visible';

		tab_index = 0;
		update_active();

		veteran_tab.style.visibility = 'visible';

	});
}

function update_active()
{
	const left_arrow = document.querySelector('.shop .left_arrow') as SVGElement;
	const right_arrow = document.querySelector('.shop .right_arrow') as SVGElement;

	const veteran_list = document.querySelector('.shop .veteran_list .elements') as HTMLDivElement;
	const premium_list = document.querySelector('.shop .premium_list .elements') as HTMLDivElement;
	const lists = [veteran_list, premium_list];

	if (Number(lists[tab_index].style.left.replace(/px$/, '')) < 0)
	{
		left_arrow.classList.remove('inactive_arrow');
		left_arrow.classList.add('active_arrow');
		left_arrow_active = true;
	}

	else
	{
		left_arrow.classList.remove('active_arrow');
		left_arrow.classList.add('inactive_arrow');
		left_arrow_active = false;
	}

	if (Number(lists[tab_index].style.left.replace(/px$/, '')) > -max_right[tab_index])
	{
		right_arrow.classList.remove('inactive_arrow');
		right_arrow.classList.add('active_arrow');
		right_arrow_active = true;
	}

	else
	{
		right_arrow.classList.remove('active_arrow');
		right_arrow.classList.add('inactive_arrow');
		right_arrow_active = false;
	}
}

function arrows()
{
	const left_arrow = document.querySelector('.shop .left_arrow') as SVGElement;
	const right_arrow = document.querySelector('.shop .right_arrow') as SVGElement;

	const veteran_list = document.querySelector('.shop .veteran_list .elements') as HTMLDivElement;
	const premium_list = document.querySelector('.shop .premium_list .elements') as HTMLDivElement;
	const lists = [veteran_list, premium_list];

	left_arrow.addEventListener('click', e =>
	{
		e.preventDefault();

		if (left_arrow_active)
		{
			lists[tab_index].style.left = `${Number(lists[tab_index].style.left.replace(/px$/, '')) + 154}px`;
			update_active();
		}
	});

	right_arrow.addEventListener('click', e =>
	{
		e.preventDefault();

		if (right_arrow_active)
		{
			lists[tab_index].style.left = `${Number(lists[tab_index].style.left.replace(/px$/, '')) - 154}px`;
			update_active();
		}
	});
}

function exit_button()
{
	const exit_button = document.querySelector('.shop .exit_button') as SVGElement;
	const shop_div = document.querySelector('.shop_div') as HTMLDivElement;

	exit_button.addEventListener('click', e =>
	{
		e.preventDefault();
		shop_div.style.display = 'none';
	});
}

function use_event()
{
	let i = 0;

	for (let i = 0; i < nb_veteran_skins; i++)
	{
		let button = document.querySelector(`.shop .veteran_list .skin_${i} .unlocked`);

		if (button != null)
		{
			button.addEventListener('click', e =>
			{
				e.preventDefault();
				Player.set_skin(i);
			});
		}
	}
}

export function menus_events()
{
	tabs();
	arrows();
	exit_button();
	use_event();
}
