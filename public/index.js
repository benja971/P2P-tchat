let g_onlines = [];
const onlineHtml = document.getElementById('online-list');

let g_current_conn = null;

function showOnline() {
	// add new connected users
	onlineHtml.innerHTML = '';
	g_onlines.forEach(online => {
		const li = document.createElement('li');
		li.textContent = online.username;
		li.dataset.id = online.id;

		li.addEventListener('click', async () => {
			// start chatting

			g_current_conn?.close();

			g_current_conn = g_peer.connect(online.id);
			g_connectedPeers.set(online.id, g_current_conn);

			chatSection.removeAttribute('hidden');
		});

		onlineHtml.appendChild(li);
	});
}

chatForm.addEventListener('submit', event => {
	event.preventDefault();

	const message = chatInput.value;
	chatInput.value = '';

	const li = document.createElement('li');
	li.textContent = `You: ${message}`;
	chatHtml.appendChild(li);

	g_current_conn.send(message);
});

async function main(username) {
	setInterval(async () => {
		g_onlines = await getOnline(username);

		showOnline();
	}, 1500);
}
