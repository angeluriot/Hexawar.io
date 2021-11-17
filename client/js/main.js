const socket = io();

// Join
socket.emit('join_game', prompt('Choose a nickname'));

window.onload = function()
{
	const user_list = document.getElementById('user_list');
	const chat_form = document.getElementById('chat_form');
	const messages = document.getElementById('messages');
	const message_list = document.getElementById('message_list');

	// Get user list
	socket.on('user_list', users =>
	{
		user_list.innerHTML = `${users.map(user => `<li>${user.name}</li>`).join('')}`;
	});

	// Message from server
	socket.on('message', message =>
	{
		message_list.innerHTML += `<li>${message.username} : ${message.message}</li>`;
		messages.scrollTop = messages.scrollHeight;
	});

	// Log from server
	socket.on('log', message =>
	{
		message_list.innerHTML += `<li>(${message})</li>`;
		messages.scrollTop = messages.scrollHeight;
	});

	// Message submit
	chat_form.addEventListener('submit', e =>
	{
		e.preventDefault();

		// Get message text
		const message = e.target.elements.input.value;

		// Emit message to server
		socket.emit('chat_message', message);

		// Clear input
		e.target.elements.input.value = '';
		e.target.elements.input.focus();
	});
}
