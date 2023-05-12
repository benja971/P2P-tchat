process.stdout.write('\033c');

const express = require('express');
const app = express();
const { createServer } = require('http');

const server = createServer(app);

app.use(express.static('public'));

app.get('/socket.io', (req, res) => {
	res.sendFile('C:/Users/BenjaminN/OneDrive/Fac/M1/PJI/P2P-tchat/node_modules/socket.io/client-dist/socket.io.js');
});

app.get('/peer.js', (req, res) => {
	res.sendFile('C:/Users/BenjaminN/OneDrive/Fac/M1/PJI/P2P-tchat/node_modules/peerjs/dist/peerjs.min.js');
});

const port = 8080;
server.listen(port, () => {
	console.log(`Server is listening on port ${port}`);
});
