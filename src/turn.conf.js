module.exports = {
	config: {
		iceServers: [

			{
				url: 'turn:turn.benjamin-niddam.dev:3478',
				username: 'test',
				credential: 'test123',
			},
			{
				url: 'stun:turn.benjamin-niddam.dev:3478',
				username: 'test',
				credential: 'test123',
			},
		],
	},
};
