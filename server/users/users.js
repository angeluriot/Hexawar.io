const users = [];

// Handle user connection
function user_join(id, name)
{
	const user = { id, name };
	users.push(user);
	return user;
}

// Get user from id
function get_user(id)
{
	return users.find(user => user.id === id);
}

// Handle user disconnection
function user_leave(id)
{
	const index = users.findIndex(user => user.id === id);

	if (index !== -1)
		return users.splice(index, 1)[0];
	else
		return null;
}

function get_user_list()
{
	return users;
}

module.exports =
{
	user_join,
	get_user,
	user_leave,
	get_user_list
}
