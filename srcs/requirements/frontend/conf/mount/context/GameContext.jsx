import { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthenticationContext';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
	const { isLoggedIn } = useAuth();
	const [inQueue, setInQueue] = useState(false);
	const [inGame, setInGame] = useState(false);
	const [gameStarted, setGameStarted] = useState(false);
	const [gameEnded, setGameEnded] = useState(false);
	const [gameErrored, setGameErrored] = useState(false);
	const [gameType, setGameType] = useState('none');
	const [room, setRoom] = useState(null);
	const [players, setPlayers] = useState(null);

	// Sets InGame
	const joinGame = () => {
		setInGame(true);
	}

	// Unsets InGame and resets GameType
	const leaveGame = () => {
		setInGame(false);
		setGameType('none');
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
		isLoggedIn();
		setInQueue(false);
		setGameStarted(false);
		setGameEnded(false);
		setGameErrored(false);
		setRoom(null);
		setPlayers(null);
		leaveGame();
	}

	return (
		<GameContext.Provider value={{
			inQueue, inGame, gameStarted, gameEnded, gameErrored,
			gameType, room, players,
			joinPong2Game, joinPong3Game, joinRoyalGame,
			setGameStarted, setGameEnded, setGameErrored,
			updateRoom, updatePlayers, resetAll
		}}>
			{children}
		</GameContext.Provider>
	);
}

export const useGame = () => useContext(GameContext);
