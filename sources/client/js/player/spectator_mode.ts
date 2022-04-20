import { ClientSocket, Global } from '../properties.js';
import { Camera } from '../renderer/camera.js';
import { Player } from './player.js';

export function events()
{
	const button_menu = document.querySelector('.spectator .svg_button') as SVGElement;
	const button_game = document.querySelector('.spectator_div .svg_button') as SVGElement;

	const spectator_div = document.querySelector('.spectator_div') as HTMLDivElement;
	const connect = document.querySelector('.connect_div') as HTMLDivElement;
	const leaderboard = document.querySelector('.leaderboard') as HTMLDivElement;

	button_menu.addEventListener('click', e =>
	{
		e.preventDefault();

		Player.spectator = true;

		spectator_div.style.visibility = 'visible';
		leaderboard.style.visibility = 'visible';

		connect.style.display = 'none';

		Global.socket.emit(ClientSocket.GRID_REQUEST);
	});

	button_game.addEventListener('click', e =>
	{
		e.preventDefault();
		setTimeout(() => { location.reload(); }, 100);
	});
}
