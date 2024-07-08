import { createContext, useContext, useState } from 'react';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
	const [inQueue, setInQueue] = useState(false);
	const [inGame, setInGame] = useState(false);
	const [gameStarted, setGameStarted] = useState(false);
	const [gameEnded, setGameEnded] = useState(false);
	const [gameType, setGameType] = useState('none');
	const [room, setRoom] = useState(null);
	const [players, setPlayers] = useState(null);

	// Sets InGame
	const joinGame = () => {
		setInGame(true);
		// TODO: send info to backend
	}

	// Unsets InGame and resets GameType
	const leaveGame = () => {
		setInGame(false);
		setGameType('none');
		// TODO: send info to backend
	}

	// Sets InGame and GameType
	const joinPong2Game = () => {
		setGameType('pong2');
		joinGame();
	}

	// Sets InGame and GameType
	const joinPong3Game = () => {
		setGameType('pong3');
		joinGame();
	}

	// Sets InGame and GameType
	const joinRoyalGame = () => {
		setGameType('royal');
		joinGame();
	}

	// Sets InQueue, Room and Players
	const updateRoom = (room, players) => {
		if (!room.type || room.type === 'queue')
			setInQueue(true);
		else
			setInQueue(false);
		setRoom(room);
		setPlayers(players);
	}

	// Sets Players
	const updatePlayers = (players) => {
		setPlayers(players)
	}

	// Resets all states to default
	const resetAll = () => {
		setInQueue(false);
		setInGame(false);
		setGameType('none');
		setRoom(null);
		setPlayers(null);
	}

	return (
		<GameContext.Provider value={{
			inQueue, inGame, gameStarted, gameEnded, gameType, room, players,
			joinPong2Game, joinPong3Game, joinRoyalGame,
			setGameStarted, setGameEnded, updateRoom, updatePlayers, resetAll
		}}>
			{children}
		</GameContext.Provider>
	);
}

export const useGame = () => useContext(GameContext);
