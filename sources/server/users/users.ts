import { Global } from '../properties.js';

export class User
{
	id: string;
	nickname: string;
	color: string;
	size: number;
	static list: User[] = [];

	constructor(id: string, nickname: string, color: string, size: number)
	{
		this.id = id;
		this.nickname = nickname;
		this.color = color;
		this.size = size;
	}

	// Handle user connection
	static user_join(user: User)
	{
		User.list.push(user);
	}

	// Give a user from its id
	static get_user(id: string)
	{
		let user = User.list.find(user => user.id == id);

		if (user == undefined)
			return null;

		return user;
	}

	// Handle user disconnection
	static user_leave(id: string)
	{
		const index = User.list.findIndex(user => user.id == id);

		if (index != -1)
			return User.list.splice(index, 1)[0];
		else
			return null;
	}

	// When a player dies
	static death(socket_id: string)
	{
		User.user_leave(socket_id);
		Global.io.to(socket_id).emit('death');
	}

	// Update user sizes
	static update_sizes(user_from_id: string, user_to_id: string)
	{
		if (user_from_id != user_to_id)
		{
			let user_from = User.get_user(user_from_id);
			let user_to = User.get_user(user_to_id);

			// Empty replace user
			if (user_from != null && user_to == null)
			{
				user_from.size--;

				if (user_from.size == 0)
					User.death(user_from.id);
			}

			// User replace empty
			else if (user_from == null && user_to != null)
				user_to.size++;

			// User replace user
			else if (user_from != null && user_to != null)
			{
				user_from.size--;
				user_to.size++;

				if (user_from.size == 0)
					User.death(user_from.id);
			}
		}
	}
}
