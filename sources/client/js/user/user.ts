export class User
{
	static id = '';
	static nickname = '';
	static color = '';
	static joined = false;

	static get_object()
	{
		return {
			id: User.id,
			nickname: User.nickname,
			color: User.color
		};
	}
}
