const { Router } = require('express');
const dgram = require('dgram');
const net = require('net');

const router = Router();

const onlineMap = new Map(); // string -> string (id -> username)

// coturn url at turn.benjamin-niddam.dev
const turnUrl = 'turn.benjamin-niddam.dev';
const turnPort = 3478;

router.post('/online', async (req, res) => {
	const { username } = req.body;

	// connect to turn server
	const socket = dgram.createSocket('udp4');
	socket.connect(turnPort, turnUrl, () => {
		console.log('connected to turn server');
	});
});

router.get('/online', (req, res) => {
	const { username } = req.query;

	// send a list of {id: username}
	const onlineList = Array.from(onlineMap.entries())
		.map(([username, address]) => {
			return { username, address };
		})
		.filter(online => online.username !== username);

	res.json(onlineList);
});

router.delete('/online/:peerId', (req, res) => {
	const { peerId } = req.params;
	onlineMap.delete(peerId);
	res.sendStatus(204);
});

router.get('/turn-config', (_, res) => {
	const config = require('./turn.conf.js');
	res.json(config);
});

module.exports = router;
