import { Socket } from 'socket.io';

export class Player
{
	socket: Socket;
	nickname: string;
	color: string;
	size: number;
	playing: boolean;
	static list: Player[] = [];

	constructor(socket: Socket, nickname: string, color: string, size: number)
	{
		this.socket = socket;
		this.nickname = nickname;
		this.color = color;
		this.size = size;
		this.playing = false;
	}

	// Handle player connection
	join()
	{
		if (!this.playing)
		{
			Player.list.push(this);
			this.playing = true;
		}
	}

	// Handle player disconnection
	leave()
	{
		if (this.playing)
		{
			const index = Player.list.indexOf(this);
			this.playing = false;

			if (index != -1)
				Player.list.splice(index, 1);
		}
	}

	// When a player dies
	die()
	{
		if (this.playing)
		{
			this.leave();
			this.socket.emit('die');
		}
	}

	// Give a player from its id
	static get(id: string)
	{
		let player = Player.list.find(player => player.socket.id == id);

		if (player == undefined)
			return null;

		return player;
	}

	// Update player sizes
	static update_sizes(player_from: Player | null, player_to: Player | null)
	{
		if (player_from != player_to)
		{
			// Empty replace player
			if (player_from != null && player_to == null)
			{
				player_from.size--;

				if (player_from.size == 0)
					player_from.die();
			}

			// Player replace empty
			else if (player_from == null && player_to != null)
				player_to.size++;

			// Player replace player
			else if (player_from != null && player_to != null)
			{
				player_from.size--;
				player_to.size++;

				if (player_from.size == 0)
					player_from.die();
			}
		}
	}
}
