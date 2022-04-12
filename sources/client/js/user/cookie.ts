// Give the token from cookie
export function get_token()
{
	let cookies = document.cookie.split(';');
	let token = '';

	for (let i = 0; i < cookies.length; i++)
		if (!cookies[i].includes('player=') && cookies[i].includes('token='))
			token = cookies[i];

	if (token == '')
		return null;

	return decodeURIComponent(token.substring(token.indexOf('token=') + 6));
}

// Create token cookie
export function create_token_cookie(token: string, expiration: string)
{
	let value = 'token=' + encodeURIComponent(token);
	let expires = '; expires=' + expiration;
	document.cookie = value + expires + '; Secure' + '; path=/;';
}

// Erase the token cookie
export function erase_token_cookie()
{
	document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:01 UTC; ; Secure; path=/;';
}
