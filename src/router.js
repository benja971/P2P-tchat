const { Router } = require('express');
const axios = require('axios');
const fs = require('fs');

const router = Router();

const onlineMap = new Map(); // string -> string (id -> username)

// coturn url at turn.benjamin-niddam.dev
const turnUrl = 'https://turn.benjamin-niddam.dev';

// auth options for coturn server
const authOptions = {
	auth: {
		username: 'test',
		password: 'test123',
	},
};

// get turn config from coturn server
const getTurnConfig = async () => {
	const { data } = await axios.get(`${turnUrl}/api/turn`, authOptions);
	return data;
};

router.post('/online', async (req, res) => {
	const { peerId, username } = req.body;
	onlineMap.set(peerId, username);

	getTurnConfig()
		.then(turnConfig => {
			// Handle the retrieved TURN configuration
			console.log(turnConfig);
		})
		.catch(error => {
			// Handle any errors that occurred during the request
			console.error(error);
		});

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
