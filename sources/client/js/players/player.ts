export class Player
{
	static id = '';
	static nickname = '';
	static color = '';
	static playing = false;

	static get_object()
	{
		return {
			id: Player.id,
			nickname: Player.nickname,
			color: Player.color
		};
	}
}
