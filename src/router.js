const { Router } = require('express');
const stun = require('stun');
const dgram = require('dgram');

const router = Router();

const onlineMap = new Map(); // string -> string (id -> username)

// coturn url at turn.benjamin-niddam.dev
const turnUrl = 'turn.benjamin-niddam.dev';
const turnPort = 3478;

// auth options for coturn server
const authOptions = {
	auth: {
		username: 'test',
		password: 'test123',
	},
};

const softwareKey = 'SOFTWARE';

router.post('/online', async (req, res) => {
	const { username } = req.body;

	try {
		const stun_res = await stun.request(`${turnUrl}:${turnPort}`);
		const { address, port } = stun_res.getXorAddress();
		console.log(`STUN server address: ${address}:${port}`);
		onlineMap.set(username, `${address}:${port}`);
		console.log(onlineMap);

		res.status(201).send({ address, port });
	} catch (err) {
		console.log(err);
		res.status(500).send(err);
	}
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
