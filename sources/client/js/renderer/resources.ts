import { Global } from "../properties.js";

export function load(next_function: (() => any))
{
	const nb_skins = 1;
	let nb_skins_loaded = 0;

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

	// Skin 0
	Global.skins[0].src = '../../resources/skins/skin_0.svg';
	Global.skin_colors.push('#052927');
}
