const { Server } = require('socket.io');

const clients = new Map();

module.exports = function (httpServer) {
	const socketServer = new Server(httpServer);

	socketServer.on('connection', socket => {
		clients.set(socket.id, socket);

		socket.on('disconnect', () => {
			clients.delete(socket.id);
		});

		// if there are two clients, emit the peerId event
		// share the id1 with id2 and id2 with id1
		if (clients.size === 2) {
			const peerIds = Array.from(clients.keys());
			clients.get(peerIds[0]).emit('peerId', peerIds[1]);
			clients.get(peerIds[1]).emit('peerId', peerIds[0]);
		}
	});
};
