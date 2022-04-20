import { Player } from "../player/player.js";
import { ClientSocket, Global, ServerSocket } from "../properties.js";

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
	for (let i = 0; i < nb_veteran_skins; i++)
	{
		let button = document.querySelector(`.shop .veteran_list .skin_${i} .skin_text`);

		if (button != null)
		{
			button.addEventListener('click', e =>
			{
				e.preventDefault();
				const index = i;

				if (index == Player.skin_id)
					Player.set_skin(-1);
				else
					Player.set_skin(index);
			});
		}
	}
}

export function premium_buy_use_event()
{
	let strated_payment = false;

	for (let i = 0; i < nb_premium_skins; i++)
	{
		let button = document.querySelector(`.shop .premium_list .skin_${i} .skin_text`);

		if (button != null)
		{
			button.addEventListener('click', e =>
			{
				e.preventDefault();
				const index = i + nb_veteran_skins;

				if (Global.user_data != null && Global.user_data.skins.includes(index))
				{
					if (index == Player.skin_id)
						Player.set_skin(-1);
					else
						Player.set_skin(index);
				}

				else if (!strated_payment)
				{
					Global.socket.emit(ClientSocket.PAYMENT, index);
					strated_payment = true;
				}
			});
		}
	}

	Global.socket.on(ServerSocket.PAYMENT_SESSION, (url: any) => {
		window.location.href = url;
	})
}

export function update_skin_button(skin_id: number, used: boolean)
{
	if (skin_id < 0)
		return;

	let shop_button: HTMLSpanElement;

	if (skin_id < nb_veteran_skins)
		shop_button = document.querySelector(`.shop .veteran_list .skin_${skin_id} .skin_text`) as HTMLSpanElement;
	else if (skin_id < nb_veteran_skins + nb_premium_skins)
		shop_button = document.querySelector(`.shop .premium_list .skin_${skin_id - nb_veteran_skins} .skin_text`) as HTMLSpanElement;
	else
		return;

	if (used)
	{
		shop_button.classList.remove('unlocked');
		shop_button.classList.add('used');
		shop_button.innerText = 'Cancel';
	}

	else
	{
		shop_button.classList.remove('used');
		shop_button.classList.add('unlocked');
		shop_button.innerText = 'Use';
	}
}

export function update_skin_connection()
{
	function update_buttons(button: { button: HTMLSpanElement, index: number})
	{
		if (button.button != null)
		{
			if (Global.user_data != null && Global.user_data.skins.includes(button.index))
			{
				button.button.classList.remove('locked');
				button.button.classList.remove('used');
				button.button.classList.add('unlocked');
				button.button.innerText = 'Use';
			}

			else
			{
				button.button.classList.remove('unlocked');
				button.button.classList.remove('used');
				button.button.classList.add('locked');

				if (button.index < nb_veteran_skins)
					button.button.innerText = `Level ${(button.index + 1) * 10}`;
				else
					button.button.innerText = `0.99€`;
			}
		}
	}

	let buttons: { button: HTMLSpanElement, index: number}[] = [];

	for (let i = 0; i < nb_veteran_skins; i++)
		buttons.push({ button: document.querySelector(`.shop .veteran_list .skin_${i} .skin_text`) as HTMLSpanElement, index: i });

	for (let i = 0; i < nb_premium_skins; i++)
		buttons.push({ button: document.querySelector(`.shop .premium_list .skin_${i} .skin_text`) as HTMLSpanElement, index: nb_veteran_skins + i });

	buttons.forEach(update_buttons);

	premium_buy_use_event();
}

export function menus_events()
{
	tabs();
	arrows();
	exit_button();
	use_event();
}
