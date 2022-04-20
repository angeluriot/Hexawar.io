import { Socket } from "socket.io";
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { promises, writeFile } from 'fs';
import { ClientSocket } from "../properties.js";

let blacklist: string[] = [];
let new_blacklist: string[] = [];

// Load ip's of banned players
async function read_users()
{
	await promises.readFile('./blacklist.txt', 'utf8').then(data => {
		blacklist.length = 0;
		data.split(/\r?\n/).forEach((line) => {
			blacklist.push(line);
		});
	});
}

// check if a player is banned
export function is_allowed(ip_address: string)
{
	return blacklist.indexOf(ip_address) == -1 && new_blacklist.indexOf(ip_address) == -1 ;
}

// ban a player
function add(ip_address: string)
{
	new_blacklist.push(ip_address);
}

// merge new_blacklist and write blacklist in text file
async function update_blacklist()
{
	let data: string = '';

	let unique = (element: string) => { if (blacklist.indexOf(element) == -1) blacklist.push(element); };

	new_blacklist.forEach(unique);

	for (let element of blacklist)
		if (element.length > 2)
			data += element + '\n';

	writeFile('./blacklist.txt', data, () => {});
}

// check player's actions
async function check_socket(socket: Socket, limiter: RateLimiterMemory)
{
	try {
		await limiter.consume(socket.handshake.address);
	} catch(rejRes) {
		add((socket.conn.remoteAddress != null) ? socket.conn.remoteAddress : '')
		socket.disconnect();
	}
}

// blacklist events
export function events(socket: Socket)
{
	// load the blacklist
	read_users();

	// limiter of gathering moves
	const moves_limiter = new RateLimiterMemory(
	{
		points: 10,
		duration: 1
	});

	// limiter of logins
	const login_limiter = new RateLimiterMemory(
	{
		points: 10,
		duration: 10
	});

	socket.on(ClientSocket.MOVES, async (_) => {
		check_socket(socket, moves_limiter);
	});

	socket.on(ClientSocket.LOGIN, async (_) => {
		check_socket(socket, login_limiter);
	});

	// save new blacklist
	setInterval(async () =>
	{
		await update_blacklist();
	}, 15000);
}
