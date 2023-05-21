module.exports = {
	config: {
		iceServers: [
			{
				url: 'stun:stun.l.google.com:19302',
			},
			{
				url: 'turn:turn.benjamin-niddam.dev:3478',
				username: 'test',
				credential: 'test123',
			},
		],
	},
};
