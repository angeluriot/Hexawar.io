// Load user's data if he has any
function load_cookie_data(name_input, color_picker, color_div)
{
	let cookie = get_cookie();

	if (cookie.name != "")
	{
		name_input.value = cookie.name;
		color_picker.value = cookie.color;
		color_div.style.backgroundColor = cookie.color;
	}
}

// Create cookie with user's name and color
function create_cookie(user)
{
	let date = new Date(2032, 1, 1);
	let value = `name=${ user.name },color=${ user.color }`;
	let expires = "; expires=" + date.toUTCString();
	document.cookie = "user=" + value + expires + "; path=/;";
}

// Get cookie data
function get_cookie()
{
	let s = document.cookie;
	let name = s.substr(0, s.lastIndexOf(",color")).substr(s.indexOf("name=") + 5);
	let color = s.substr(s.lastIndexOf("color=") + 6);

	return {
		name: name,
		color: color
	};
}

// Erase user's data
function erase_cookie()
{
	document.cookie = 'user=; path=/; expires=Thu, 01 Jan 2000 00:00:01 GMT;';
}
