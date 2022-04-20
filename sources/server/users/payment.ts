import { Player } from '../players/player.js';
import { ClientSocket, Global, ServerSocket } from '../properties.js';
import { config } from 'dotenv';
import Stripe from 'stripe';

config();

const stripe = new Stripe(process.env.STRIPE_SECRET == undefined ? '' : process.env.STRIPE_SECRET, {
	apiVersion: '2020-08-27',
});

async function check_payment(player: Player, session_id: string, skin_id: number)
{
	if (player.user != null)
	{
		let session = await stripe.checkout.sessions.retrieve(session_id);

		while (session.status == 'open')
		{
			await new Promise(r => setTimeout(r, 1000));
			session = await stripe.checkout.sessions.retrieve(session_id);
		}

		for (let i = 0; i < 10; i++)
		{
			await new Promise(r => setTimeout(r, 5000));
			session = await stripe.checkout.sessions.retrieve(session_id);

			if (session.payment_status == 'paid' && player.user != null)
			{
				console.log('[' + new Date().toTimeString().split(' ')[0] + '] --- Buyed skin ! (' + player.socket.conn.remoteAddress + ') : ' + skin_id);
				player.user.skins.push(skin_id);
				player.user.save();
				break;
			}
		}
	}
}

export function buy_skin_events(player: Player)
{
	player.socket.on(ClientSocket.PAYMENT, async (skin_id: number) =>
	{
		if (player.user != null && skin_id >= Global.nb_veteran_skins && skin_id < Global.nb_veteran_skins + Global.nb_premium_skins &&
			!player.user.skins.includes(skin_id))
		{
			const session = await stripe.checkout.sessions.create({
				line_items: [
					{
						price: 'price_1KoWUuGdV4AncmDJ5kRc2QR6',
						quantity: 1,
					},
				],
				client_reference_id: player.user.id,
				mode: 'payment',
				success_url: `${process.env.DOMAIN}`,
				cancel_url: `${process.env.DOMAIN}`,
				automatic_tax: { enabled: true },
			});

			player.socket.emit(ServerSocket.PAYMENT_SESSION, session.url);
			check_payment(player, session.id, skin_id);
		}
	});
}
