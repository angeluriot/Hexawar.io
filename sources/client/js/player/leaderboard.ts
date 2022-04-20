import { ServerSocket } from "../properties.js";
import { Global } from "../properties.js";
import { Player } from "./player.js";

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
			const admin_role = document.querySelector(`.leaderboard .admin_role.line_${i}`) as SVGGElement;
			const bot_role = document.querySelector(`.leaderboard .bot_role.line_${i}`) as SVGGElement;

			nickname.textContent = '';
			score.textContent = '';
			nickname.style.fill = '#ffffff';
			score.style.fill = '#ffffff';
			admin_role.style.opacity = '0';
			admin_role.style.fill = '#ffffff';
			bot_role.style.opacity = '0';
			bot_role.style.fill = '#ffffff';
		}

		const nickname = document.querySelector('.leaderboard .nickname.player_line') as SVGTextElement;
		const score = document.querySelector('.leaderboard .score.player_line') as SVGTextElement;
		const admin_role = document.querySelector(`.leaderboard .admin_role.player_line`) as SVGGElement;

		nickname.textContent = '';
		score.textContent = '';
		admin_role.style.opacity = '0';
	}

	function cut_nickname(element: string, as_role: boolean)
	{
		const max_length = as_role ? 180 : 230;
		let i = 0;
		let nickname = document.querySelector(element) as SVGTextElement;

		if (nickname.getComputedTextLength() > max_length)
		{
			while (nickname.getComputedTextLength() > max_length)
			{
				if (nickname.textContent != null)
				{
					if (i == 0)
						nickname.textContent = nickname.textContent.substring(0, nickname.textContent.length - 1) + '...';
					else
						nickname.textContent = nickname.textContent.substring(0, nickname.textContent.length - 4) + '...';
				}

				nickname = document.querySelector(element) as SVGTextElement;
				i++;
			}
		}
	}

	function update_role_position(role: SVGGElement, nickname: SVGTextElement)
	{
		let transform = role.getAttribute('transform');

		if (transform != null)
		{
			let translate = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(transform);

			if (translate != null)
				role.setAttribute('transform', `translate(${nickname.getComputedTextLength() + 22} ${translate[2]}) scale(0.13 0.13)`);
		}
	}

	Global.socket.on(ServerSocket.LEADERBOARD, (best_players: { id: string, nickname: string, size: number, admin: boolean, bot: boolean }[]) =>
	{
		clear();

		for (let i = 0; i < best_players.length && i < 10; i++)
		{
			const nickname = document.querySelector(`.leaderboard .nickname.line_${i + 1}`) as SVGTextElement;
			const score = document.querySelector(`.leaderboard .score.line_${i + 1}`) as SVGTextElement;
			const admin_role = document.querySelector(`.leaderboard .admin_role.line_${i + 1}`) as SVGGElement;
			const bot_role = document.querySelector(`.leaderboard .bot_role.line_${i + 1}`) as SVGGElement;

			nickname.textContent = `${i + 1}. ` + (best_players[i].nickname == '' ? 'Unnamed territory' : best_players[i].nickname);
			score.textContent = `${best_players[i].size}`;

			cut_nickname(`.leaderboard .nickname.line_${i + 1}`, best_players[i].admin || best_players[i].bot);

			if (best_players[i].admin)
			{
				const nickname_2 = document.querySelector(`.leaderboard .nickname.line_${i + 1}`) as SVGTextElement;
				update_role_position(admin_role, nickname_2);
				admin_role.style.opacity = '1';
			}

			else if (best_players[i].bot)
			{
				const nickname_2 = document.querySelector(`.leaderboard .nickname.line_${i + 1}`) as SVGTextElement;
				update_role_position(bot_role, nickname_2);
				bot_role.style.opacity = '1';
			}
		}

		let index = best_players.findIndex((player) => player.id == Global.socket.id);

		if (index != -1)
		{
			if (index > 9)
			{
				const nickname = document.querySelector('.leaderboard .nickname.player_line') as SVGTextElement;
				const score = document.querySelector('.leaderboard .score.player_line') as SVGTextElement;
				const admin_role = document.querySelector(`.leaderboard .admin_role.player_line`) as SVGGElement;

				nickname.textContent = `${index + 1}. ` + (best_players[index].nickname == '' ? 'Unnamed territory' : best_players[index].nickname);
				score.textContent = `${best_players[index].size}`;
				cut_nickname(`.leaderboard .nickname.player_line`, best_players[index].admin);

				if (best_players[index].admin)
				{
					update_role_position(admin_role, nickname);
					admin_role.style.opacity = '1';
				}

				set_height(11);
			}

			else
			{
				const nickname = document.querySelector(`.leaderboard .nickname.line_${index + 1}`) as SVGTextElement;
				const score = document.querySelector(`.leaderboard .score.line_${index + 1}`) as SVGTextElement;
				const admin_role = document.querySelector(`.leaderboard .admin_role.line_${index + 1}`) as SVGGElement;

				nickname.style.fill = '#F9A6AB';
				score.style.fill = '#F9A6AB';

				if (best_players[index].admin)
				{
					admin_role.style.fill = '#F9A6AB';
					update_role_position(admin_role, nickname);
					admin_role.style.opacity = '1';
				}

				set_height(Math.min(best_players.length, 10));
			}

			if ((index + 1) < Player.highest_rank)
				Player.highest_rank = index + 1;

			Player.score.push(best_players[index].size);
		}

		else
			set_height(Math.min(best_players.length, 10));
	});
}
