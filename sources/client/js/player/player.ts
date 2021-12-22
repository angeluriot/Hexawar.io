export class Player
{
	static id = '';
	static nickname = '';
	static color = '';
	static skin_id = -1;
	static playing = false;

	static get_object()
	{
		return {
			id: Player.id,
			nickname: Player.nickname,
			color: Player.color,
			skin_id: Player.skin_id
		};
	}
}
