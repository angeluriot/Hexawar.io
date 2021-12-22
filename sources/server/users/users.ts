import { User, UserInterface } from '../../models/user.js';

type Data = {
	username: string,
	nickname: string,
	color: string,
	skin_id: number,
	skins: number[],
	xp_level: number,
	xp: number,
	games_played: number,
	conquered_lands: number,
	highest_score: number,
	total_score: number
};

export function get_data(user: UserInterface): Data
{
	return {
		username: user.username,
		nickname: user.nickname,
		color: user.color,
		skin_id: user.skin_id,
		skins: user.skins,
		xp_level: user.xp_level,
		xp: user.xp,
		games_played: user.games_played,
		conquered_lands: user.conquered_lands,
		highest_score: user.highest_score,
		total_score: user.total_score
	};
}

export function get_user(username: string, then_function?: ((user: UserInterface) => any), catch_function?: ((error: any) => any))
{
	User.findOne({ username: username }).then((user: UserInterface) =>
	{
		if (then_function != undefined)
			then_function(user);
	}).catch((error: any) =>
	{
		if (catch_function != undefined)
			catch_function(error);
	});
}

export function add_user(username: string, hashed_password: string, then_function?: ((user: UserInterface) => any), catch_function?: ((error: any) => any))
{
	const user = new User({
		username: username,
		hashed_password: hashed_password
	});

	user.save().then((user: UserInterface) =>
	{
		if (then_function != undefined)
			then_function(user);
	}).catch((error: any) =>
	{
		if (catch_function != undefined)
			catch_function(error);
	});
}

export function remove_user(username: string, then_function?: ((user: UserInterface) => any), catch_function?: ((error: any) => any))
{
	User.findOneAndRemove({ username: username }).then((user: UserInterface) =>
	{
		if (then_function != undefined)
			then_function(user);
	}).catch((error: any) =>
	{
		if (catch_function != undefined)
			catch_function(error);
	});
}
