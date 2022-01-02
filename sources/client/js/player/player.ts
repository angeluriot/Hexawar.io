import { Global } from '../properties.js';

export class Player
{
	static id = '';
	static nickname = '';
	static color = '';
	static skin_id = -1;
	static playing = false;

	static set_skin(skin_id: number)
	{
		const skin_div = document.querySelector('.skin_div') as HTMLDivElement;
		const skin_text = document.querySelector('.skin_true_text') as HTMLSpanElement;
		const skin_text_stroke = document.querySelector('.skin_text_stroke') as HTMLSpanElement;
		const color_div = document.querySelector('.color_div') as HTMLDivElement;

		Player.skin_id = skin_id;

		if (skin_id >= 0)
		{
			skin_text.style.color = 'white';
			skin_text_stroke.style.webkitTextStroke = `4.5px ${Global.skin_colors[Player.skin_id]}`;
			skin_div.style.backgroundImage = `url('resources/skins/skin_${skin_id}.svg')`;
			skin_div.style.border = `3px solid ${Global.skin_colors[Player.skin_id]}`;

			color_div.style.pointerEvents = 'none';
			color_div.style.opacity = '0.2';
		}

		else
		{
			skin_text.style.color = 'rgb(45, 47, 58)';
			skin_text_stroke.style.webkitTextStroke = '';
			skin_div.style.background = 'none';
			skin_div.style.border = '3px solid rgba(0, 0, 0, 0.08)';

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
