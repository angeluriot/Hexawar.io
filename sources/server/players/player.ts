import { Socket } from 'socket.io';
import * as Utils from '../utils/utils.js';
import { UserInterface } from '../../models/user.js';
import { ServerSocket } from '../properties.js';
import { Bot } from '../bots/bot.js';

export class Player
{
	socket: Socket;
	nickname: string;
	color: string;
	skin_id: number;
	size: number;
	max_size: number;
	conquered_lands: number;
	user: UserInterface | null;
	static list: Player[] = [];
	last_message: number;
	latency: number;

	constructor(socket: Socket)
	{
		this.socket = socket;
		this.nickname = '';
		this.color = '';
		this.skin_id = -1;
		this.size = 0;
		this.max_size = 0;
		this.conquered_lands = 0;
		this.user = null;
		this.last_message = Date.now();
		this.latency = 0;
	}

	// Verify if current player is playing
	is_playing() {
		return Player.list.includes(this);
	}


	// Handle player connection
	join() {
		if (!this.is_playing()) {
			if (this.user != null) {
				for (let player of Player.list) {
					if (player.user != null && player.user.username == this.user.username)
						return false;
				}
			}
			console.log('[' + new Date().toTimeString().split(' ')[0] + '] Spawned player (' + this.socket.conn.remoteAddress + ') : ' + this.nickname);
			Player.list.push(this);

			if (Bot.nb_bots > Bot.max_nb_bots - Player.list.length)
				Bot.kill_oldest();

			return true;
		}

		return false;
	}

	// Handle player disconnection
	leave()
	{
		if (this.is_playing())
		{
			console.log('[' + new Date().toTimeString().split(' ')[0] + '] Removed player (' + this.socket.conn.remoteAddress + ') : ' + this.nickname);
			const index = Player.list.indexOf(this);
			Player.list.splice(index, 1);

			if (this.user != null)
			{
				this.user.nickname = this.nickname;
				this.user.color = this.color;
				this.user.skin_id = this.skin_id;
				this.user.games_played++;
				this.user.conquered_lands += this.conquered_lands;

				if (this.max_size > this.user.highest_score)
					this.user.highest_score = this.max_size;

				this.user.total_score += this.max_size;
				this.user.xp += this.conquered_lands;

				while (this.user.xp >= Utils.get_required_xp(this.user.xp_level + 1) && this.user.xp_level < 100)
				{
					this.user.xp -= Utils.get_required_xp(this.user.xp_level + 1);
					this.user.xp_level++;

					if (this.user.xp_level % 10 == 0 && this.user.xp_level <= 100)
						this.user.skins.push((this.user.xp_level / 10) - 1);
				}

				this.user.save();
			}

			if (Bot.nb_bots < Bot.max_nb_bots - Player.list.length)
			{
				let bot = new Bot();
				bot.spawn();
			}
		}
	}

	// When a player dies
	die()
	{
		if (this.is_playing())
		{	
			this.leave();
			this.socket.emit(ServerSocket.DEATH, this.conquered_lands, this.max_size);
			console.log('[' + new Date().toTimeString().split(' ')[0] + '] Removed player (' + this.socket.conn.remoteAddress + ') : ' + this.nickname);
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
	static update_sizes(player_from: Player | Bot | null, player_to: Player | Bot | null)
	{
		if (player_from != player_to)
		{
			// Empty replace player
			if (player_from != null && player_to == null)
			{
				player_from.size--;

				if (player_from.size == 0 && !(player_from instanceof Bot))
					player_from.die();
			}

			// Player replace empty
			else if (player_from == null && player_to != null)
			{
				player_to.size++;

				if (player_to.size > player_to.max_size)
					player_to.max_size = player_to.size;

				//if (player_to.user != null)
				player_to.conquered_lands++;
			}

			// Player replace player
			else if (player_from != null && player_to != null)
			{
				player_from.size--;
				player_to.size++;

				if (player_to.size > player_to.max_size)
					player_to.max_size = player_to.size;

				//if (player_to.user != null)
				player_to.conquered_lands++;

				if (player_from.size == 0)
					player_from.die();
			}
		}
	}
}
