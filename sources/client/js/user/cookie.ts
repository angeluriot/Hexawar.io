import { User } from '../user/user.js';

// Load user's data if he has any
export function load_cookie_data(name_input: HTMLInputElement, color_picker: HTMLInputElement, color_div: HTMLDivElement)
{
	let cookie = get_cookie();

	if (cookie.nickname != "")
	{
		name_input.value = cookie.nickname;
		color_picker.value = cookie.color;
		color_div.style.backgroundColor = cookie.color;
	}
}

// Create cookie with user's name and color
export function create_cookie()
{
	let date = new Date(2032, 1, 1);
	let value = `nickname=${ User.nickname },color=${ User.color }`;
	let expires = "; expires=" + date.toUTCString();
	document.cookie = "user=" + value + expires + "; path=/;";
}

// Get cookie data
export function get_cookie()
{
	let s = document.cookie;
	let nickname = s.substr(0, s.lastIndexOf(",color")).substr(s.indexOf("nickname=") + 9);
	let color = s.substr(s.lastIndexOf("color=") + 6);

	return {
		nickname: nickname,
		color: color
	};
}

// Erase user's data
export function erase_cookie()
{
	document.cookie = 'user=; path=/; expires=Thu, 01 Jan 2000 00:00:01 GMT;';
}
