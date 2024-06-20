// TODO: Rename this file to server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const PORT = 3001; // Using port 3001 for WebSocket server

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"]
	}
});

/* HOW TO USE

In client-side code (pong/royal.jsx):
```
	useEffect((user) => {
		const socket = io(`https://${process.env.NEXT_PUBLIC_FQDN}:${process.env.NEXT_PUBLIC_WEBSOCKET_PORT}`);
		socket.emit('join', { gameType: 'pong2', userId: user.id, userAvatar: user.avatar });

		socket.on('connect', () => {
			console.log('Connected to websocket server');
		});
		socket.on('connect_error', (error) => {
			console.error('Connection error for websocket server:', error);
		});
		socket.on('disconnect', () => {
			console.log('Disconnected from websocket server');
		});

		function handleInput(event) {
			socket.emit('input', { gameType: 'pong2', input: { key: event.key, type: 'keydown' } });
		}

		// ...display code
```
*/

// Will contain all of our rooms
const rooms = {
	queue2: {},
	pong2: {},
	queue3: {},
	pong3: {},
	queueR: {},
	royal: {}
};

// Constants
const PONG2_NB_PLAYERS = 2;
const PONG3_NB_PLAYERS = 3;
const ROYAL_MIN_PLAYERS = 2;
const ROYAL_MAX_PLAYERS = 8;
const ROYAL_START_TIMEOUT = 30000; // 30 seconds

// TODO: Make client send gameType and maxPlayers in new message that will set the player's room
io.on('connection', socket => {
	console.log(`New client connected: ${socket.id}`);

	// DISCONNECT HANDLER
	socket.on('disconnect', () => {
		console.log(`Client disconnected: ${socket.id}`);
		removePlayerFromRoom(socket.id);
	});

	// JOIN HANDLER (https://transcendence.gmcg.fr:50581/test)
	socket.on('join', ({ gameType, userId, userELO, userAvatar }) => {
		// Sets queueType depending on gameType
		queueType = null;
		switch (gameType){
			case 'pong3':
				queueType = "queue3";
				break ;
			case 'royal':
				queueType = "queueR";
				break ;
			default:
				queueType = "queue2";
		}

		// Create queue if !queue and join it
		if (!findRoom(queueType, userELO))
			queue = createRoom(queueType, userELO);
		addPlayerToRoom(queue, socket, userId, userELO, userAvatar);

		room = null;
		while (playerInRoom(queueType, queue.id))
		{
			if (roomPlayerNb(queueType, queue.id) === 1 && !findRoom(gameType))
			{
				// io.to(socket.id).emit('info', { message: `creating` });
				room = createRoom(gameType, userELO);
				removePlayerFromQueue(queueType, queue.id, socket.id);
				addPlayerToRoom(room, socket, userId, userELO, userAvatar);
			}
			else
			{
				// io.to(socket.id).emit('info', { message: `joining` });
				room = findRoomElo(gameType, userELO);
				if (room)
				{
					io.to(socket.id).emit('info', { message: `found room ${room.id}` });
					removePlayerFromQueue(queueType, queue.id, socket.id);
					addPlayerToRoom(room, socket, userId, userELO, userAvatar);
				}
			}
		}
		io.to(socket.id).emit('info', { message: `left while` });

		//const room = findOrCreateRoom(gameType);
		// addPlayerToRoom(room, socket, userId, userELO, userAvatar);

		// DEBUG
		// io.to(socket.id).emit('info', { message: `You joined room ${room.id} [${gameType}]` });
		if (isRoomFull(gameType, room.id)) {
			io.to(room.id).emit('info', { message: `Room ${room.id} [${gameType}] is now full` });
		}

		// Set player as ready
		room.players[socket.id].ready = true;

		fillRoom(room, queueType);

		// Start game if it can be started
		checkGameStart(room, gameType);
	});

	// INPUT HANDLER
	// TODO: This is where the actual game logic will live :)
	socket.on('input', ({ gameType, input }) => {
		// Find current room of player
		const room = findRoomByPlayerId(gameType, socket.id);
		if (room) {
			// Broadcast input to all players in the room
			socket.to(room.id).emit('input', { playerId: socket.id, input });
		}
	});

	// Returns true if userELO matches roomELO, false if not
	function checkElo(room, userELO) {
		if ( !room.elo || (userELO <= (room.elo + 100) && userELO >= (room.elo - 100)) )
			return true;
		return false;
	}

	// Finds room if ther is one, null if not
	function findRoom(gameType) {
		// For all rooms in selected game type, return the first one that is not full
		for (const roomId in rooms[gameType]) {
			if (!isRoomFull(gameType, roomId) && !isRoomLaunched(gameType, roomId)) {
				return rooms[gameType][roomId];
			}
		}
		return null;
	}

	// Finds room matching elo if ther is one, null if not
	function findRoomElo(gameType, userELO) {
		for (const roomId in rooms[gameType]) {
			if (!isRoomFull(gameType, roomId) && !isRoomLaunched(gameType, roomId) && checkElo(rooms[gameType][roomId], userELO) ) {
				return rooms[gameType][roomId];
			}
		}
		return null;
	}

	// Returns true if room was created at least 10s ago
	function checkTimeStamp(room) {
		const now = Date.now();
		//io.to(socket.id).emit('info', { message: `check ${now - room.timeStamp}` });
		if (now - room.timeStamp >= 10000)
			return true;
		return false;
	}

	// // Finds room if ther is one, null if not
	// function findQueue(gameType) {
	// 	// For all queues, return the right one, null if not exists
	// 	if (gameType === "pong2" && rooms["queue2"]["$queue2$"])
	// 		return rooms["queue2"]["$queue2$"];
	// 	else if (gameType === "pong3" && rooms["queue3"]["$queue3$"])
	// 		return rooms["queue3"]["$queue3$"];
	// 	else if (gameType === "royal" && rooms["queueR"]["$queueR$"])
	// 		return rooms["queueR"]["$queueR$"];
	// 	else
	// 		return null;
	// }

	// // Creates a new queue based on gameType
	// function createQueue(gameType) {
	// 	switch (gameType) {
	// 		case 'pong3':
	// 			rooms["queue3"]["$queue3$"] = { id: "$queue3$", launched: false, maxPlayers: 1000, players: {} };
	// 			io.to(socket.id).emit('info', { message: `Room $queue3$ created` });
	// 			return rooms["queue3"]["$queue3$"];
	// 		case 'royal':
	// 			rooms["queueR"]["$queueR$"] = { id: "$queueR$", launched: false, maxPlayers: 1000, players: {} };
	// 			io.to(socket.id).emit('info', { message: `Room $queueR$ created` });
	// 			return rooms["queueR"]["$queueR$"];
	// 		default:
	// 			rooms["queue2"]["$queue2$"] = { id: "$queue2$", launched: false, maxPlayers: 1000, players: {} };
	// 			io.to(socket.id).emit('info', { message: `Room $queue2$ created` });
	// 			return rooms["queue2"]["$queue2$"];
	// 	}
	// }

	// Creates a room for the player
	function createRoom(gameType, userELO) {
		// Create a new room
		const now = Date.now();
		const newRoomId = generateRoomId(gameType);
		switch (gameType) {
			case 'queue2':
				rooms["queue2"]["$queue2$"] = { id: "$queue2$", launched: false, maxPlayers: 1000, timeStamp: now, players: {} };
				io.to(socket.id).emit('info', { message: `Room $queue2$ created` });
				return rooms["queue2"]["$queue2$"];
			case 'queue3':
				rooms["queue3"]["$queue3$"] = { id: "$queue3$", launched: false, maxPlayers: 1000, timeStamp: now, players: {} };
				io.to(socket.id).emit('info', { message: `Room $queue3$ created` });
				return rooms["queue3"]["$queue3$"];
			case 'queueR':
				rooms["queueR"]["$queueR$"] = { id: "$queueR$", launched: false, maxPlayers: 1000, timeStamp: now, players: {} };
				io.to(socket.id).emit('info', { message: `Room $queueR$ created` });
				return rooms["queueR"]["$queueR$"];
			case 'pong3':
				rooms[gameType][newRoomId] = { id: newRoomId, launched: false, maxPlayers: PONG3_NB_PLAYERS, timeStamp: now, players: {}, elo: userELO };
				break ;
			case 'royal':
				rooms[gameType][newRoomId] = { id: newRoomId, launched: false, maxPlayers: ROYAL_MAX_PLAYERS, timeStamp: now, players: {}, elo: userELO };
				break ;
			default:
				rooms[gameType][newRoomId] = { id: newRoomId, launched: false, maxPlayers: PONG2_NB_PLAYERS, timeStamp: now, players: {}, elo: userELO };
		}
		io.to(socket.id).emit('info', { message: `Room ${newRoomId} created, room elo ${userELO}` });
		//io.to(socket.id).emit('info', { message: `created at ${now}` });
		return rooms[gameType][newRoomId];
	}

	// Generates a new unique room ID
	function generateRoomId(gameType) {
		let newRoomId = '';
		do {
			newRoomId = Math.random().toString(36).substring(2, 11);
		} while (rooms[gameType][newRoomId]);
		return newRoomId;
	}

	// Runs while room is not full.
	// When timestamp goes over 10s, takes the nearest player by elo in the queu, and joins it to the room
	function fillRoom(room, queueType)
	{
		if (isRoomFull(room.gameType, room.id))
			return ;
		if (checkTimeStamp(room))
		{
			cSocket = null;
			cPlayer = null;
			cElo = -1;
			queueId = null;
			for (const roomId in rooms[queueType]) {
				for (playerId in rooms[queueType][roomId].players) {
					if (cElo === -1 || Math.abs(rooms[queueType][roomId].players[playerId].elo - room.elo)) {
						cSocket = playerId;
						cPlayer = rooms[queueType][roomId].players[playerId];
						cElo = rooms[queueType][roomId].players[playerId].elo;
						queueId = roomId;
					}
				}
			}
			removePlayerFromQueue(queueType, queueId, cSocket);
			addPlayerToRoom(room, cSocket, cPlayer.id, cElo, cPlayer.userAvatar);
			return ;
		}
		else
			fillRoom(room);
	}

	// Adds a player to a room
	// Does nothing if either room or socket does not exist
	// Does nothing if elo doesn't match
	function addPlayerToRoom(room, socket, userId, userELO, userAvatar) {
		if (room && socket && checkElo(room, userELO)) {
			socket.join(room.id);
			room.players[socket.id] = {
				id: userId,
				ready: false,
				elo: userELO,
				avatar: userAvatar
			};
			// DEBUG
			io.to(socket.id).emit('info', { message: `You (elo ${userELO}) joined room ${room.id}, room elo ${room.elo}` });//[${gameType}]
		}
	}

	// // Adds a player to queue
	// // Does nothing if either queue or socket does not exist
	// function addPlayerToQueue(socket, userId, userELO, userAvatar) {
	// 	if (rooms["queue"] && socket) {
	// 		socket.join(rooms["queue"].id);
	// 		// rooms["queue"].players[socket.id] = {
	// 		// 	id: userId,
	// 		// 	ready: false,
	// 		// 	elo: userELO,
	// 		// 	avatar: userAvatar
	// 		// };
	// 		// DEBUG
	// 		io.to(socket.id).emit('info', { message: `You joined queue ${room.id} [${gameType}]` });
	// 	}
	// }

	// Removes player from their room
	function removePlayerFromRoom(playerId) {
		for (const gameType in rooms) {
			for (const roomId in rooms[gameType]) {
				if (rooms[gameType][roomId].players[playerId]) {
					delete rooms[gameType][roomId].players[playerId];
					// If the room becomes empty, delete it
					if (roomPlayerNb(gameType, roomId) === 0) {
						delete rooms[gameType][roomId];
					}
					return;
				}
			}
		}
	}

	//Removes player from queue
	function removePlayerFromQueue(queueType, queueId, playerSocket) {
		if (rooms[queueType][queueId].players[playerSocket])
		{
			delete rooms[queueType][queueId].players[playerSocket];
			io.to(playerSocket).emit('info', { message: `You left room ${queueId}` });
			return;
		}
	}

	// Checks if all players in a room are ready
	function allPlayersReady(players) {
		for (const playerId in players) {
			if (!players[playerId].ready) {
				return false;
			}
		}
		return true;
	}

	// Returns true if a room is full or if it doesn't exist
	// Returns false otherwise
	function isRoomFull(gameType, roomId) {
		const playerNb = roomPlayerNb(gameType, roomId);
		return (playerNb === -1 || playerNb >= rooms[gameType][roomId].maxPlayers)
	}

	// Returns true if a room is launched or if it doesn't exist
	// Returns false otherwise
	function isRoomLaunched(gameType, roomId) {
		if (rooms[gameType][roomId]) {
			return rooms[gameType][roomId].launched;
		}
		return true;
	}

	// Returns the current number of players in a room
	// Returns -1 if the room does not exist
	function roomPlayerNb(gameType, roomId) {
		if (rooms[gameType][roomId]) {
			return Object.keys(rooms[gameType][roomId].players).length;
		}
		return -1
	}

	// Returns the player's current room by player ID
	// Returns null if it can't find it
	function findRoomByPlayerId(gameType, playerId) {
		for (const roomId in rooms[gameType]) {
			if (rooms[gameType][roomId].players[playerId]) {
				return rooms[gameType][roomId];
			}
		}
		return null;
	}

	// Returns true when other players in queue, false if queue only contains current user
	// function otherPlayersInQueue() {
	// 	for ( id in rooms["queue"].id)
	// 	{
	// 		if (rooms["queue"].id !== socket.id)
	// 		{
	// 			io.to(socket.id).emit('info', { message: `oth` });
	// 			return true;
	// 		}
	// 	}
	// 	io.to(socket.id).emit('info', { message: `lon` });
	// 	return false;
	// 	// const playerNb = roomPlayerNb("queue", "$queue$");
	// 	// if (playerNb === 1)
	// 	// {
	// 	// 	io.to(socket.id).emit('info', { message: `lone` });
	// 	// 	return false;
	// 	// }
	// 	// io.to(socket.id).emit('info', { message: `oth` });
	// 	// return true;
	// }

	// Returns true if player in queue, false if not
	// function playerInQueue(queueType, roomId) {
	// 	if (rooms[queueType][roomId])
	// 	{
	// 		if (rooms[queueType][roomId].players[socket.id])
	// 			return true;
	// 	}
	// 	return false;
	// }

	// Returns true if player in specified room, false if not
	function playerInRoom(gameType, roomId) {
		if (rooms[gameType][roomId])
		{
			if (rooms[gameType][roomId].players[socket.id])
				return true;
		}
		return false;
	}

	// Returns the ELO of current room
	// Returns null if !room
	function getPongRoomElo(gameType, roomId) {
		if (rooms[gameType][roomId] && rooms[gameType][roomId].players[0]) {
			return rooms[gameType][roomId].players[0].elo_pong;
		}
		return null;
	}

	// Checks if a game can be started and starts it if the answer is yes
	// Does nothing if room does not exist, is already launched, or if its players are not ready
	function checkGameStart(room, gameType) {
		if (!room || isRoomLaunched(gameType, room.id) || !allPlayersReady(room.players)) {
			return ;
		}

		switch (gameType) {
			case 'royal':
				startRoyalGame(room);
				break ;
			case 'pong2':
			case 'pong3':
			default:
				startPongGame(room, gameType);
		}
	}

	// Starts a game of pong2 (1v1)
	// Does nothing if there are less than 2 players in the room
	// Does nothing if room does not exist, is already launched, or if its players are not ready
	function startPongGame(room, gameType) {
		if (!room || isRoomLaunched(gameType, room.id) || !allPlayersReady(room.players)) {
			return ;
		}

		// If the room is full, launch the game
		if (isRoomFull(gameType, room.id)) {
			launchGame(room);
		}
	}

	// Starts a game of royal
	// Does nothing if there are less than ROYAL_MIN_PLAYERS in the room
	// Does nothing if room does not exist, is already launched, or if its players are not ready
	function startRoyalGame(room) {
		if (!room || room.launched || !allPlayersReady(room.players)) {
			return ;
		}

		if (roomPlayerNb('royal', room.id) >= ROYAL_MIN_PLAYERS) {
			// If the room is full, launch the game
			if (isRoomFull('royal', room.id)) {
				launchGame(room);
				return ;
			}
			// If the room is not full, starts timer for forced launch
			setTimeout(() => {
				// Need to recheck if room still exists and there are enough
				// players in it since this could have changed in the meantime
				if (room && !room.launched && roomPlayerNb(gameType, room.id) >= ROYAL_MIN_PLAYERS) {
					launchGame(room);
				}
			}, ROYAL_START_TIMEOUT);
		}
	}

	// Sends a gameStart message to all players in the room and sets launched to true
	// Does nothing if room does not exist, is already launched, or if its players are not ready
	function launchGame(room) {
		if (!room || room.launched || !allPlayersReady(room.players)) {
			return ;
		}

		room.launched = true;
		io.to(room.id).emit('gameStart', { players: room.players });
	}
});

server.listen(PORT, () => {
	console.log(`WebSocket server running on port ${PORT}`);
});
