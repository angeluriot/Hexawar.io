import { Global } from '../properties.js';
import * as Shop from '../shop/menus.js';

export class Player
{
	static id = '';
	static nickname = '';
	static color = '';
	static skin_id = -1;
	static playing = false;
	static conquered_lands: number = 1;
	static highest_score: number = 1;
	static highest_rank: number = Number.MAX_SAFE_INTEGER;
	static start_time: number = Date.now();
	static score: number[] = [];
	static spectator = false;
	static last_move = { i: 0, j: 0 };

	static set_skin(skin_id: number)
	{
		const skin_hover = document.querySelector('.skin_div .skin_hover') as HTMLDivElement;
		const skin_border = document.querySelector('.skin_div .skin_border') as HTMLDivElement;
		const skin_text = document.querySelector('.skin_div .skin_true_text') as HTMLSpanElement;
		const skin_text_stroke = document.querySelector('.skin_div .skin_text_stroke') as HTMLSpanElement;
		const skin_background = document.querySelector('.skin_div .skin_background') as HTMLImageElement;
		const color_div = document.querySelector('.color_div') as HTMLDivElement;

		Shop.update_skin_button(Player.skin_id, false);

		Player.skin_id = skin_id;

		if (!Global.connected)
			Player.skin_id = -1;

		Shop.update_skin_button(Player.skin_id, true);

		if (Player.skin_id >= 0)
		{
			skin_text.style.color = 'white';
			skin_text_stroke.style.webkitTextStroke = `4.5px ${Global.skin_colors[Player.skin_id]}`;
			skin_background.src = `resources/skins/skin_${Player.skin_id}.svg`;
			skin_hover.style.visibility = 'visible';
			skin_border.style.border = `3px solid ${Global.skin_colors[Player.skin_id]}`;

			color_div.style.pointerEvents = 'none';
			color_div.style.opacity = '0.2';
		}

		else
		{
			skin_text.style.color = 'rgb(45, 47, 58)';
			skin_text_stroke.style.webkitTextStroke = '';
			skin_background.src = `resources/skins/empty.svg`;
			skin_hover.style.visibility = 'hidden';
			skin_border.style.border = '3px solid rgba(0, 0, 0, 0.08)';

			color_div.style.pointerEvents = 'all';
			color_div.style.opacity = '1';
		}
	}

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
