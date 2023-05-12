<!-- L'objectif est de réaliser une application de tchat en peer to peer avec nodejs
J'utilise le module socket.io pour les sockets et express pour le serveur.
 -->

[11/05]

-   serveur qui répertorie l'ip des utilisateurs qui se connectent
    -   avec ces ips, j'ai tenté de de créer une liaison entre les utilisateurs en utilisant les sockets

```sequence
Client1->Server: connection (saving ip)
Client2->Server: connection (saving ip)

Server --> Client1: Client2's ip
Client1 -> Client2: Create a socket between
Client2 -> Client1: bi-directional connection
```

```ts
this.io.on('connection', (socket: Socket) => {
	this.usersMap.set(socket.id, socket);
	this.ipsMap.set(socket.id, socket.handshake.address);

	const nbUsers = this.usersMap.size;
	if (nbUsers === 2) {
		console.log('2 users connected');

		const ids = Array.from(this.usersMap.keys());

		const id1 = ids[0];
		const id2 = ids[1];

		const ip1 = this.ipsMap.get(id1);
		const ip2 = this.ipsMap.get(id2);

		this.io.to(id1).emit('ip', ip2);
		this.io.to(id2).emit('ip', ip1);
	}
	socket.on('disconnect', () => {
		this.usersMap.delete(socket.id);
		this.ipsMap.delete(socket.id);
	});
});
```

J'envoie à chacun l'ip de l'autre, les clients peuvent ensuite utiliser cette adresse IP pour se connecter directement en utilisant des sockets.

### Piste à étudier

Une fois que les deux parties ont l'ip de l'autre, je vais utiliser une approche basée sur les **WebRTC (Web Real-Time Communication)** qui permet aux navigateurs et aux applications de se connecter directement entre eux.

Voici les étapes principales pour mettre en place une communication P2P entre les clients :

1. Les clients doivent **échanger leurs adresses IP publiques** via un canal de signalisation tiers.
2. Chaque client utilise les informations d'adresse IP reçues pour établir une connexion directe avec l'autre client en utilisant **WebRTC**.
3. Une fois la connexion établie, les clients peuvent échanger des données directement entre eux via le **canal P2P** sans passer par un serveur centralisé.

La mise en œuvre complète de la communication P2P avec WebRTC est complexe et nécessite une connaissance approfondie de WebRTC et des technologies associées. Voici quelques composants clés à prendre ne compte :

1. Configuration des connexions ICE (Interactive Connectivity Establishment) pour gérer les problèmes de NAT et permettre aux clients de trouver des chemins de connectivité entre eux.

2. Mise en place d'un échange d'offres (offer) et de réponses (answer) pour établir la connexion WebRTC.

3. Configuration des canaux de données pour permettre l'échange de messages et de données entre les clients connectés.

### Problèmes à prévoir

la mise en place d'une communication P2P sans serveur centralisé peut être plus complexe en raison des **problèmes de connectivité réseau** et des **configurations nécessaires pour contourner les pare-feux et les routeurs**.

### Piste à étudier

Configuration des réflexions **STUN (Session Traversal Utilities for NAT)** : Les serveurs **STUN** aident à déterminer les adresses IP et les ports des clients depuis l'extérieur d'un réseau. Les clients peuvent interroger un serveur STUN pour obtenir leurs adresses publiques, ce qui est utile pour établir des connexions P2P.

Ces techniques peuvent être mises en œuvre en utilisant des bibliothèques ou des frameworks WebRTC existants, tels que **SimpleWebRTC**, **PeerJS** ou **SkyWay**, qui fournissent des abstractions et des fonctionnalités pour gérer les problèmes

[12/05]

Changement de méthode, au lieu d'utiliser `socket.io`, j'utilise `PeerJS` qui est une librairie qui permet de créer des connexions peer to peer entre les clients. Lors du lancement de l'application, chaque client reçois un id unique qui lui permet de se connecter à un autre client. Le but étant simplement de prouver la faisabilité de la communication entre les clients, je me contente d'afficher l'id de chaque client, de le copier et de le coller dans l'autre client pour établir la connexion. Une fois la connexion établie, les clients peuvent s'envoyer des messages.

Cela n'a été testé que sur le réseau local, je ne sais pas si cela fonctionne sur internet.

```js
const peer = new Peer();
let g_conn;

// Show this peer's ID.
peer.on('open', id => {
	console.log('ID: ' + id);
});

// Await connections from others
peer.on('connection', conn => {
	g_conn = conn;

	conn.on('data', data => {
		// Will print the message
		console.log(data);
	});
});

// Connect to a peer
sendButton.addEventListener('click', () => {
	const message = messageInput.value;
	if (!message) return;

	g_conn.send(message);
});
```

Le serveur n'est la que pour servir la page html et les fichiers js.

```js
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
```

![working demo](./repport/assets/PeerJS%20POC.png)
