import { Camera } from '../renderer/camera.js';
import { Player } from './player.js';

export function events() {
    const button_menu = document.querySelector('.spectator_menu .svg_button') as SVGElement;
    const button_game = document.querySelector('.spectator_game .svg_button') as SVGElement;

    const spectator_menu = document.querySelector('.spectator_menu') as HTMLDivElement;
    const spectator_game = document.querySelector('.spectator_game') as HTMLDivElement;
    const connect = document.querySelector('.connect_div') as HTMLDivElement;
    const leaderboard = document.querySelector('.leaderboard') as HTMLDivElement;

    button_menu.addEventListener('click', e =>
    {
        e.preventDefault();
        
        Player.spectator = true;
        Camera.init();
        
        spectator_menu.style.visibility = 'hidden';
        spectator_game.style.visibility = 'visible';
        leaderboard.style.visibility = 'visible';

        connect.style.display = 'none';
    });

    button_game.addEventListener('click', e =>
    {
        e.preventDefault();
        setTimeout(() => { location.reload(); }, 100);
    });
}
