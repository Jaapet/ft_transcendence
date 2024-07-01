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
const ROYAL_START_TIMEOUT = 30000;	// Start a Royal game after 30 seconds of waiting for a full room
const ELO_RANGE = 100;				// Base range of accepted ELO in a room (room.elo+-ELO_RANGE)
const ELO_RANGE_MAX = 1000;			// Limit for ELO_RANGE
const FIND_ROOM_TIMEOUT = 10;		// Create your own room after trying to find one for 10 seconds
const FIND_ROOM_RATE = 0.5;			// Try to find a room every 0.5 seconds

// TODO: Make client send gameType and maxPlayers in new message that will set the player's room
io.on('connection', socket => {
	console.log(`New client connected: ${socket.id}`);
	connected = true;

	// DISCONNECT HANDLER
	socket.on('disconnect', () => {
		console.log(`Client disconnected: ${socket.id}`);
		removePlayerFromRoom(socket.id);
		connected = false;
	});

	// JOIN HANDLER (https://transcendence.gmcg.fr:50581/test)
	socket.on('join', ({ gameType, userId, userELO, userAvatar }) => {
		if (!connected)
			return ;
		
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
		if (playerInRoom(queueType, queue.id))
		{
			// Join Existing Room
			if (findRoom(gameType))
			{
				// io.to(socket.id).emit('info', { message: `joining` });
				room = findRoomElo(gameType, userELO);
				if (room)
				{
					io.to(socket.id).emit('info', { message: `Found room ${room.id} (ELO=${room.elo})` }); // debug
					removePlayerFromQueue(queueType, queue.id, socket.id);
					addPlayerToRoom(room, socket, userId, userELO, userAvatar);
				}
			}
			else // Create New Room
			{
				// io.to(socket.id).emit('info', { message: `creating` });
				room = createRoom(gameType, userELO);
				removePlayerFromQueue(queueType, queue.id, socket.id);
				addPlayerToRoom(room, socket, userId, userELO, userAvatar);
			}
			// // Create New Room
			// if (/*roomPlayerNb(queueType, queue.id) === 1 &&*/ !findRoom(gameType))
			// {
			// 	// io.to(socket.id).emit('info', { message: `creating` });
			// 	room = createRoom(gameType, userELO);
			// 	removePlayerFromQueue(queueType, queue.id, socket.id);
			// 	addPlayerToRoom(room, socket, userId, userELO, userAvatar);
			// }
			// else // Join Existing Room
			// {
			// 	// io.to(socket.id).emit('info', { message: `joining` });
			// 	room = findRoomElo(gameType, userELO);
			// 	if (room)
			// 	{
			// 		io.to(socket.id).emit('info', { message: `Found room ${room.id}` }); // debug
			// 		removePlayerFromQueue(queueType, queue.id, socket.id);
			// 		addPlayerToRoom(room, socket, userId, userELO, userAvatar);
			// 	}
			// }
		}

		// If player was put in a room
		if (room)
		{
			io.to(socket.id).emit('info', { message: `passed filling` });
			// Set player as ready
			room.players[socket.id].ready = true;			
			// Start game if it can be started
			checkGameStart(room, gameType);
		}
		else
		{
			now = Date.now();
			FindRoomLoop(now, gameType, queue, queueType, userId, userELO, userAvatar);
		}
	});

	function FindRoomLoop(startTime, gameType, queue, queueType, userId, userELO, userAvatar)
	{
		if (!connected)
			return ;

		now = Date.now();
		deltaSeconds = (now - startTime) / 1000;

		room = null;
		// Timeout: Create your own room
		if (deltaSeconds >= FIND_ROOM_TIMEOUT)
		{
			room = createRoom(gameType, userELO);
			removePlayerFromQueue(queueType, queue.id, socket.id);
			addPlayerToRoom(room, socket, userId, userELO, userAvatar);
		}
		else // Try to find a room
		{
			room = findRoomElo(gameType, userELO);
			if (room)
			{
				io.to(socket.id).emit('info', { message: `Found room ${room.id} (ELO=${room.elo})` }); // debug
				removePlayerFromQueue(queueType, queue.id, socket.id);
				addPlayerToRoom(room, socket, userId, userELO, userAvatar);
			}
		}

		if (room) {
			if (isRoomFull(gameType, room.id))
				io.to(room.id).emit('info', { message: `Room ${room.id} [${gameType}] is now full` });
			room.players[socket.id].ready = true;
			checkGameStart(room, gameType);
			return ;
		}
		setTimeout(() => {
			FindRoomLoop(startTime, gameType, queue, queueType, userId, userELO, userAvatar);
		}, FIND_ROOM_RATE * 1000);
	}

	// INPUT HANDLER
	// TODO: This is where the actual game logic will live :)
	socket.on('input', ({ gameType, input }) => {
		if (!connected)
			return ;

		// Find current room of player
		const room = findRoomByPlayerId(gameType, socket.id);
		if (room) {
			// Broadcast input to all players in the room
			socket.to(room.id).emit('input', { playerId: socket.id, input });
		}
	});

	function isELOInRoomRange(room, userELO) {
		if (!connected)
			return false;

		const now = Date.now();
		const deltaTime = (now - room.timeStamp) * 0.03; // +30 ELO every 10 seconds
		range = ELO_RANGE + deltaTime;
		range = Math.max(Math.min(range, room.elo + ELO_RANGE_MAX), Math.max(room.elo - ELO_RANGE_MAX, 0));
		io.to(socket.id).emit('info', { message:
			`Checking ELO for room ${room.id}: Range = ${range}`
		}); // debug
		roomMax = room.elo + range;
		roomMin = room.elo - range;
		roomMin = Math.max(roomMin, 0);
		io.to(socket.id).emit('info', { message:
			`Checking ELO for room ${room.id} between ${roomMin} and ${roomMax}`
		}); // debug
		return (userELO <= roomMax && userELO >= roomMin);
	}

	// Returns true if userELO matches roomELO, false if not
	function checkElo(room, userELO) {
		if (!connected)
			return false;

		io.to(socket.id).emit('info', { message:
			`Checking ELO for room ${room.id} (ELO=${room.elo})`
		}); // debug
		if ( room.elo && isELOInRoomRange(room, userELO) )
			return true;
		return false;
	}

	// Finds room if there is one, null if not
	function findRoom(gameType) {
		if (!connected)
			return null;

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
		if (!connected)
			return null;

		for (const roomId in rooms[gameType]) {
			if (!isRoomFull(gameType, roomId) && !isRoomLaunched(gameType, roomId) && checkElo(rooms[gameType][roomId], userELO) ) {
				return rooms[gameType][roomId];
			}
		}
		return null;
	}

	// // Returns true if room was created at least 20s ago
	// function checkTimeStamp(room) {
	// 	if (!connected)
	// 		return false;

	// 	const now = Date.now();
	// 	//io.to(socket.id).emit('info', { message: `check ${now - room.timeStamp}` });
	// 	if (now - room.timeStamp >= 20000)
	// 		return true;
	// 	return false;
	// }

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
		if (!connected)
			return null;

		// Create a new room
		const now = Date.now();
		const newRoomId = generateRoomId(gameType);
		switch (gameType) {
			case 'queue2':
				rooms["queue2"]["$queue2$"] = { id: "$queue2$", launched: false, maxPlayers: 1000, timeStamp: now, players: {} };
				io.to(socket.id).emit('info', { message: `Room $queue2$ created` }); // debug
				return rooms["queue2"]["$queue2$"];
			case 'queue3':
				rooms["queue3"]["$queue3$"] = { id: "$queue3$", launched: false, maxPlayers: 1000, timeStamp: now, players: {} };
				io.to(socket.id).emit('info', { message: `Room $queue3$ created` }); // debug
				return rooms["queue3"]["$queue3$"];
			case 'queueR':
				rooms["queueR"]["$queueR$"] = { id: "$queueR$", launched: false, maxPlayers: 1000, timeStamp: now, players: {} };
				io.to(socket.id).emit('info', { message: `Room $queueR$ created` }); // debug
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

	// // Runs while room is not full.
	// // When timestamp goes over 20s, takes the nearest player by elo in the queue, and joins it to the room
	// function fillRoom(room, gameType, queueType)
	// {
	// 	if (!room)
	// 		return ;
	// 	if (isRoomFull(gameType, room.id))
	// 		return ;
	// 	if (checkTimeStamp(room))
	// 	{
	// 		io.to(socket.id).emit('info', { message: `>>>>>>>>>>>>>> over 20` });
	// 		let cSocketId = null;
	// 		let cSocket = null;
	// 		let cPlayer = null;
	// 		let cElo = -1;
	// 		let cAvatar = null;
	// 		let queueId = null;
	// 		for (const roomId in rooms[queueType]) {
	// 			for (playerId in rooms[queueType][roomId].players) {
	// 				if (cElo === -1 || Math.abs(rooms[queueType][roomId].players[playerId].elo - room.elo)) {
	// 					cSocketId = playerId;
	// 					cSocket = io.sockets.sockets.get(playerId);
	// 					//io.to(socket.id).emit('info', { message: `player socket = ${cSocketId}` });
	// 					cPlayer = rooms[queueType][roomId].players[playerId];
	// 					cElo = rooms[queueType][roomId].players[playerId].elo;
	// 					cAvatar = rooms[queueType][roomId].players[playerId].avatar;
	// 					queueId = roomId;
	// 					break ;
	// 				}
	// 			}
	// 		}
	// 		if (cSocketId && cPlayer && queueId) {
	// 			io.to(cSocketId).emit('info', { message: `player avatar = ${cAvatar}` });
	// 			removePlayerFromQueue(queueType, queueId, cSocketId);
	// 			addPlayerToRoom(room, cSocket, cPlayer.id, cElo, cPlayer.avatar);
	// 			cPlayer.ready = true;
	// 		}
	// 		if (isRoomFull(gameType, room.id)) {
	// 			checkGameStart(room, gameType);
	// 			return ;
	// 		}
	// 	}
	// 	setTimeout(() => fillRoom(room, gameType, queueType), 1000);
	// }

	// Adds a player to a room
	// Does nothing if either room or socket does not exist
	// Does nothing if elo doesn't match
	function addPlayerToRoom(room, socket, userId, userELO, userAvatar) {
		if (!connected)
			return ;

		if (room && socket) {
			socket.join(room.id);
			room.players[socket.id] = {
				id: userId,
				ready: true, // TODO: Be careful with this
				elo: userELO,
				avatar: userAvatar
			};
			// DEBUG
			io.to(socket.id).emit('info', { message: `You (elo ${userELO}) joined room ${room.id}, room elo ${room.elo}` });//[${gameType}]
			console.log("\n\nCurrent rooms structure:", JSON.stringify(rooms, null, 2));
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
		if (!connected)
			return false;

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
		if (!connected)
			return false;

		// const playerNb = roomPlayerNb(gameType, roomId);
		// return (playerNb === -1 || playerNb >= rooms[gameType][roomId].maxPlayers)
		if (!rooms[gameType] || !rooms[gameType][roomId]) {
			//console.error(`Room with gameType: ${gameType} and roomId: ${roomId} does not exist.`);
			return false;
		}
		return roomPlayerNb(gameType, roomId) >= rooms[gameType][roomId].maxPlayers;
	}

	// Returns true if a room is launched or if it doesn't exist
	// Returns false otherwise
	function isRoomLaunched(gameType, roomId) {
		if (!connected)
			return true;

		if (rooms[gameType][roomId]) {
			return rooms[gameType][roomId].launched;
		}
		return true;
	}

	// Returns the current number of players in a room
	// Returns -1 if the room does not exist
	function roomPlayerNb(gameType, roomId) {
		if (!connected)
			return -1;

		if (rooms[gameType][roomId]) {
			return Object.keys(rooms[gameType][roomId].players).length;
		}
		return -1;
	}

	// Returns the player's current room by player ID
	// Returns null if it can't find it
	function findRoomByPlayerId(gameType, playerId) {
		if (!connected)
			return null;

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
		if (!connected)
			return false;

		if (rooms[gameType][roomId])
		{
			if (rooms[gameType][roomId].players[socket.id])
				return true;
		}
		return false;
	}

	// Checks if a game can be started and starts it if the answer is yes
	// Does nothing if room does not exist, is already launched, or if its players are not ready
	function checkGameStart(room, gameType) {
		if (!connected)
			return ;

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
		if (!connected)
			return ;

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
		if (!connected)
			return ;

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
		if (!connected)
			return ;

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
