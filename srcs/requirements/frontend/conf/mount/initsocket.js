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

const connected = {};
const ids = {};

// Constants
const PONG2_NB_PLAYERS = 2;
const PONG3_NB_PLAYERS = 3;
const ROYAL_MIN_PLAYERS = 2;
const ROYAL_MAX_PLAYERS = 8;
const ROYAL_START_TIMEOUT = 30000;	// Start a Royal game after 30 seconds of waiting for a full room
const ELO_RANGE = 100;							// Base range of accepted ELO in a room (room.elo+-ELO_RANGE)
const ELO_RANGE_MAX = 1000;					// Limit for ELO_RANGE
const FIND_ROOM_TIMEOUT = 10;				// Create your own room after trying to find one for 10 seconds
const FIND_ROOM_RATE = 0.5;					// Try to find a room every 0.5 seconds

// Gameplay constants
// TODO: Check if these are synced with client-side code
/// PONG 2
const PONG2_FPS = 60;
const PONG2_PADDLE_SPEED = 37;							// units per second
const PONG2_BASE_BALL_SPEED = 60;						// units per second
const PONG2_MAX_BALL_SPEED = 120;						// units per second
const PONG2_BALL_ACCELERATION_RATE = 0.6;		// unit/s/s
const PONG2_BALL_MAX_X = 42.5;
const PONG2_BALL_MAX_Z = 20;
const PONG2_PADDLE_MAX_Z = 16.5;
const PONG2_BALL_MAX_Z_DIR = 0.6;
const PONG2_BALL_BOUNCE_MERCY_PERIOD = 100;	// In ms
const PONG2_BALL_RESPAWN_TIME = 500;				// In ms
const PONG2_SCORE_TO_WIN = 4;

/// PONG 3
const PONG3_FPS = 60;
const PONG3_PADDLE_SPEED = 37;							// units per second
const PONG3_BASE_BALL_SPEED = 60;						// units per second
const PONG3_MAX_BALL_SPEED = 120;						// units per second
const PONG3_BALL_ACCELERATION_RATE = 0.6;		// unit/s/s
const PONG3_BALL_MAX_X = 42.5;
const PONG3_BALL_MAX_Z = 20;
const PONG3_PADDLE_MAX_Z = 16.5;
const PONG3_BALL_MAX_Z_DIR = 0.6;
const PONG3_BALL_BOUNCE_MERCY_PERIOD = 100;	// In ms
const PONG3_BALL_RESPAWN_TIME = 500;				// In ms
const PONG3_TIME_TO_WIN = 30;								// In seconds

/// ROYAL

async function setInGameStatus(userId, value) {
	fetch(`https://backend:8000/api/edit_ingame_status`, {
		method: 'PUT',
		headers: {
			'Authorization': `Bearer ${process.env.WS_TOKEN_BACKEND}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ user_id: userId, is_ingame: value })
	})
	.then(response => {
		if (!response || !response.ok)
			throw new Error('Could not set ingame status');

			return response.json();
	})
	.catch(error => {
		console.error('Error:', error);
	});
}

io.on('connection', socket => {
	//console.log(`New client connected: ${socket.id}`);
	connected[socket.id] = true;

	// DISCONNECT HANDLER
	socket.on('disconnect', () => {
		//console.log(`Client disconnected: ${socket.id}`);
		let room = findRoomByPlayerIdSlow(socket.id);
		if (room) {
			//console.log(`Found room ${room.id}`); // debug
			if (room.launched) {
				//console.log(`Room ${room.id} is launched`); // debug
				io.to(room.id).emit('gameError', { message: 'A player disconnected' });
				removePlayerFromRoom(socket.id);
			} else {
				//console.log(`Room ${room.id} is not launched`); // debug
				removePlayerFromRoom(socket.id);
				io.to(room.id).emit('updatePlayers', { players: room.players });
			}
		}
		connected[socket.id] = false;
		setInGameStatus(ids[socket.id], false);
	});

	// JOIN HANDLER (https://transcendence.gmcg.fr:50581/test)
	socket.on('join', ({ gameType, userId, userName, userELO, userAvatar }) => {
		if (!connected[socket.id])
			return ;
		ids[socket.id] = userId;
		setInGameStatus(ids[socket.id], true);

		//console.log(`JOIN: New user ${userName}`); // debug

		// Sets queueType depending on gameType
		let queueType = null;
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

		//console.log(`JOIN: Searching for ${queueType} for user ${userName}`); // debug
		let queue = null;
		queue = findRoom(queueType);
		// Create queue if !queue and join it
		if (!queue)
			queue = createRoom(queueType, userELO);
		addPlayerToRoom(queueType, queue, socket, userId, userName, userELO, userAvatar);
		//console.log(`JOIN: User ${userName} now in waitlist`); // debug

		let room = null;
		if (playerInRoom(queueType, queue.id))
		{
			// Join Existing Room
			if (findRoom(gameType))
			{
				//console.log(`JOIN: User ${userName} joining existing room`); // debug
				room = findRoomElo(gameType, userELO);
				if (room)
				{
					//console.log(`JOIN: User ${userName} found room ${room.id} (ELO=${room.elo})`); // debug
					removePlayerFromQueue(queueType, queue.id, socket.id);
					//console.log(`JOIN: User ${userName} removed from queue`); // debug
					addPlayerToRoom(gameType, room, socket, userId, userName, userELO, userAvatar);
					//console.log(`JOIN: User ${userName} added to room ${room.id}`); // debug
				}
			}
			else // Create New Room
			{
				//console.log(`JOIN: User ${userName} creating new room`); // debug
				room = createRoom(gameType, userELO);
				console.log(`Created room=${room.id} type=${gameType} by user=${userName}`); // ELK LOG
				removePlayerFromQueue(queueType, queue.id, socket.id);
				//console.log(`JOIN: User ${userName} removed from queue`); // debug
				addPlayerToRoom(gameType, room, socket, userId, userName, userELO, userAvatar);
				//console.log(`JOIN: User ${userName} added to room ${room.id}`); // debug
			}
		}

		// If player was put in a room
		if (room)
			checkGameStart(room, gameType);
		else
		{
			const now = Date.now();
			FindRoomLoop(now, gameType, queue, queueType, userId, userName, userELO, userAvatar);
		}
	});

	function FindRoomLoop(startTime, gameType, queue, queueType, userId, userName, userELO, userAvatar)
	{
		if (!connected[socket.id])
			return ;

		let now = Date.now();
		let deltaSeconds = (now - startTime) / 1000;

		let room = null;
		// Timeout: Create your own room
		if (deltaSeconds >= FIND_ROOM_TIMEOUT)
		{
			room = createRoom(gameType, userELO);
			removePlayerFromQueue(queueType, queue.id, socket.id);
			addPlayerToRoom(gameType, room, socket, userId, userName, userELO, userAvatar);
		}
		else // Try to find a room
		{
			room = findRoomElo(gameType, userELO);
			if (room)
			{
				io.to(socket.id).emit('info', { message: `Found room ${room.id} (ELO=${room.elo})` }); // debug
				removePlayerFromQueue(queueType, queue.id, socket.id);
				addPlayerToRoom(gameType, room, socket, userId, userName, userELO, userAvatar);
			}
		}

		if (room) {
			if (isRoomFull(gameType, room.id))
				io.to(room.id).emit('info', { message: `Room ${room.id} [${gameType}] is now full` });
			//room.players[socket.id].ready = true;
			checkGameStart(room, gameType);
			return ;
		}
		setTimeout(() => {
			FindRoomLoop(startTime, gameType, queue, queueType, userId, userName, userELO, userAvatar);
		}, FIND_ROOM_RATE * 1000);
	}

	// Gets the first player in a room that has the specified role
	// Players should thus have unique roles in a given room
	function getPlayerRoleInRoom(room, role) {
		if (!connected[socket.id] || !room || !room.players)
			return null;

		for (const playerId in room.players)
			if (room.players[playerId].role === role)
				return room.players[playerId];

		return null;
	}

	function getCurrentPlayerInRoom(room) {
		if (!connected[socket.id])
			return null;

		if (room && room.players[socket.id])
			return room.players[socket.id];
		return null;
	}

	function pong2Input(room, input) {
		if (!connected[socket.id] || !room || !input || !input.key || !input.type)
			return ;

		const player = getCurrentPlayerInRoom(room);
		if (!player)
			return ;

		const { key, type } = input;
		let move = false;
		if (type === 'keydown')
			move = true;

		if (key === "ArrowDown") {
			if (player.role === 'leftPaddle')
				room.runtime.goDown.l = move;
			else
				room.runtime.goDown.r = move;
		} else if (key === "ArrowUp") {
			if (player.role === 'leftPaddle')
				room.runtime.goUp.l = move;
			else
				room.runtime.goUp.r = move;
		}
	}

	function pong3Input(room, input) {
		if (!connected[socket.id] || !room || !input || !input.key || !input.type)
			return ;

		const player = getCurrentPlayerInRoom(room);
		if (!player)
			return ;

		const { key, type } = input;
		let move = false;
		if (type === 'keydown')
			move = true;

		if (key === "ArrowDown") {
			if (player.role === 'leftPaddle')
				room.runtime.goDown.l = move;
			else if (player.role === 'rightPaddle')
				room.runtime.goDown.r = move;
			else
				room.runtime.goDown.b = move;
		} else if (key === "ArrowUp") {
			if (player.role === 'leftPaddle')
				room.runtime.goUp.l = move;
			else if (player.role === 'rightPaddle')
				room.runtime.goUp.r = move;
			else
				room.runtime.goUp.b = move;
		}
	}

	// INPUT HANDLER
	socket.on('input', ({ gameType, input }) => {
		if (!connected[socket.id])
			return ;

		// Find current room of player
		const room = findRoomByPlayerId(gameType, socket.id);
		if (room) {
			// Broadcast input to all players in the room
			socket.to(room.id).emit('input', { playerId: socket.id, input });
			switch (gameType) {
				case 'pong3':
					pong3Input(room, input);
					break ;
				case 'royal':
					break ;
				case 'pong2':
					pong2Input(room, input);
					break ;
			}
		}
	});

	function isELOInRoomRange(room, userELO) {
		if (!connected[socket.id])
			return false;

		const now = Date.now();
		const deltaTime = (now - room.timeStamp) * 0.03; // +30 ELO every 10 seconds
		let range = ELO_RANGE + deltaTime;
		range = Math.max(Math.min(range, room.elo + ELO_RANGE_MAX), Math.max(room.elo - ELO_RANGE_MAX, 0));
		io.to(socket.id).emit('info', { message:
			`Checking ELO for room ${room.id}: Range = ${range}`
		}); // debug
		const roomMax = room.elo + range;
		const roomMin = Math.max(room.elo - range, 0);
		io.to(socket.id).emit('info', { message:
			`Checking ELO for room ${room.id} between ${roomMin} and ${roomMax}`
		}); // debug
		return (userELO <= roomMax && userELO >= roomMin);
	}

	// Returns true if userELO matches roomELO, false if not
	function checkElo(room, userELO) {
		if (!connected[socket.id])
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
		if (!connected[socket.id])
			return null;

		// For all rooms in selected game type, return the first one that is not full
		for (const roomId in rooms[gameType]) {
			if (!isRoomFull(gameType, roomId) && !isRoomLaunched(gameType, roomId)) {
				return rooms[gameType][roomId];
			}
		}
		return null;
	}

	// Finds launched rooms to spectate, empty if there are none
	function findWatcherRooms(gameType) {
		if (!connected[socket.id])
			return {};

		const ret = rooms[gameType];

		// Removed rooms that have yet to be launched
		for (const roomId in ret) {
			if (!isRoomLaunched(gameType, roomId)) {
				delete ret[roomId];
			}
		}
		return ret;
	}

	// Finds room matching elo if ther is one, null if not
	function findRoomElo(gameType, userELO) {
		if (!connected[socket.id])
			return null;

		for (const roomId in rooms[gameType]) {
			if (!isRoomFull(gameType, roomId) && !isRoomLaunched(gameType, roomId) && checkElo(rooms[gameType][roomId], userELO) ) {
				return rooms[gameType][roomId];
			}
		}
		return null;
	}

	function createPong2Room(gameType, newRoomId, now, userELO) {
		if (!connected[socket.id])
			return ;

		rooms[gameType][newRoomId] = {
			id: newRoomId,
			launched: false,
			maxPlayers: PONG2_NB_PLAYERS,
			timeStamp: now,
			players: {},
			elo: userELO,
			runtime: {
				startTime: now,
				ballZeroTime: now,
				lastLoopTime: now,
				started: false,
				score: { l: 0, r: 0 },
				paddleSpeed: PONG2_PADDLE_SPEED,
				ballPosition: { x: 0, z: 0 },
				ballDirection: { x: 0.99999, z: 0.00001 },
				ballSpeed: PONG2_BASE_BALL_SPEED,
				lastBallBounce: { happened: false, when: now },
				ballRespawnTime: now,
				paddleZ: { l: 0, r: 0 },
				goUp: { l: false, r: false },
				goDown: { l: false, r: false },
				end: false
			}
		};
	}

	function createPong3Room(gameType, newRoomId, now, userELO) {
		if (!connected[socket.id])
			return ;

		rooms[gameType][newRoomId] = {
			id: newRoomId,
			launched: false,
			maxPlayers: PONG3_NB_PLAYERS,
			timeStamp: now,
			players: {},
			elo: userELO,
			runtime: {
				startTime: now,
				ballZeroTime: now,
				lastLoopTime: now,
				started: false,
				paddleSpeed: PONG3_PADDLE_SPEED,
				ballPosition: { x: 0, z: 0 },
				ballDirection: { x: 0.99999, z: 0.00001 },
				ballSpeed: PONG3_BASE_BALL_SPEED,
				lastBallBounce: { happened: false, when: now },
				ballRespawnTime: now,
				paddleZ: { l: 0, r: 0 },
				goUp: { l: false, r: false, b: false },
				goDown: { l: false, r: false, b: false },
				end: false
			}
		};
	}

	// Creates a room for the player
	function createRoom(gameType, userELO) {
		if (!connected[socket.id])
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
				createPong3Room(gameType, newRoomId, now, userELO);
				break ;
			case 'royal':
				rooms[gameType][newRoomId] = { id: newRoomId, launched: false, maxPlayers: ROYAL_MAX_PLAYERS, timeStamp: now, players: {}, elo: userELO };
				break ;
			default:
				createPong2Room(gameType, newRoomId, now, userELO);
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

	function choosePong2Role(room) {
		const playerNb = roomPlayerNb('pong2', room.id);
		if (playerNb === 0) {
			return "leftPaddle";
		} else {
			return "rightPaddle";
		}
	}

	function choosePong3Role(room) {
		let l = false;
		let r = false;
		for (const playerId in room.players) {
			const role = room.players[playerId].role;
			if (role === "leftPaddle")
				l = true;
			else if (role === "rightPaddle")
				r = true;
		}
		if (!l) {
			return "leftPaddle";
		} else if (!r) {
			return "rightPaddle";
		} else {
			return "ball";
		}
	}

	function chooseRoyalRole() {
		return "ball";
	}

	// Adds a player to a room
	// Does nothing if either room or socket does not exist
	// Does nothing if elo doesn't match
	function addPlayerToRoom(gameType, room, socket, userId, userName, userELO, userAvatar) {
		if (!connected[socket.id])
			return ;

		let role = '';
		let roomType = '';
		switch (gameType) {
			case 'pong3':
				role = choosePong3Role(room);
				roomType = gameType;
				break ;
			case 'royal':
				role = chooseRoyalRole();
				roomType = gameType;
				break ;
			case 'pong2':
				role = choosePong2Role(room);
				roomType = gameType;
				break ;
			default:
				role = 'pending';
				roomType = 'queue';
		}

		if (room && socket) {
			socket.join(room.id);
			room.players[socket.id] = {
				id: userId,
				username: userName,
				ready: false,
				elo: userELO,
				avatar: userAvatar,
				role: role,
				readyTimer: false
			};
			//io.to(socket.id).emit('info', { message: `You (${userName} ELO ${userELO}) joined room ${room.id}, room elo ${room.elo}` }); // debug
			// Send new room and its players to new user
			io.to(socket.id).emit('updateRoom', {
				room: {
					type: roomType,
					id: room.id,
					elo: room.elo
				},
				players: room.players
			});
			// Update all players of new player
			io.to(room.id).emit('updatePlayers', { players: room.players });
			console.log("\n\nCurrent room structure:", JSON.stringify(room, null, 2)); // debug
		}
	}

	// Removes player from their room
	function removePlayerFromRoom(playerId) {
		for (const gameType in rooms) {
			for (const roomId in rooms[gameType]) {
				if (rooms[gameType][roomId].players[playerId]) {
					//console.log(`REMOVE_PLAYER_FROM_ROOM: Removing user ${rooms[gameType][roomId].players[playerId].id} from ${gameType} room ${roomId}`); // debug
					delete rooms[gameType][roomId].players[playerId];
					socket.leave(roomId);
					// If the room becomes empty, delete it
					if (roomPlayerNb(gameType, roomId) === 0) {
						//console.log(`REMOVE_PLAYER_FROM_ROOM: Deleting ${gameType} room ${roomId}`); // debug
						console.log(`Deleted room=${roomId}`); // ELK LOG
						delete rooms[gameType][roomId];
					}
					return ;
				}
			}
		}
	}

	// Removes player from queue
	function removePlayerFromQueue(queueType, queueId, playerSocket) {
		if (rooms[queueType][queueId].players[playerSocket])
		{
			delete rooms[queueType][queueId].players[playerSocket];
			socket.leave(queueId);
			io.to(playerSocket).emit('info', { message: `You left room ${queueId}` });
			return ;
		}
	}

	// Checks if all players in a room are ready for timer
	function allPlayersReadyTimer(players) {
		if (!connected[socket.id])
			return false;

		for (const playerId in players) {
			if (!players[playerId].readyTimer) {
				return false;
			}
		}
		return true;
	}

	// Checks if all players in a room are ready for gameplay
	function allPlayersReady(players) {
		if (!connected[socket.id])
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
		if (!connected[socket.id])
			return false;

		return (
			rooms[gameType]
			&& rooms[gameType][roomId]
			&& roomPlayerNb(gameType, roomId) >= rooms[gameType][roomId].maxPlayers
		);
	}

	// Returns true if a room is launched or if it doesn't exist
	// Returns false otherwise
	function isRoomLaunched(gameType, roomId) {
		if (!connected[socket.id])
			return true;

		if (rooms[gameType][roomId])
			return rooms[gameType][roomId].launched;

		return true;
	}

	// Returns the current number of players in a room
	// Returns -1 if the room does not exist
	function roomPlayerNb(gameType, roomId) {
		if (!connected[socket.id])
			return -1;

		if (rooms[gameType][roomId])
			return Object.keys(rooms[gameType][roomId].players).length;

		return -1;
	}

	// Returns the player's current room by player ID
	// Returns null if it can't find it
	// Slower than findRoomByPlayerId but does not need gameType
	function findRoomByPlayerIdSlow(playerId) {
		//console.log(`FIND_ROOM_BY_PLAYER_ID_SLOW: Entered`); // debug
		if (!connected[socket.id])
			return null;

		//console.log(`FIND_ROOM_BY_PLAYER_ID_SLOW: Searching for ${playerId}`); // debug

		for (const gameType in rooms) {
			if (['queue2', 'queue3', 'queueR'].includes(gameType))
				continue ;
			//console.log(`FIND_ROOM_BY_PLAYER_ID_SLOW: Checking ${gameType}`); // debug
			for (const roomId in rooms[gameType]) {
				//console.log(`FIND_ROOM_BY_PLAYER_ID_SLOW: Checking room ${roomId}`); // debug
				if (rooms[gameType][roomId].players[playerId]) {
					//console.log(`FIND_ROOM_BY_PLAYER_ID_SLOW: ${playerId} is in room ${roomId}`); // debug
					return rooms[gameType][roomId];
				}
			}
		}
		return null;
	}

	// Returns the player's current room by player ID
	// Returns null if it can't find it
	function findRoomByPlayerId(gameType, playerId) {
		if (!connected[socket.id])
			return null;

		for (const roomId in rooms[gameType]) {
			if (rooms[gameType][roomId].players[playerId])
				return rooms[gameType][roomId];
		}
		return null;
	}

	// Returns true if player in specified room, false if not
	function playerInRoom(gameType, roomId) {
		if (!connected[socket.id])
			return false;

		return (rooms[gameType][roomId] && rooms[gameType][roomId].players[socket.id]);
	}

	// Checks if a game can be started and starts it if the answer is yes
	// Does nothing if room does not exist, is already launched, or if its players are not ready
	function checkGameStart(room, gameType) {
		if (!connected[socket.id])
			return ;

		//console.log(`CHECK_GAME_START: Checking ${gameType} room ${room.id}`); // debug

		if (!room || isRoomLaunched(gameType, room.id)) {
			return ;
		}

		//console.log(`CHECK_GAME_START: ${gameType} room ${room.id} exists and has not been launched`); // debug

		switch (gameType) {
			case 'royal':
				startRoyalGame(room, gameType);
				break ;
			case 'pong2':
			case 'pong3':
				startPongGame(room, gameType);
		}
	}

	// Starts a game of pong2 (1v1)
	// Does nothing if there are less than 2 players in the room
	// Does nothing if room does not exist, is already launched, or if its players are not ready
	// TODO: Check if all players have the right roles and reassign them in case not!
	function startPongGame(room, gameType) {
		if (!connected[socket.id])
			return ;

		//console.log(`START_PONG_GAME: Checking ${gameType} room ${room.id}`); // debug

		if (!room || isRoomLaunched(gameType, room.id)) {
			return ;
		}

		//console.log(`START_PONG_GAME: ${gameType} room ${room.id} exists and has not been launched`); // debug

		// If the room is full, launch the game
		if (isRoomFull(gameType, room.id)) {
			//console.log(`START_PONG_GAME: ${gameType} room ${room.id} is full, launching game`); // debug
			launchGame(gameType, room);
		}// else {
			//console.log(`START_PONG_GAME: ${gameType} room ${room.id} is not full`); // debug
		//}
	}

	// Starts a game of royal
	// Does nothing if there are less than ROYAL_MIN_PLAYERS in the room
	// Does nothing if room does not exist, is already launched, or if its players are not ready
	// TODO: Check if all players have the right roles and reassign them in case not!
	function startRoyalGame(room, gameType) {
		if (!connected[socket.id])
			return ;

		if (!room || room.launched) {
			return ;
		}

		if (roomPlayerNb('royal', room.id) >= ROYAL_MIN_PLAYERS) {
			// If the room is full, launch the game
			if (isRoomFull('royal', room.id)) {
				launchGame(gameType, room);
				return ;
			}
			// If the room is not full, starts timer for forced launch
			setTimeout(() => {
				// Need to recheck if room still exists and there are enough
				// players in it since this could have changed in the meantime
				if (room && !room.launched && roomPlayerNb(gameType, room.id) >= ROYAL_MIN_PLAYERS) {
					launchGame(gameType, room);
				}
			}, ROYAL_START_TIMEOUT);
		}
	}

	// Sends a gameStart message to all players in the room and sets launched to true
	// Does nothing if room does not exist, is already launched, or if its players are not ready
	function launchGame(gameType, room) {
		if (!connected[socket.id])
			return ;

		//console.log(`LAUNCH_GAME: Launching ${gameType} room ${room.id}`); // debug

		if (!room || room.launched) {
			return ;
		}

		//console.log(`LAUNCH_GAME: ${gameType} room ${room.id} exists and has not been launched`); // debug

		const playersString = Object.values(room.players).map(player => player.username).join(',');
		console.log(`Launched room=${room.id} players=${playersString}`); // ELK LOG
		room.launched = true;
		io.to(room.id).emit('gameStart', { players: room.players });
		//console.log(`LAUNCH_GAME: Emitted gameStart to ${gameType} room ${room.id}`); // debug
		switch (gameType) {
			case 'royal':
				RoyalLoop(room);
				return ;
			case 'pong3':
				Pong3Loop(room);
				return ;
			case 'pong2':
				Pong2Loop(room);
				return ;
		}
	}

	function LoopError(room, errorMsg) {
		console.log(`LOOP_ERROR: Room ${room.id} failed (${errorMsg})`); // debug
		io.to(room.id).emit('gameError', { message: errorMsg });
		return null;
	}

	function RoomStillExists(gameType, room) {
		return (room && rooms[gameType][room.id]);
	}

// PONG 2

	function Pong2Loop(room) {
		if (!room)
			return null;
		//console.log(`PONG2_LOOP: room ${room.id} exists`); // debug
		if (!connected[socket.id])
			return LoopError(room, 'A player disconnected');

		// Wait for timer start
		//console.log(`PONG2_LOOP: room ${room.id} waits for readyTimer`); // debug
		function waitForReadyTimer() {
			if (!RoomStillExists('pong2', room))
				return ;
			const test = allPlayersReadyTimer(room.players);
			if (!test) {
				//console.log(`PONG2_LOOP: room ${room.id} is not readyTimer`); // debug
				setTimeout(waitForReadyTimer, 1000); // Once every second
			} else {
				//console.log(`PONG2_LOOP: room ${room.id} is readyTimer`); // debug
				Pong2LoopReadyTimer(room);
			}
		}
		waitForReadyTimer();
	}

	function Pong2LoopReadyTimer(room) {
		if (!connected[socket.id])
			return LoopError(room, 'A player disconnected');
		io.to(room.id).emit('startTimer');
		//console.log(`PONG2_LOOP_READY_TIMER: Emitted startTimer to room ${room.id}`); // debug

		// Wait for gameplay start
		//console.log(`PONG2_LOOP_READY_TIMER: room ${room.id} waits for ready`); // debug
		function waitForReady() {
			if (!RoomStillExists('pong2', room))
				return ;
			const test = allPlayersReady(room.players);
			if (!test) {
				//console.log(`PONG2_LOOP_READY_TIMER: room ${room.id} is not ready`); // debug
				setTimeout(waitForReady, 1000); // Once every second
			} else {
				//console.log(`PONG2_LOOP_READY_TIMER: room ${room.id} is ready`); // debug
				Pong2LoopReady(room);
			}
		}
		waitForReady();
	}

	function Pong2LoopReady(room) {
		if (!connected[socket.id])
			return LoopError(room, 'A player disconnected');
		room.runtime.started = true;
		room.runtime.startTime = Date.now();
		room.runtime.ballZeroTime = room.runtime.startTime;
		room.runtime.ballRespawnTime = room.runtime.startTime - PONG2_BALL_RESPAWN_TIME;
		io.to(room.id).emit('startGameplay');
		//console.log(`PONG2_LOOP_READY: Emitted startGameplay to room ${room.id}`); // debug

		// Checks intersection between two non-rotated rectangles
		// rectangles should be represented as [left, top, right, bottom]
		// Returns { happened, hit } where happened is a boolean (collided or not)
		// and hit is the z difference between the two rectangles' centers
		const checkBounce = (rect1, rect2) => {
			const [left1, top1, right1, bottom1] = [...rect1];
			const [left2, top2, right2, bottom2] = [...rect2];

			if (!(top1 < bottom2 || top2 < bottom1 || right1 < left2 || right2 < left1)) {
				const center1 = bottom1 + ((top1 - bottom1) / 2);
				const center2 = bottom2 + ((top2 - bottom2) / 2);
				return ({ happened: true, hit: center1 - center2 });
			}
			return ({ happened: false, hit: 0.0 });
		}

		const sendResults = (room, leftWon) => {
			if (room.runtime.end)
				return ;

			console.log(`Ended room=${room.id}`); // ELK LOG

			room.runtime.end = true;
			const winner = leftWon ? getPlayerRoleInRoom(room, 'leftPaddle') : getPlayerRoleInRoom(room, 'rightPaddle');
			const loser = leftWon ? getPlayerRoleInRoom(room, 'rightPaddle') : getPlayerRoleInRoom(room, 'leftPaddle');
			// Send match info to backend
			const data = {
				type: 'pong2',
				winner_id: winner ? winner.id : 0,
				loser_id: loser ? loser.id : 0,
				winner_score: leftWon ? room.runtime.score.l : room.runtime.score.r,
				loser_score: leftWon ? room.runtime.score.r : room.runtime.score.l,
				start_datetime: new Date(room.runtime.startTime).toISOString(),
				end_datetime: new Date(Date.now()).toISOString()
			};

			fetch('https://backend:8000/api/game/pong2/save', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${process.env.WS_TOKEN_BACKEND}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			})
			.then(response => {
				if (!response || !response.ok)
					throw new Error('Could not register match results');

					return response.json();
			})
			.catch(error => {
				console.error('Error:', error);
			});

			io.to(room.id).emit('gameEnd', { winner: winner, score: data.winner_score });
		}

		function gameLoop() {
			if (!connected[socket.id])
				return ;

			// update ball and paddle speed
			const elapsedTime = Date.now();
			const timeSinceLastLoop = (elapsedTime - room.runtime.lastLoopTime) / 1000; // In seconds
			// Ball and Paddle will only change speed PONG2_BALL_RESPAWN_TIME ms afer respawning
			if (elapsedTime - room.runtime.ballRespawnTime >= PONG2_BALL_RESPAWN_TIME) {
				if (room.runtime.paddleSpeed == 0)
					room.runtime.paddleSpeed = PONG2_PADDLE_SPEED;
				const currentBallTime = elapsedTime - room.runtime.ballZeroTime; // in ms
				room.runtime.ballSpeed = PONG2_BASE_BALL_SPEED + (currentBallTime * (PONG2_BALL_ACCELERATION_RATE / 1000));
				room.runtime.ballSpeed = Math.min(room.runtime.ballSpeed, PONG2_MAX_BALL_SPEED);
			}

			// update paddle positions
			const displaceP = room.runtime.paddleSpeed * timeSinceLastLoop;
			/// Left Paddle
			//// Go Up
			if (room.runtime.goUp.l)
				room.runtime.paddleZ.l -= displaceP;
			//// Go Down
			if (room.runtime.goDown.l)
				room.runtime.paddleZ.l += displaceP;
			room.runtime.paddleZ.l = Math.min(Math.max(room.runtime.paddleZ.l, -PONG2_PADDLE_MAX_Z), PONG2_PADDLE_MAX_Z);

			/// Right Paddle
			//// Go Up
			if (room.runtime.goUp.r)
				room.runtime.paddleZ.r -= displaceP;
			//// Go Down
			if (room.runtime.goDown.r)
				room.runtime.paddleZ.r += displaceP;
			room.runtime.paddleZ.r = Math.min(Math.max(room.runtime.paddleZ.r, -PONG2_PADDLE_MAX_Z), PONG2_PADDLE_MAX_Z);

			// update ball position
			/// Update X
			const displaceX = (room.runtime.ballSpeed * timeSinceLastLoop) * Math.abs(room.runtime.ballDirection.x);
			if (room.runtime.ballDirection.x > 0)
				room.runtime.ballPosition.x += displaceX;
			else if (room.runtime.ballDirection.x < 0)
				room.runtime.ballPosition.x -= displaceX;
			room.runtime.ballPosition.x = Math.min(Math.max(room.runtime.ballPosition.x, -PONG2_BALL_MAX_X), PONG2_BALL_MAX_X);

			/// Update Z
			const displaceZ = (room.runtime.ballSpeed * timeSinceLastLoop) * Math.abs(room.runtime.ballDirection.z);
			if (room.runtime.ballDirection.z > 0)
				room.runtime.ballPosition.z += displaceZ;
			else if (room.runtime.ballDirection.z < 0)
				room.runtime.ballPosition.z -= displaceZ;
			/// Bounce on top and bottom walls
			if (room.runtime.ballPosition.z > PONG2_BALL_MAX_Z
				|| room.runtime.ballPosition.z < -PONG2_BALL_MAX_Z)
				room.runtime.ballDirection.z *= -1;
			room.runtime.ballPosition.z = Math.min(Math.max(room.runtime.ballPosition.z, -PONG2_BALL_MAX_Z), PONG2_BALL_MAX_Z);

			/// Check Bounces
			function bounce() {
				// TODO: Check data consistency with client-side
				//// - Ball has radius of 2
				const ballRad = 2;
				const ballX = room.runtime.ballPosition.x;
				const ballZ = room.runtime.ballPosition.z;
				//// - Paddle has X-length of 2 and Z-length of 10
				const paddleRadX = 1;
				const paddleRadZ = 5;
				//// - Paddle is either on X = -43 or X = 43
				let paddleX = -43;
				let paddleZ = room.runtime.paddleZ.l;
				if (ballX > 0) {
					paddleX *= -1;
					paddleZ = room.runtime.paddleZ.r;
				}
				// Only check collision if ball is going in direction of paddle
				// TODO: Check if Bounce Mercy Period is useful
				if (
					Date.now() - room.runtime.lastBallBounce.when > PONG2_BALL_BOUNCE_MERCY_PERIOD
					&& ((paddleX < 0 && room.runtime.ballDirection.x < 0)
						|| (paddleX > 0 && room.runtime.ballDirection.x > 0))
				) {
					//// Left, Top, Right, Bottom
					const { happened, hit } = checkBounce(
						[ballX - ballRad,				ballZ + ballRad,			ballX + ballRad,			ballZ - ballRad],
						[paddleX - paddleRadX,	paddleZ + paddleRadZ,	paddleX + paddleRadX,	paddleZ - paddleRadZ]
					);
					if (happened) {
						room.runtime.ballDirection.x *= -1;
						const offset = hit * 0.1;
						room.runtime.ballDirection.z += offset;
						room.runtime.ballDirection.x -= offset;
						const absSum = Math.abs(room.runtime.ballDirection.x) + Math.abs(room.runtime.ballDirection.z);
						if (absSum !== 1)
						{
							const ratio = 1 / absSum;
							room.runtime.ballDirection.x *= ratio;
							room.runtime.ballDirection.z *= ratio;
						}
						room.runtime.lastBallBounce.happened = true;
						room.runtime.lastBallBounce.when = Date.now();
					}
				}
			}
			if (room.runtime.ballPosition.x > PONG2_BALL_MAX_X - 2.5
				|| room.runtime.ballPosition.x < -PONG2_BALL_MAX_X + 2.5) {
					bounce();
				}

			/// Clamp Ball Z Direction
			room.runtime.ballDirection.z = Math.min(Math.max(room.runtime.ballDirection.z, -PONG2_BALL_MAX_Z_DIR), PONG2_BALL_MAX_Z_DIR);
			const absSum = Math.abs(room.runtime.ballDirection.x) + Math.abs(room.runtime.ballDirection.z);
			if (absSum !== 1)
			{
				const ratio = 1 / absSum;
				room.runtime.ballDirection.x *= ratio;
				room.runtime.ballDirection.z *= ratio;
			}

			/// Check if someone scored (if ballX is behind a paddleX and going towards wall)
			if ((room.runtime.ballPosition.x > PONG2_BALL_MAX_X - 0.5 && room.runtime.ballDirection.x > 0)
				|| (room.runtime.ballPosition.x < -PONG2_BALL_MAX_X + 0.5 && room.runtime.ballDirection.x < 0)) {
					const leftScored = room.runtime.ballPosition.x > 0;
					room.runtime.paddleSpeed = 0;
					room.runtime.ballPosition.x = 0;
					room.runtime.ballPosition.z = 0;
					room.runtime.ballDirection.z = 0.00001;
					room.runtime.ballSpeed = 0;
					room.runtime.ballZeroTime = Date.now() + PONG2_BALL_RESPAWN_TIME;
					room.runtime.ballRespawnTime = Date.now();
					room.runtime.resetRotation = true;
					room.runtime.paddleZ.l = 0;
					room.runtime.paddleZ.r = 0;
					if (leftScored) {
						room.runtime.score.l += 1;
						room.runtime.ballDirection.x = 0.99999;
						// Left won the game
						if (room.runtime.score.l >= PONG2_SCORE_TO_WIN)
							sendResults(room, true);
					} else {
						room.runtime.score.r += 1;
						room.runtime.ballDirection.x = -0.99999;
						// Right won the game
						if (room.runtime.score.r >= PONG2_SCORE_TO_WIN)
							sendResults(room, false);
					}
				}

			io.to(room.id).emit('gameStatus', {
				leftScore: room.runtime.score.l,
				rightScore: room.runtime.score.r,
				newPaddleSpeed: room.runtime.paddleSpeed,
				ballX: room.runtime.ballPosition.x,
				ballZ: room.runtime.ballPosition.z,
				newBallSpeed: room.runtime.ballSpeed,
				ballDirX: room.runtime.ballDirection.x,
				ballDirZ: room.runtime.ballDirection.z,
				resetRotation: room.runtime.lastBallBounce.happened,
				leftPaddleZ: room.runtime.paddleZ.l,
				rightPaddleZ: room.runtime.paddleZ.r
			});
			room.runtime.lastBallBounce.happened = false;
			room.runtime.lastLoopTime = Date.now();

			setTimeout(gameLoop, 1000 / PONG2_FPS);
		}
		room.runtime.lastLoopTime = Date.now();
		gameLoop();
	}

// PONG 3

	function Pong3Loop(room) {
		if (!room)
			return null;
		//console.log(`PONG3_LOOP: room ${room.id} exists`); // debug
		if (!connected[socket.id])
			return LoopError(room, 'A player disconnected');

		// Wait for timer start
		//console.log(`PONG3_LOOP: room ${room.id} waits for readyTimer`); // debug
		function waitForReadyTimer() {
			if (!RoomStillExists('pong3', room))
				return ;
			const test = allPlayersReadyTimer(room.players);
			if (!test) {
				//console.log(`PONG3_LOOP: room ${room.id} is not readyTimer`); // debug
				setTimeout(waitForReadyTimer, 1000); // Once every second
			} else {
				//console.log(`PONG3_LOOP: room ${room.id} is readyTimer`); // debug
				Pong3LoopReadyTimer(room);
			}
		}
		waitForReadyTimer();
	}

	function Pong3LoopReadyTimer(room) {
		if (!connected[socket.id])
			return LoopError(room, 'A player disconnected');
		io.to(room.id).emit('startTimer');
		//console.log(`PONG3_LOOP_READY_TIMER: Emitted startTimer to room ${room.id}`); // debug

		// Wait for gameplay start
		//console.log(`PONG3_LOOP_READY_TIMER: room ${room.id} waits for ready`); // debug
		function waitForReady() {
			if (!RoomStillExists('pong3', room))
				return ;
			const test = allPlayersReady(room.players);
			if (!test) {
				//console.log(`PONG3_LOOP_READY_TIMER: room ${room.id} is not ready`); // debug
				setTimeout(waitForReady, 1000); // Once every second
			} else {
				//console.log(`PONG3_LOOP_READY_TIMER: room ${room.id} is ready`); // debug
				Pong3LoopReady(room);
			}
		}
		waitForReady();
	}

	function Pong3LoopReady(room) {
		if (!connected[socket.id])
			return LoopError(room, 'A player disconnected');
		room.runtime.started = true;
		room.runtime.startTime = Date.now();
		room.runtime.ballZeroTime = room.runtime.startTime;
		room.runtime.ballRespawnTime = room.runtime.startTime - PONG3_BALL_RESPAWN_TIME;
		io.to(room.id).emit('startGameplay');
		//console.log(`PONG3_LOOP_READY: Emitted startGameplay to room ${room.id}`); // debug

		// Checks intersection between two non-rotated rectangles
		// rectangles should be represented as [left, top, right, bottom]
		// Returns { happened, hit } where happened is a boolean (collided or not)
		// and hit is the z difference between the two rectangles' centers
		const checkBounce = (rect1, rect2) => {
			const [left1, top1, right1, bottom1] = [...rect1];
			const [left2, top2, right2, bottom2] = [...rect2];

			if (!(top1 < bottom2 || top2 < bottom1 || right1 < left2 || right2 < left1)) {
				const center1 = bottom1 + ((top1 - bottom1) / 2);
				const center2 = bottom2 + ((top2 - bottom2) / 2);
				return ({ happened: true, hit: center1 - center2 });
			}
			return ({ happened: false, hit: 0.0 });
		}

		const sendResults = (room, ballWon) => {
			if (room.runtime.end)
				return ;

			console.log(`Ended room=${room.id}`); // ELK LOG

			room.runtime.end = true;
			const leftPaddle = getPlayerRoleInRoom(room, 'leftPaddle');
			const rightPaddle = getPlayerRoleInRoom(room, 'rightPaddle');
			const ball = getPlayerRoleInRoom(room, 'ball');
			// Send match info to backend
			const data = {
				type: 'pong3',
				paddle1_id: leftPaddle ? leftPaddle.id : 0,
				paddle2_id: rightPaddle ? rightPaddle.id : 0,
				ball_id: ball ? ball.id : 0,
				ball_won: ballWon,
				start_datetime: new Date(room.runtime.startTime).toISOString(),
				end_datetime: new Date(Date.now()).toISOString()
			};
			console.log("MATCH RESULTS:", data); // debug
// TODO: Finish this!
/*			fetch('https://backend:8000/api/game/pong3/save', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${process.env.WS_TOKEN_BACKEND}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			})
			.then(response => {
				if (!response || !response.ok)
					throw new Error('Could not register match results');

					return response.json();
			})
			.catch(error => {
				console.error('Error:', error);
			});*/

			io.to(room.id).emit('gameEnd', {
				ball_won: ballWon
			});
		}

		function gameLoop() {
			if (!connected[socket.id])
				return ;

			// update ball and paddle speed
			const elapsedTime = Date.now();

			/// Check if the paddles won
			const elapsedTimeSeconds = (elapsedTime - room.runtime.startTime) / 1000;
			if (elapsedTimeSeconds >= PONG3_TIME_TO_WIN) {
					room.runtime.paddleSpeed = 0;
					room.runtime.ballSpeed = 0;
					room.runtime.ballZeroTime = Date.now() + PONG3_BALL_RESPAWN_TIME;
					room.runtime.ballRespawnTime = Date.now();
					sendResults(room, false);
				}

			const timeSinceLastLoop = (elapsedTime - room.runtime.lastLoopTime) / 1000; // In seconds
			// Ball and Paddle will only change speed PONG3_BALL_RESPAWN_TIME ms afer respawning
			if (elapsedTime - room.runtime.ballRespawnTime >= PONG3_BALL_RESPAWN_TIME) {
				if (room.runtime.paddleSpeed == 0)
					room.runtime.paddleSpeed = PONG3_PADDLE_SPEED;
				const currentBallTime = elapsedTime - room.runtime.ballZeroTime; // in ms
				room.runtime.ballSpeed = PONG3_BASE_BALL_SPEED + (currentBallTime * (PONG3_BALL_ACCELERATION_RATE / 1000));
				room.runtime.ballSpeed = Math.min(room.runtime.ballSpeed, PONG3_MAX_BALL_SPEED);
			}

			// update paddle positions
			const displaceP = room.runtime.paddleSpeed * timeSinceLastLoop;
			/// Left Paddle
			//// Go Up
			if (room.runtime.goUp.l)
				room.runtime.paddleZ.l -= displaceP;
			//// Go Down
			if (room.runtime.goDown.l)
				room.runtime.paddleZ.l += displaceP;
			room.runtime.paddleZ.l = Math.min(Math.max(room.runtime.paddleZ.l, -PONG3_PADDLE_MAX_Z), PONG3_PADDLE_MAX_Z);

			/// Right Paddle
			//// Go Up
			if (room.runtime.goUp.r)
				room.runtime.paddleZ.r -= displaceP;
			//// Go Down
			if (room.runtime.goDown.r)
				room.runtime.paddleZ.r += displaceP;
			room.runtime.paddleZ.r = Math.min(Math.max(room.runtime.paddleZ.r, -PONG3_PADDLE_MAX_Z), PONG3_PADDLE_MAX_Z);

			// update ball position
			/// Update X
			const displaceX = (room.runtime.ballSpeed * timeSinceLastLoop) * Math.abs(room.runtime.ballDirection.x);
			if (room.runtime.ballDirection.x > 0)
				room.runtime.ballPosition.x += displaceX;
			else if (room.runtime.ballDirection.x < 0)
				room.runtime.ballPosition.x -= displaceX;
			room.runtime.ballPosition.x = Math.min(Math.max(room.runtime.ballPosition.x, -PONG3_BALL_MAX_X), PONG3_BALL_MAX_X);

			/// Update Z
			const displaceZ = (room.runtime.ballSpeed * timeSinceLastLoop) * Math.abs(room.runtime.ballDirection.z);
			if (room.runtime.ballDirection.z > 0)
				room.runtime.ballPosition.z += displaceZ;
			else if (room.runtime.ballDirection.z < 0)
				room.runtime.ballPosition.z -= displaceZ;
			/// Bounce on top and bottom walls
			if (room.runtime.ballPosition.z > PONG3_BALL_MAX_Z
				|| room.runtime.ballPosition.z < -PONG3_BALL_MAX_Z)
				room.runtime.ballDirection.z *= -1;
			room.runtime.ballPosition.z = Math.min(Math.max(room.runtime.ballPosition.z, -PONG3_BALL_MAX_Z), PONG3_BALL_MAX_Z);

			/// Check Bounces
			function bounce() {
				// TODO: Check data consistency with client-side
				//// - Ball has radius of 2
				const ballRad = 2;
				const ballX = room.runtime.ballPosition.x;
				const ballZ = room.runtime.ballPosition.z;
				//// - Paddle has X-length of 2 and Z-length of 10
				const paddleRadX = 1;
				const paddleRadZ = 5;
				//// - Paddle is either on X = -43 or X = 43
				let paddleX = -43;
				let paddleZ = room.runtime.paddleZ.l;
				if (ballX > 0) {
					paddleX *= -1;
					paddleZ = room.runtime.paddleZ.r;
				}
				// Only check collision if ball is going in direction of paddle
				// TODO: Check if Bounce Mercy Period is useful
				if (
					Date.now() - room.runtime.lastBallBounce.when > PONG3_BALL_BOUNCE_MERCY_PERIOD
					&& ((paddleX < 0 && room.runtime.ballDirection.x < 0)
						|| (paddleX > 0 && room.runtime.ballDirection.x > 0))
				) {
					//// Left, Top, Right, Bottom
					const { happened, hit } = checkBounce(
						[ballX - ballRad,				ballZ + ballRad,			ballX + ballRad,			ballZ - ballRad],
						[paddleX - paddleRadX,	paddleZ + paddleRadZ,	paddleX + paddleRadX,	paddleZ - paddleRadZ]
					);
					if (happened) {
						room.runtime.ballDirection.x *= -1;
						const offset = hit * 0.1;
						room.runtime.ballDirection.z += offset;
						room.runtime.ballDirection.x -= offset;
						const absSum = Math.abs(room.runtime.ballDirection.x) + Math.abs(room.runtime.ballDirection.z);
						if (absSum !== 1)
						{
							const ratio = 1 / absSum;
							room.runtime.ballDirection.x *= ratio;
							room.runtime.ballDirection.z *= ratio;
						}
						room.runtime.lastBallBounce.happened = true;
						room.runtime.lastBallBounce.when = Date.now();
					}
				}
			}
			if (room.runtime.ballPosition.x > PONG3_BALL_MAX_X - 2.5 || room.runtime.ballPosition.x < -PONG3_BALL_MAX_X + 2.5)
				bounce();

			// TODO: Make ball user able to input influence over ball

			/// Clamp Ball Z Direction
			room.runtime.ballDirection.z = Math.min(Math.max(room.runtime.ballDirection.z, -PONG3_BALL_MAX_Z_DIR), PONG3_BALL_MAX_Z_DIR);
			const absSum = Math.abs(room.runtime.ballDirection.x) + Math.abs(room.runtime.ballDirection.z);
			if (absSum !== 1)
			{
				const ratio = 1 / absSum;
				room.runtime.ballDirection.x *= ratio;
				room.runtime.ballDirection.z *= ratio;
			}

			/// Check if the ball scored
			if ((room.runtime.ballPosition.x > PONG3_BALL_MAX_X - 0.5 && room.runtime.ballDirection.x > 0)
				|| (room.runtime.ballPosition.x < -PONG3_BALL_MAX_X + 0.5 && room.runtime.ballDirection.x < 0)) {
					room.runtime.paddleSpeed = 0;
					room.runtime.ballSpeed = 0;
					room.runtime.ballZeroTime = Date.now() + PONG3_BALL_RESPAWN_TIME;
					room.runtime.ballRespawnTime = Date.now();
					sendResults(room, true);
				}

			io.to(room.id).emit('gameStatus', {
				timeLeft: PONG3_TIME_TO_WIN - Math.floor(elapsedTimeSeconds),
				ballX: room.runtime.ballPosition.x,
				ballZ: room.runtime.ballPosition.z,
				newBallSpeed: room.runtime.ballSpeed,
				ballDirX: room.runtime.ballDirection.x,
				ballDirZ: room.runtime.ballDirection.z,
				resetRotation: room.runtime.lastBallBounce.happened,
				leftPaddleZ: room.runtime.paddleZ.l,
				rightPaddleZ: room.runtime.paddleZ.r
			});
			room.runtime.lastBallBounce.happened = false;
			room.runtime.lastLoopTime = Date.now();

			setTimeout(gameLoop, 1000 / PONG3_FPS);
		}
		room.runtime.lastLoopTime = Date.now();
		gameLoop();
	}

	socket.on('ready', ({ gameType }) => {
		if (!connected[socket.id] || !['pong2', 'pong3', 'royal'].includes(gameType))
			return ;

		const room = findRoomByPlayerId(gameType, socket.id);
		if (!room)
			return ;
		room.players[socket.id].ready = true;
	});

	socket.on('readyTimer', ({ gameType }) => {
		if (!connected[socket.id] || !['pong2', 'pong3', 'royal'].includes(gameType))
			return ;

		const room = findRoomByPlayerId(gameType, socket.id);
		if (!room)
			return ;
		room.players[socket.id].readyTimer = true;
	});
});

server.listen(PORT, () => {
	console.log(`WebSocket server running on port ${PORT}`);
});
