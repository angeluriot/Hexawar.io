import { Player } from '../players/player.js';

// Load player's data if he has any
export function load_cookie_data(name_input: HTMLInputElement, color_picker: HTMLInputElement, color_div: HTMLDivElement)
{
	let cookie = get_cookie();

	if (cookie.nickname != '')
	{
		name_input.value = cookie.nickname;
		color_picker.value = cookie.color;
		color_div.style.backgroundColor = cookie.color;
	}
}

// Create cookie with player's name and color
export function create_cookie()
{
	delete_cookie();

	let date = new Date(2032, 1, 1);
	let value = `nickname=${ Player.nickname },color=${ Player.color }`;
	let expires = '; expires=' + date.toUTCString();
	document.cookie = 'player=' + value + expires + '; Secure' + '; path=/;';
}

// Get cookie data
export function get_cookie()
{
	let s = document.cookie;
	let nickname = s.substring(0, s.lastIndexOf(',color')).substring(s.indexOf('nickname=') + 9);
	let color = s.substring(s.lastIndexOf('color=') + 6);

	return {
		nickname: nickname,
		color: color
	};
}

// Erase player's data
export function delete_cookie()
{
	document.cookie = 'player=; path=/; expires=Thu, 01 Jan 2000 00:00:01 GMT;';
}
