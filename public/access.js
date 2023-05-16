const accessSection = document.querySelector('#access');
const accessForm = document.querySelector('#access-form');
const usernameInput = document.querySelector('#username');
const chatSection = document.querySelector('#chat');
const chatForm = document.querySelector('#chat-form');
const chatInput = document.querySelector('#message');
const chatHtml = document.querySelector('#messages');

let g_peer = null;
const g_connectedPeers = new Map(); // string -> DataConnection

accessForm.addEventListener('submit', event => {
	event.preventDefault();

	const username = usernameInput.value;
	g_peer = new Peer();

	accessForm.reset();
	accessSection.setAttribute('hidden', '');

	g_peer.on('open', async peerId => {
		await postOnline(peerId, username);
		main(username);

		addEventListener('beforeunload', async () => {
			await deleteOnline(peerId);
			g_current_conn?.close();
		});
	});

	g_peer.on('connection', conn => {
		g_connectedPeers.set(conn.peer, conn);

		conn.on('data', data => {
			console.log('data', data);

			const li = document.createElement('li');
			const contact = g_onlines.find(online => online.id === conn.peer);
			li.textContent = `${contact.username}: ${data}`;
			chatHtml.appendChild(li);
		});

		conn.on('close', () => {
			g_connectedPeers.delete(conn.peer);
		});
	});
});
