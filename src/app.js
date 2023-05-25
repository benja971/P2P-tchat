process.stdout.write('\033c');

const express = require('express');
const app = express();
const { createServer } = require('http');

const server = createServer(app);

const port = 8003;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/peer.js', (_, res) => {
	res.sendFile('/root/P2P-tchat/node_modules/peerjs/dist/peerjs.min.js');
});

app.get('/socket.io-client', (req, res) => {
	res.sendFile('/root/P2P-tchat/node_modules/socket.io-client/dist/socket.io.min.js');
});

app.use('/api', require('./router'));

server.listen(port, () => {
	console.log(`Server is listening on port ${port}`);
});
