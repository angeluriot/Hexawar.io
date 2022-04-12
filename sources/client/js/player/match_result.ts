import { Player } from './player.js';
import * as Utils from '../utils/utils.js';

// Draw player's score at the end of the game on the screen
function draw_score()
{
	const canvas = document.querySelector(".match_results .canvas") as HTMLCanvasElement;
	const context = canvas.getContext('2d') as CanvasRenderingContext2D;

	const x: number = canvas.width;
	const y: number = canvas.height;

	context.clearRect(0, 0, x, y);

	context.beginPath();
	context.lineTo(0, y);
	context.lineTo(x, y);
	context.lineTo(x, 0);
	context.lineTo(0, 0);
	context.closePath();
	context.fillStyle = '#f2f2f3';
	context.fill();

	context.beginPath();
	context.lineTo(0, y);

	for (let i = 0; i < Player.score.length; i++)
		context.lineTo(i / Player.score.length * x, (1. - Player.score[i] / Player.highest_score) * y * 0.9 + y * 0.1);

	context.lineTo(x, y);
	context.lineTo(0, y);
	context.closePath();
	context.fillStyle = Player.color;
	context.fill();
}

// Displays player's results
export function display_results()
{
	function format_two_digits(n: number)
	{
		return n < 10 ? '0' + n : n;
	}

	function time_format(d: Date)
	{
		let hours = format_two_digits(d.getHours() - 1);
		let minutes = format_two_digits(d.getMinutes());
		let seconds = format_two_digits(d.getSeconds());
		return hours + ":" + minutes + ":" + seconds;
	}

	const form_div = document.querySelector('.connect_div') as HTMLDivElement;
	const leaderboard = document.querySelector('.leaderboard') as HTMLDivElement;
	const match_results = document.querySelector('.match_results_div') as HTMLDivElement;

	form_div.style.display = 'none';
	leaderboard.style.display = 'none';
	match_results.style.visibility = 'visible';

	const stats_1 = document.querySelector('.match_results .stat_value_1') as HTMLSpanElement;
	const stats_2 = document.querySelector('.match_results .stat_value_2') as HTMLSpanElement;
	const stats_3 = document.querySelector('.match_results .stat_value_3') as HTMLSpanElement;
	const stats_4 = document.querySelector('.match_results .stat_value_4') as HTMLSpanElement;

	stats_1.innerText = Utils.add_spaces(Player.conquered_lands);
	stats_2.innerText = Utils.add_spaces(Player.highest_score);
	stats_3.innerText = Utils.add_spaces(Player.highest_rank);
	stats_4.innerText = time_format(new Date(Date.now() - Player.start_time));

	draw_score();

	const exit_button = document.querySelector('.match_results_button') as SVGElement;

	exit_button.addEventListener('click', e =>
	{
		e.preventDefault();
		setTimeout(() => { location.reload(); }, 500);
	});
}
