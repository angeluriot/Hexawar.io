// Properties
let users = [];

// Handle user connection
function user_join(user)
{
	users.push(user);
}

// Give a user from its id
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

// Give the list of users
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
