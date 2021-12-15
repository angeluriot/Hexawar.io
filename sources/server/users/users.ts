import { User } from '../../models/user.js';

export function get_user(username: string, then_function?: ((user: any) => any), catch_function?: ((error: any) => any))
{
	User.findOne({ username: username }).then((user: any) =>
	{
		if (then_function != undefined)
			then_function(user);
	}).catch((error: any) =>
	{
		if (catch_function != undefined)
			catch_function(error);
	});
}

export function add_user(username: string, hashed_password: string, then_function?: ((user: any) => any), catch_function?: ((error: any) => any))
{
	const user = new User({
		username: username,
		hashed_password: hashed_password,
		data: username + '\'s data'
	});

	user.save().then((user: any) =>
	{
		if (then_function != undefined)
			then_function(user);
	}).catch((error: any) =>
	{
		if (catch_function != undefined)
			catch_function(error);
	});
}

export function remove_user(username: string, then_function?: ((user: any) => any), catch_function?: ((error: any) => any))
{
	User.findOneAndRemove({ username: username }).then((user: any) =>
	{
		if (then_function != undefined)
			then_function(user);
	}).catch((error: any) =>
	{
		if (catch_function != undefined)
			catch_function(error);
	});
}
