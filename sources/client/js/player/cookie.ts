import { Player } from './player.js';

// Load player's data if he has any
export function load_cookie_data(name_input: HTMLInputElement, color_picker: HTMLInputElement, color_div: HTMLDivElement)
{
	let cookie = get_cookie();

	if (cookie != null)
	{
		name_input.value = cookie.nickname;
		color_picker.value = cookie.color;
		color_div.style.backgroundColor = cookie.color;
	}
}

// Create cookie with player's name and color
export function create_cookie()
{
	let date = new Date(2100, 1, 1);
	let value = 'nickname=' + encodeURIComponent(Player.nickname) + ',color=' + encodeURIComponent(Player.color);
	let expires = '; expires=' + date.toUTCString();
	document.cookie = 'player=' + value + expires + '; Secure' + '; path=/;';
}

// Get cookie data
export function get_cookie()
{
	let cookies = document.cookie.split(';');
	let player = '';

	for (let i = 0; i < cookies.length; i++)
		if (cookies[i].includes('player='))
			player = cookies[i];

	if (player == '')
		return null;

	let nickname = decodeURIComponent(player.substring(0, player.lastIndexOf(',color')).substring(player.indexOf('nickname=') + 9));
	let color = decodeURIComponent(player.substring(player.lastIndexOf('color=') + 6));

	return {
		nickname: nickname,
		color: color
	};
}
