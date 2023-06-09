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

Changement de méthode, au lieu d'utiliser `socket.io`, je n'utilise uniquement `PeerJS` qui est une librairie qui permet de créer des connexions peer to peer entre les clients. Lors du lancement de l'application, chaque client reçois un id unique qui lui permet de se connecter à un autre client. Le but étant simplement de prouver la faisabilité de la communication entre les clients, je me contente d'afficher l'id de chaque client, de le copier et de le coller dans l'autre client pour établir la connexion. Une fois la connexion établie, les clients peuvent s'envoyer des messages.

Cela n'a été testé que sur le réseau local, je ne sais pas si cela fonctionne sur internet.

```js
const peer = new Peer();

let g_conn = null;

peer.on('open', id => {
	console.log('ID: ' + id);
});

peer.on('connection', conn => {
	console.log('Connected to: ' + conn.peer);

	conn.on('open', () => {
		console.log('Connection open');

		conn.on('data', data => {
			console.log('Received', data);
		});

		conn.send('Hello from the other side!');
	});
});

const connectButton = document.querySelector('#connect');
const peerIdInput = document.querySelector('#peer-id');

connectButton.addEventListener('click', () => {
	const peerId = peerIdInput.value;
	if (!peerId) return;

	g_conn = peer.connect(peerId);

	g_conn.on('open', () => {
		console.log('Connection open');

		g_conn.on('data', data => {
			console.log('Received', data);
		});
	});
});

const messageInput = document.querySelector('#message');
const sendButton = document.querySelector('#send');

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

![working demo](./report/assets/PeerJS%20POC.png)

### Pistes à étudier

-   COTURN : https://github.com/coturn/coturn
-   Continuer avec socket.io. Possibilité de créer des `rooms` coté serveur et de communiquer cette room id aux clients. Les clients peuvent ensuite se connecter à cette room et communiquer entre eux sans passer par le serveur (à vérifier). Ou bien tenter de créer une connexion directe entre les clients en utilisant les adresses IP publiques des clients. (ws://ip:port). Il faudra surement utiliser un serveur STUN pour récupérer les adresses IP publiques des clients. Et trouver un moyen de définir un port de communication pour chaque client.

[14/05]

Avec `Socket.io` j'ai mis en places des "clients-servers". Autrement dit, chaque client héberge un serveur qui permet aux autres clients de se connecter à lui. Cela permet de contourner le problème de la communication entre les clients. Cependant, cela ne fonctionne que sur le réseau local.

```js
// app.js
const express = require('express');
const app = express();
const { createServer } = require('http');

const server = createServer(app);

const port = parseInt(process.argv[2]) || 8080;
server.listen(port, () => {
	console.log(`Server is listening on port ${port}`);
	require('./io')(server, port);
});

// io.js
const { Server } = require('socket.io');

module.exports = function (httpServer, port) {
	const socketServer = new Server(httpServer);

	// client running on port 8080
	socketServer.on('connection', socket => {
		console.log('Client connected');

		socket.on('message', msg => {
			console.log('Message:', msg);
		});

		socket.emit('message', 'Hello from 8080');
	});

	if (port === 8080) return;

	// client running on port 8081
	const socket = require('socket.io-client')(`http://192.168.1.21:8080`, {
		transports: ['websocket'],
	});

	socket.on('connect_error', err => {
		console.log('Connection error:', err);
	});

	socket.on('connect_timeout', err => {
		console.log('Connection timeout:', err);
	});

	socket.on('connect', () => {
		console.log('Connected to socket server');

		socket.emit('message', 'Hello from 8081');

		socket.on('message', msg => {
			console.log('Message:', msg);
		});
	});
};
```

![working demo](./report/assets/Socket.io%20POC.png)

Le fait de devoir faire tourner serveur rend l'utilisation dans un navigateur impossible.

[15/05]

En train de bosser sur une version plus poussée du tchat p2p avec WebRTC. J'ai réussi à faire fonctionner la communication entre les clients sur le réseau local. Je suis en train de bosser sur la communication sur internet. Pour cela, j'utilise un serveur STUN/TURN. J'ai trouvé un serveur STUN/TURN gratuit sur internet : https://github.com/coturn/coturn. Je vais devoir le configurer pour qu'il fonctionne avec mon application. Pour ce faire, je vais setup un container docker avec le serveur STUN/TURN sur mon VPS (https://coturn.benjamin-niddam.dev). Je vais ensuite configurer mon application pour qu'elle utilise ce serveur STUN/TURN.

```js
const iceConfiguration = {
	iceServers: [
		{
			urls: 'turn:coturn.benjamin-niddam.dev:3478',
			username: 'benjamin',
			credential: 'coucou',
		},
	],
};

const peerConnection = new RTCPeerConnection(iceConfiguration);
```

[17/05]

nat hole punching
rfc turnstun

Je cherche encore et toujours à mettre en place une communication TCP "browser2browser". Mais il n'est pas possible de le faire entre des gens qui ne sont pas sur le même réseau. Peut être qu'il est possible de le faire avec un serveur STUN/TURN comme je l'ai fait avec WebRTC.

Installation de COTURN sur le VPS

[18/05]

Création d'un `turnserver.conf` pour configurer le serveur TURN.

```conf
# /etc/turnserver.conf

# STUN server port is 3478 for UDP and TCP, and 5349 for TLS.
# Allow connection on the UDP port 3478
listening-port=3478
# and 5349 for TLS (secure)
tls-listening-port=5349

# Require authentication
fingerprint
lt-cred-mech

# We will use the longterm authentication mechanism, but if
# you want to use the auth-secret mechanism, comment lt-cred-mech and
# uncomment use-auth-secret
# Check: https://github.com/coturn/coturn/issues/180#issuecomment-364363272
#The static auth secret needs to be changed, in this tutorial
# we'll generate a token using OpenSSL
# use-auth-secret
# static-auth-secret=replace-this-secret
# ----
# If you decide to use use-auth-secret, After saving the changes, change the auth-secret using the following command:
# sed -i "s/replace-this-secret/$(openssl rand -hex 32)/" /etc/turnserver.conf
# This will replace the replace-this-secret text on the file with the generated token using openssl.

# Specify the server name and the realm that will be used
# if is your first time configuring, just use the domain as name
server-name=benjamin-niddam.dev
realm=benjamin-niddam.dev

total-quota=100
stale-nonce=600

# Path to the SSL certificate and private key. In this example we will use
# the letsencrypt generated certificate files.
cert=/root/proxy/cert/benjamin-niddam.dev_ssl_certificate.cer
pkey=/root/proxy/cert/_.benjamin-niddam.dev_private_key.key

# Specify the allowed OpenSSL cipher list for TLS/DTLS connections
cipher-list="ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384"

# Specify the process user and group
proc-user=turnserver
proc-group=turnserver
```

Certificat SSL de benjamin-niddam.dev

Au lancement, je regarde les logs du serveur TURN pour voir si tout se passe bien et je vois que le serveur TURN écoute sur le port 3478.

![listening on port 3478](./report/assets/coturn%20listening%203478.png)

[23/05]

on cherche à mettre en place une solution de discussion p2p
on se rend compte qu avec la configuration de l internet moderne
c est pas vraiment possible à cause des NATs

c quoi le nat (
pourquoi
comment ca marche
en quoi ca nous bloque
)

Analyse d une solution de connection pair à pair malgré les NATs
on choisi d utiliser COTURN (solution opensource utilisée par de nombreux services aujourd hui)
c quoi coturn (objectifs, fonctionnement)
en annexe mettre le process de setup de coturn
avec les rfc apprendre à communiquer avec le serveur coturn
pour continuer en mode manuel

[04/06]

WebRTC

```sequence
Peer1 -> Signalization Server : share UUID
Peer2 -> Signalization Server : share UUID

Peer1 -> Signalization Server : ask for peer2 UUID
Signalization Server -> Peer1: peer2 UUID
Peer2 -> Signalization Server : ask for peer1 UUID
Signalization Server -> Peer2: peer1 UUID

Peer1 -> Peer2 : peer connection
Peer2 -> Peer1 : peer connection

Peer1 -> Peer2 : Message
Peer2 -> Peer1 : Message
```

\subsection{Récupération de l'adresse IP publique du client}

\paragraph{}
Pour pouvoir établir une connexion entre deux pairs, il faut que chaque pair connaisse l'adresse IP publique ainsi que le port utilisé par l'autre pair. Mais avant cela, il faut que chaque pair récupère son adresse IP publique afin
de la partager avec l'autre pair. Pour cela, il existe une solution (non unique) qui consiste à utiliser un service STUN qui permet de récupérer l'adresse IP publique du client ainsi qu'un port ouvert sur le pare-feu du client.

\subsection{Partage des adresses IP entre les deux pairs}

\paragraph{}
Une fois ces informations récupérées, chaque pair doit partager son adresse IP publique ainsi que le port ouvert sur son pare-feu avec l'autre pair. Cela peut être réalisé par l'intermédiaire d'un serveur de signalisation
ou d'un canal de communication préalablement établi, tel qu'un serveur centralisé ou un autre moyen de communication sécurisé.

\subsection{Création d'une connexion entre les deux pairs}

\paragraph{}
Une fois que chaque pair dispose de l'adresse IP publique et du port ouvert sur le pare-feu de l'autre pair, ils peuvent utiliser ces informations pour établir une connexion directe entre eux.

\subsection{Echange de données entre les deux pairs}

\paragraph{}
Une fois la connexion établie, les deux pairs peuvent s'échanger des données. Ces données peuvent être des messages textuels, des fichiers, des flux audio et vidéo, etc.
(Dans notre cas, nous nous intéressons uniquement aux messages textuels.)

Sockets

```sequence

Client1 -> STUN Server : ask public ip and port
STUN Server -> Client1 : public ip and port
Client1 -> Signalization Server : share public ip and port

Client2 -> STUN Server : ask public ip and port
STUN Server -> Client2 : public ip and port
Client2 -> Signalization Server : share public ip and port

Client1 -> Signalization Server : ask for client2 ip and port
Signalization Server -> Client1 : client2 ip and port

Client2 -> Signalization Server : ask for client1 ip and port
Signalization Server -> Client2 : client1 ip and port

Client1 -> Client2 : peer connection
Client2 -> Client1 : peer connection

Client1 -> Client2 : Message
Client2 -> Client1 : Message
```

Replace id by UUID in webrtc

sur le sequence webrtc U qi pour la flèche qui passe sur le signalisation server si la flèche ne s'y arrête pas

tcheck orthographe

varier le mot "pair" avec "noeud" ?

changer report en article ?

décentralisé != pair à pair (début)
"tel qu'un server" (retirer)
"faciliter les échanges "(retirer) s'arrêter à entre eux
solutions possibleS (p3)
il est souvent nécessaire (non: il est nécessaire)
Expliciter NAT à la première utilisation
arrêter le répéter NAT
2.2 expliciter le fait que le relai ne sert qu'à établir la connexion (pas à échanger des données)

(ip privée, port privé) -> (port publique)
relais pas derriere un nat
schema du nat hole punching (utilisation du relais pour établir la connexion)
il faut parler du role du relais (nous permettre de percer le nat)
les clients établissent une connexion avec le relai => "trou dans leur nat" => permet d'établir connexion directe
le relai ne sert qu'à établir la connexion
préciser ipv4


mettre 2.4 en premier (c quoi le nat)
puis pourquoi c'est chiant
les tiers
les solutions

pourquoi les NATs nous pourrissent la vie (ils ne permettent que des communications sortantes)
webSocket c'est pas bon car ca utilise un serveur web (donc pas de communication directe) ca ne resoud pas le probleme du nat
car c'est simplement un process qui listen en interne en qui n'est pas accessible depuis l'exterieur

parler du fait que j'ai lancé un serveur coturn 

citations rfc ??

https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/