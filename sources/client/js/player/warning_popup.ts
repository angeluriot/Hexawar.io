import { Global } from '../properties.js';
import { delay } from '../utils/utils.js';
import { Player } from './player.js';

export async function show_popup()
{
	const warning_popup = document.querySelector('.warning_popup') as HTMLDivElement;
	warning_popup.style.visibility = 'visible';

	await delay(10000);

	warning_popup.style.visibility = 'hidden';
}