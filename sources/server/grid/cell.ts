import { Player } from '../players/player.js';
import { Bot } from '../bots/bot.js';

export type Change = {
	i: number,
	j: number,
	color: string,
	skin_id: number,
	player: Player | Bot | null,
	nb_troops: number
};

export type ClientChange = {
	i: number,
	j: number,
	color: string,
	skin_id: number,
	player_id: string,
	nb_troops: number
};

export function to_client(change: Change): ClientChange
{
	return {
		i: change.i,
		j: change.j,
		color: change.color,
		skin_id: change.skin_id,
		player_id: (change.player == null ? '' : change.player instanceof Bot ? change.player.id as unknown as string : change.player.socket.id),
		nb_troops: change.nb_troops
	};
}

// A class that represents a cell of the grid
export class Cell
{
	color: string;
	skin_id: number;
	player: Player | Bot | null;
	nb_troops: number;

	// Contruct a cell
	constructor(color: string, skin_id: number, player: Player | null, nb_troops: number)
	{
		this.color = color;
		this.skin_id = skin_id;
		this.player = player;
		this.nb_troops = nb_troops;
	}
}

export type ClientCell = {
	color: string,
	skin_id: number,
	player_id: string,
	nb_troops: number;
};
