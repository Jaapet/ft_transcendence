import { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthenticationContext';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
	const { isLoggedIn } = useAuth();
	const [inQueue, setInQueue] = useState(false);
	const [inGame, setInGame] = useState(false);
	const [gameStarted, setGameStarted] = useState(false);
	const [gameEnded, setGameEnded] = useState(false);
	const [gameType, setGameType] = useState('none');
	const [room, setRoom] = useState(null);
	const [players, setPlayers] = useState(null);

	const setInGameStatus = async ({ value }) => {
		try {
			const response = await fetch(`/api/current_user/set_ingame_status`, {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ value })
			});
			if (!response) {
				throw new Error('Could not update ingame status');
			}

			const data = await response.json();
			if (!data) {
				throw new Error('Could not update ingame status');
			}
			if (!response.ok) {
				throw new Error(data.message, 'Could not update ingame status');
			}
		} catch (error) {
			console.error('CONTEXT INGAME STATUS:', error);
		}
	}

	// Sets InGame
	const joinGame = () => {
		setInGame(true);
		setInGameStatus({ value: true });
	}

	// Unsets InGame and resets GameType
	const leaveGame = () => {
		setInGame(false);
		setGameType('none');
		setInGameStatus({ value: false });
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
		setRoom(null);
		setPlayers(null);
		leaveGame();
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
