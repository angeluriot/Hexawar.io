import { Global } from "../properties.js";

export function load(next_function: (() => any))
{
	const nb_skins = 10;
	let nb_skins_loaded = 0;

	Global.arrow = new Image();

	function counter()
	{
		nb_skins_loaded++;

		if (nb_skins_loaded == nb_skins)
			next_function();
	}

	for (let i = 0; i < nb_skins; i++)
	{
		Global.skins.push(new Image());

		Global.skins[i].onload = (e: Event) =>
		{
			counter();
		};
	}

	// Arrow
	Global.arrow.src = '../../resources/shapes/arrow.svg';

	// Skin 0
	Global.skins[0].src = '../../resources/skins/skin_0.svg';
	Global.skin_colors.push('#4e2d18');

	// Skin 1
	Global.skins[1].src = '../../resources/skins/skin_1.svg';
	Global.skin_colors.push('#540010');

	// Skin 2
	Global.skins[2].src = '../../resources/skins/skin_2.svg';
	Global.skin_colors.push('#000000');

	// Skin 3
	Global.skins[3].src = '../../resources/skins/skin_3.svg';
	Global.skin_colors.push('#441109');

	// Skin 4
	Global.skins[4].src = '../../resources/skins/skin_4.svg';
	Global.skin_colors.push('#283309');

	// Skin 5
	Global.skins[5].src = '../../resources/skins/skin_5.svg';
	Global.skin_colors.push('#003aad');

	// Skin 6
	Global.skins[6].src = '../../resources/skins/skin_6.svg';
	Global.skin_colors.push('#211917');

	// Skin 7
	Global.skins[7].src = '../../resources/skins/skin_7.svg';
	Global.skin_colors.push('#222223');

	// Skin 8
	Global.skins[8].src = '../../resources/skins/skin_8.svg';
	Global.skin_colors.push('#1c0002');

	// Skin 9
	Global.skins[9].src = '../../resources/skins/skin_9.svg';
	Global.skin_colors.push('#052927');
}
