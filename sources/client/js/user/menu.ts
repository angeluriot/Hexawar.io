import * as UserConnection from './connection.js';

function clear_inputs()
{
	const inputs = document.querySelectorAll('.user_input') as NodeListOf<HTMLInputElement>;

	for (let i = 0; i < inputs.length; i++)
		inputs[i].value = '';
}

export function set_visible(menu: string)
{
	const menus = ['.register_login', '.register', '.login', '.account', '.loading'];

	if (!menus.includes(menu))
		return;

	for (let i = 0; i < menus.length; i++)
	{
		if (menus[i] == menu)
			(document.querySelector('.user_menu ' + menus[i]) as HTMLDivElement).style.visibility = 'visible';
		else
			(document.querySelector('.user_menu ' + menus[i]) as HTMLDivElement).style.visibility = 'hidden';
	}

	clear_inputs();
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
		set_visible('.register');
	});

	login_button.addEventListener('click', (e) =>
	{
		e.preventDefault();
		set_visible('.login');
	});
}

function register_events()
{
	const register = document.querySelector('.register') as HTMLDivElement;
	const username_input = document.querySelector('.register .username_input') as HTMLInputElement;
	const password_input = document.querySelector('.register .password_input') as HTMLInputElement;
	const password_repeat_input = document.querySelector('.register .password_repeat_input') as HTMLInputElement;
	const back_button = document.querySelector('.register .back_button') as SVGElement;
	const register_button = document.querySelector('.register .register_button') as SVGElement;

	function valid_inputs()
	{
		if (username_input.value.length < 3)
			inactive_button('.register .register_button');

		else if (password_input.value.length < 3)
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
		if (username_input.value.length < 3)
			inactive_button('.login .login_button');

		else if (password_input.value.length < 3)
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
		UserConnection.delete_account();
		set_visible('.loading');
	});
}

export function user_menu_events()
{
	register_login_events();
	register_events();
	login_events();
	account_events();
}
