const peer = new Peer();

let g_conn = null;

peer.on('open', id => {
	console.log('ID: ' + id);
});

peer.on('connection', conn => {
	console.log('Connected to: ' + conn.peer);

	conn.on('open', () => {
		console.log('Connection open');

		conn.on('data', data => {
			console.log('Received', data);
		});

		conn.send('Hello from the other side!');
	});
});

const connectButton = document.querySelector('#connect');
const peerIdInput = document.querySelector('#peer-id');

connectButton.addEventListener('click', () => {
	const peerId = peerIdInput.value;
	if (!peerId) return;

	g_conn = peer.connect(peerId);

	g_conn.on('open', () => {
		console.log('Connection open');

		g_conn.on('data', data => {
			console.log('Received', data);
		});
	});
});

const messageInput = document.querySelector('#message');
const sendButton = document.querySelector('#send');

sendButton.addEventListener('click', () => {
	const message = messageInput.value;
	if (!message) return;

	g_conn.send(message);
});
