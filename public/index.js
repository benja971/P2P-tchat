let g_onlines = [];
const onlineHtml = document.getElementById('online-list');

let g_current_conn = null;

function showOnline() {
	// add new connected users
	onlineHtml.innerHTML = '';
	g_onlines.forEach(online => {
		console.log(online);
		const li = document.createElement('li');
		li.textContent = online.username;
		li.dataset.address = online.address;

		li.addEventListener('click', async () => {
			const address = li.dataset.address;

			// const socket =
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
