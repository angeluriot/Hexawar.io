import { Global } from "../properties.js";

export function update_size()
{
	const leaderboard = document.querySelector(".leaderboard") as HTMLDivElement;
	const width = 312;
	const height = 324;
	const margin = 20;
	let size: number;

	if (window.innerWidth < window.innerHeight * (16 / 9))
		size = window.innerWidth;
	else
		size = window.innerHeight * (16 / 9);

	size /= 939 * (16 / 9);

	leaderboard.style.width = `${width * size}px`;
	leaderboard.style.height = `${height * size}px`;
	leaderboard.style.top = `${margin * size}px`;
	leaderboard.style.right = `${margin * size}px`;
}

export function update_leaderboard()
{
	update_size();

	function set_height(number: number)
	{
		const background = document.querySelector(".leaderboard_svg .background") as SVGRectElement;

		if (number == 11)
			background.height.baseVal.value = 324;
		else
			background.height.baseVal.value = (324 - 26) - (10 - number) * 23;
	}

	function clear()
	{
		for (let i = 1; i <= 10; i++)
		{
			const nickname = document.querySelector(`.leaderboard .nickname.line_${i}`) as SVGTextElement;
			const score = document.querySelector(`.leaderboard .score.line_${i}`) as SVGTextElement;

			nickname.textContent = '';
			score.textContent = '';
			nickname.style.fill = '#ffffff';
			score.style.fill = '#ffffff';
		}

		const nickname = document.querySelector('.leaderboard .nickname.player_line') as SVGTextElement;
		const score = document.querySelector('.leaderboard .score.player_line') as SVGTextElement;

		nickname.textContent = '';
		score.textContent = '';
	}

	function cut_nickname(element: string)
	{
		let nickname = document.querySelector(element) as SVGTextElement;

		if (nickname.getComputedTextLength() > 220)
		{
			while (nickname.getComputedTextLength() > 220)
			{
				if (nickname.textContent != null)
					nickname.textContent = nickname.textContent.substring(0, nickname.textContent.length - 1);

				nickname = document.querySelector(element) as SVGTextElement;
			}

			nickname.textContent = nickname.textContent + '...';
		}
	}

	Global.socket.on("leaderboard", (best_players: { id: string, nickname: string, size: number }[]) =>
	{
		clear();

		for (let i = 0; i < best_players.length && i < 10; i++)
		{
			const nickname = document.querySelector(`.leaderboard .nickname.line_${i + 1}`) as SVGTextElement;
			const score = document.querySelector(`.leaderboard .score.line_${i + 1}`) as SVGTextElement;
			const max_size = 220;

			nickname.textContent = `${i + 1}. ${best_players[i].nickname}`;
			score.textContent = `${best_players[i].size}`;

			cut_nickname(`.leaderboard .nickname.line_${i + 1}`);
		}

		let index = best_players.findIndex((player) => player.id == Global.socket.id);

		if (index != -1)
		{
			if (index > 9)
			{
				const nickname = document.querySelector('.leaderboard .nickname.player_line') as SVGTextElement;
				const score = document.querySelector('.leaderboard .score.player_line') as SVGTextElement;

				nickname.textContent = `${index + 1}. ${best_players[index].nickname}`;
				score.textContent = `${best_players[index].size}`;
				cut_nickname(`.leaderboard .nickname.player_line`);
				set_height(11);
			}

			else
			{
				const nickname = document.querySelector(`.leaderboard .nickname.line_${index + 1}`) as SVGTextElement;
				const score = document.querySelector(`.leaderboard .score.line_${index + 1}`) as SVGTextElement;

				nickname.style.fill = '#F9A6AB';
				score.style.fill = '#F9A6AB';

				set_height(Math.min(best_players.length, 10));
			}
		}

		else
			set_height(Math.min(best_players.length, 10));
	});
}
