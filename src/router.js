const { Router } = require('express');
const { StunMessage, StunAttributeUsername, StunAttributeSoftware } = require('node-turn');
const dgram = require('dgram');

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

const softwareKey = 'SOFTWARE';

router.post('/online', async (req, res) => {
	const { peerId, username } = req.body;
	onlineMap.set(peerId, username);

	// init stun message
	const stunMessage = new StunMessage();

	// add username attribute
	const usernameAttribute = new StunAttributeUsername(username);
	stunMessage.addAttribute(usernameAttribute);

	// add software attribute
	const softwareAttribute = new StunAttributeSoftware(softwareKey, '1.0.0');
	stunMessage.addAttribute(softwareAttribute);

	// encode stun message
	const stunMessageBuffer = stunMessage.toBuffer();

	// init udp socket
	const udpSocket = dgram.createSocket('udp4');

	// send flux allocation request
	udpSocket.send(stunMessageBuffer, 0, stunMessageBuffer.length, 3478, turnUrl, err => {
		if (err) {
			console.error(err);
			udpSocket.close();
			res.sendStatus(500);
		}
	});

	// listen for flux allocation response
	udpSocket.on('message', message => {
		const stunMessage = StunMessage.fromBuffer(message);

		const allocatedAddress = stunMessage.getAttribute(StunAttribute.AllocateAddress).value;
		const allocatedIP = allocatedAddress.address;
		const allocatedPort = allocatedAddress.port;

		console.log({ allocatedIP, allocatedPort });

		udpSocket.close();
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
