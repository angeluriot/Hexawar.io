import { Global } from '../properties.js';
import * as UserConnection from './connection.js';
import * as Utils from '../utils/utils.js';

function set_xp_bar()
{
	const xp_progress = document.querySelector('.account .xp_progress') as HTMLDivElement;
	const xp_div = document.querySelector('.account .xp_div') as HTMLDivElement;
	const min = 18;
	const max = 100;

	if (Global.user_data == null)
		xp_progress.style.width = `calc(${min}% - 1px)`;

	else if (Global.user_data.xp_level < 100)
	{
		const max_value = Utils.get_required_xp(Global.user_data.xp_level + 1);
		const value = Global.user_data.xp;
		const width = (value / max_value) * (max - min) + min;
		xp_progress.style.width = `calc(${width}% - 1px)`;
		xp_div.title = `${Utils.add_spaces(value)} / ${Utils.add_spaces(max_value)}`;
	}

	else
	{
		xp_progress.style.width = `calc(${max}% - 1px)`;
		xp_div.title = 'Max XP level';
	}
}

function update_account()
{
	const username = document.querySelector('.account .username') as HTMLSpanElement;
	const xp_level = document.querySelector('.account .xp_level_number') as SVGTextElement;
	const stats_1 = document.querySelector('.account .stats_value_1') as HTMLSpanElement;
	const stats_2 = document.querySelector('.account .stats_value_2') as HTMLSpanElement;
	const stats_3 = document.querySelector('.account .stats_value_3') as HTMLSpanElement;
	const stats_4 = document.querySelector('.account .stats_value_4') as HTMLSpanElement;
	const play_button = document.querySelector('.connection .play .svg_button') as SVGElement;

	if (Global.user_data != null)
	{
		username.innerText = Global.user_data.username;
		xp_level.innerHTML = Global.user_data.xp_level.toString();
		stats_1.innerText = Utils.add_spaces(Global.user_data.games_played);
		stats_2.innerText = Utils.add_spaces(Global.user_data.conquered_lands);
		stats_3.innerText = Utils.add_spaces(Global.user_data.highest_score);
		stats_4.innerText = Utils.add_spaces(Global.user_data.games_played > 0 ? Math.round(Global.user_data.total_score / Global.user_data.games_played) : 0);
		set_xp_bar();

		play_button.innerHTML = '<g><path d="M0,25.24v26A12.27,12.27,0,0,0,6.13,61.82l22.49,13a12.24,12.24,0,0,0,12.25,0l22.49-13a12.27,12.27,0,0,0,6.13-10.61v-26a12.25,12.25,0,0,0-6.13-10.61l-22.49-13a12.24,12.24,0,0,0-12.25,0l-22.49,13A12.25,12.25,0,0,0,0,25.24Z"/></g><text class="svg_button_text" x="34.745" y="38.22" font-size="17" fill="#FFFFFF" text-anchor="middle" alignment-baseline="middle">Play</text>';
	}

	else
	{
		username.innerText = '';
		xp_level.innerHTML = '';
		stats_1.innerText = '';
		stats_2.innerText = '';
		stats_3.innerText = '';
		stats_4.innerText = '';
		set_xp_bar();

		play_button.innerHTML = '<g><path d="M0,25.24v26A12.27,12.27,0,0,0,6.13,61.82l22.49,13a12.24,12.24,0,0,0,12.25,0l22.49-13a12.27,12.27,0,0,0,6.13-10.61v-26a12.25,12.25,0,0,0-6.13-10.61l-22.49-13a12.24,12.24,0,0,0-12.25,0l-22.49,13A12.25,12.25,0,0,0,0,25.24Z"/></g><text class="button_text" x="34.745" y="39" font-size="15" fill="#FFFFFF" text-anchor="middle" alignment-baseline="middle"><tspan x="36" dy="-0.55em">Play as</tspan><tspan x="34.745" dy="1.1em">guest</tspan></text>';
	}
}

export function clear()
{
	const inputs = document.querySelectorAll('.user_input') as NodeListOf<HTMLInputElement>;
	const text_title = document.querySelector('.message .text_title') as HTMLSpanElement;
	const text_message = document.querySelector('.message .text_message') as HTMLSpanElement;

	for (let i = 0; i < inputs.length; i++)
		inputs[i].value = '';

	text_title.innerText = '';
	text_message.innerText = '';

	update_account();
}

export function set_visible(menu: string)
{
	const menus = ['.register_login', '.register', '.login', '.account', '.loading', '.message', '.delete_account'];

	if (!menus.includes(menu))
		return;

	for (let i = 0; i < menus.length; i++)
	{
		if (menus[i] == menu)
			(document.querySelector('.user_menu ' + menus[i]) as HTMLDivElement).style.visibility = 'visible';
		else
			(document.querySelector('.user_menu ' + menus[i]) as HTMLDivElement).style.visibility = 'hidden';
	}
}

export function is_loading()
{
	return (document.querySelector('.user_menu .loading') as HTMLDivElement).style.visibility == 'visible';
}

function inactive_button(button: string)
{
	const button_element = document.querySelector(button) as SVGElement;

	button_element.style.opacity = '0.5';
	button_element.style.cursor = 'default';
	button_element.style.pointerEvents = 'none';
}

function active_button(button: string)
{
	const button_element = document.querySelector(button) as SVGElement;

	button_element.style.opacity = '1';
	button_element.style.cursor = 'pointer';
	button_element.style.pointerEvents = 'auto';
}

function register_login_events()
{
	const register_button = document.querySelector('.register_login .register_button') as SVGElement;
	const login_button = document.querySelector('.register_login .login_button') as SVGElement;

	register_button.addEventListener('click', (e) =>
	{
		e.preventDefault();
		clear();
		set_visible('.register');
	});

	login_button.addEventListener('click', (e) =>
	{
		e.preventDefault();
		clear();
		set_visible('.login');
	});
}

function register_events()
{
	const username_input = document.querySelector('.register .username_input') as HTMLInputElement;
	const password_input = document.querySelector('.register .password_input') as HTMLInputElement;
	const password_repeat_input = document.querySelector('.register .password_repeat_input') as HTMLInputElement;
	const back_button = document.querySelector('.register .back_button') as SVGElement;
	const register_button = document.querySelector('.register .register_button') as SVGElement;

	function valid_inputs()
	{
		if (username_input.value.length < 4 || username_input.value.length > 16)
			inactive_button('.register .register_button');

		else if (password_input.value.length < 4 || password_input.value.length > 32)
			inactive_button('.register .register_button');

		else if (password_input.value != password_repeat_input.value)
			inactive_button('.register .register_button');

		else
			active_button('.register .register_button');
	}

	valid_inputs();

	username_input.addEventListener('input', (e) =>
	{
		valid_inputs();
	});

	password_input.addEventListener('input', (e) =>
	{
		valid_inputs();
	});

	password_repeat_input.addEventListener('input', (e) =>
	{
		valid_inputs();
	});

	back_button.addEventListener('click', (e) =>
	{
		e.preventDefault();
		clear();
		set_visible('.register_login');
	});

	register_button.addEventListener('click', (e) =>
	{
		e.preventDefault();
		UserConnection.register(username_input.value, password_input.value);
		set_visible('.loading');
	});
}

function login_events()
{
	const username_input = document.querySelector('.login .username_input') as HTMLInputElement;
	const password_input = document.querySelector('.login .password_input') as HTMLInputElement;
	const back_button = document.querySelector('.login .back_button') as SVGElement;
	const login_button = document.querySelector('.login .login_button') as SVGElement;

	function valid_inputs()
	{
		if (username_input.value.length < 4 || username_input.value.length > 16)
			inactive_button('.login .login_button');

		else if (password_input.value.length < 4 || password_input.value.length > 32)
			inactive_button('.login .login_button');

		else
			active_button('.login .login_button');
	}

	valid_inputs();

	username_input.addEventListener('input', (e) =>
	{
		valid_inputs();
	});

	password_input.addEventListener('input', (e) =>
	{
		valid_inputs();
	});

	back_button.addEventListener('click', (e) =>
	{
		e.preventDefault();
		clear();
		set_visible('.register_login');
	});

	login_button.addEventListener('click', (e) =>
	{
		e.preventDefault();
		UserConnection.login(username_input.value, password_input.value);
		set_visible('.loading');
	});
}

function account_events()
{
	const logout_button = document.querySelector('.account .logout_button') as SVGElement;
	const delete_account_button = document.querySelector('.account .delete_account_button') as SVGElement;

	logout_button.addEventListener('click', (e) =>
	{
		e.preventDefault();
		UserConnection.logout();
		set_visible('.loading');
	});

	delete_account_button.addEventListener('click', (e) =>
	{
		e.preventDefault();
		clear();
		set_visible('.delete_account');
	});
}

export function show_message(color: string, title: string, message: string, back_target: string)
{
	const ok_button = document.querySelector('.message .ok_button') as SVGElement;
	const background = document.querySelector('.message .background') as SVGElement;
	const text_title = document.querySelector('.message .text_title') as HTMLSpanElement;
	const text_message = document.querySelector('.message .text_message') as HTMLSpanElement;

	ok_button.replaceWith(ok_button.cloneNode(true));
	background.style.fill = color;
	text_title.style.color = color;
	text_title.innerText = title;
	text_message.innerText = message;

	const ok_button_2 = document.querySelector('.message .ok_button') as SVGElement;

	ok_button_2.addEventListener('click', (e) =>
	{
		e.preventDefault();
		set_visible(back_target);

		const text_title = document.querySelector('.message .text_title') as HTMLSpanElement;
		const text_message = document.querySelector('.message .text_message') as HTMLSpanElement;
		text_title.innerText = '';
		text_message.innerText = '';
	});

	set_visible('.message');
}

function delete_account_events()
{
	const back_button = document.querySelector('.delete_account .back_button') as SVGElement;
	const delete_account_button = document.querySelector('.delete_account .delete_account_button') as SVGElement;
	const password_input = document.querySelector('.delete_account .password_input') as HTMLInputElement;

	function valid_inputs()
	{
		if (password_input.value.length < 4 || password_input.value.length > 32)
			inactive_button('.delete_account .delete_account_button');
		else
			active_button('.delete_account .delete_account_button');
	}

	valid_inputs();

	password_input.addEventListener('input', (e) =>
	{
		valid_inputs();
	});

	back_button.addEventListener('click', (e) =>
	{
		e.preventDefault();
		clear();
		set_visible('.account');
	});

	delete_account_button.addEventListener('click', (e) =>
	{
		e.preventDefault();
		UserConnection.delete_account(password_input.value);
		set_visible('.loading');
	});
}

export function user_menu_events()
{
	register_login_events();
	register_events();
	login_events();
	account_events();
	delete_account_events();
}
