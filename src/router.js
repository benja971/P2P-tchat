const { Router } = require('express');

const router = Router();

const onlineMap = new Map(); // string -> string (id -> username)

router.post('/online', (req, res) => {
	const { peerId, username } = req.body;
	onlineMap.set(peerId, username);

	console.log('onlineMap', onlineMap);

	res.sendStatus(201);
});

router.get('/online', (req, res) => {
	const { username } = req.query;

	// send a list of {id: username}
	const onlineList = Array.from(onlineMap.entries())
		.map(([id, username]) => {
			return { id, username };
		})
		.filter(online => online.username !== username);

	res.json(onlineList);
});

router.delete('/online/:peerId', (req, res) => {
	const { peerId } = req.params;
	onlineMap.delete(peerId);

	console.log('onlineMap', onlineMap);

	res.sendStatus(204);
});

router.get('/turn-config', (_, res) => {
	const config = require('./turn.conf.js');
	res.json(config);
});

module.exports = router;
