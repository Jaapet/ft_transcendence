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
	pong2: {},
	pong3: {},
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

	// JOIN HANDLER
	socket.on('join', ({ gameType, userId, userAvatar }) => {
		// Join existing room or create a new one
		const room = findOrCreateRoom(gameType);
		addPlayerToRoom(room, socket.id, userId, userAvatar);

		// Set player as ready
		room.players[socket.id].ready = true;

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

	// Finds or creates a room for the player
	function findOrCreateRoom(gameType) {
		// For all rooms in selected game type, return the first one that is not full
		for (const roomId in rooms[gameType]) {
			if (!isRoomFull(gameType, roomId)) {
				return rooms[gameType][roomId];
			}
		}

		// If no available rooms, create a new one
		const newRoomId = generateRoomId(gameType);
		switch (gameType) {
			case 'pong3':
				rooms[gameType][newRoomId] = { id: newRoomId, launched: false, maxPlayers: PONG3_NB_PLAYERS, players: {} };
				break ;
			case 'royal':
				rooms[gameType][newRoomId] = { id: newRoomId, launched: false, maxPlayers: ROYAL_MAX_PLAYERS, players: {} };
				break ;
			default:
				rooms[gameType][newRoomId] = { id: newRoomId, launched: false, maxPlayers: PONG2_NB_PLAYERS, players: {} };
		}
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

	// Adds a player to a room
	function addPlayerToRoom(room, playerId, userId, userAvatar) {
		if (room) {
			room.players[playerId] = {
				id: userId,
				ready: false,
				avatar: userAvatar
			};
		}
	}

	// Removes player from their room
	function removePlayerFromRoom(playerId) {
		for (const gameType in rooms) {
			for (const roomId in rooms[gameType]) {
				if (rooms[gameType][roomId].players[playerId]) {
					delete rooms[gameType][roomId].players[playerId];
					// If the room becomes empty, delete it
					if (Object.keys(rooms[gameType][roomId].players).length === 0) {
						delete rooms[gameType][roomId];
					}
					return;
				}
			}
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

	// Checks if a game can be started and starts it if the answer is yes
	// Does nothing if room does not exist, is already launched, or if its players are not ready
	function checkGameStart(room, gameType) {
		if (!room || room.launched || !allPlayersReady(room.players)) {
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
		if (!room || room.launched || !allPlayersReady(room.players)) {
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
