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
}
