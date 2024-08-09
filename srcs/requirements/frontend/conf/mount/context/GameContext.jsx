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

	// Tourney
	const [inTourney, setInTourney] = useState(false);
	const [tourney, setTourney] = useState(null);
	const [tourneyPlayers, setTourneyPlayers] = useState(null);

	// Sets InGame
	const joinGame = () => {
		setInGame(true);
	}

	// Sets InTourney
	const joinTourney = () => {
		setInTourney(true);
		joinGame();
	}

	// Unsets InGame and GameType
	const leaveGame = () => {
		setInGame(false);
		setGameType('none');
	}

	// Unsets InTourney, InGame and GameType
	const leaveTourney = () => {
		setInTourney(false);
		leaveGame();
	}

	// Sets InGame and GameType
	const joinPong2Game = () => {
		setGameType('pong2');
		joinGame();
	}

	// Sets InTourney, InGame and GameType
	const joinPong2Tourney = () => {
		setGameType('pong2');
		joinTourney();
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
		updatePlayers(players);
	}

	// Sets Tourney and TourneyPlayers
	const updateTourney = (tourney, players) => {
		setTourney(tourney);
		updateTourneyPlayers(players);
	}

	// Sets Players
	const updatePlayers = (players) => {
		setPlayers(players);
	}

	// Sets TourneyPlayers
	const updateTourneyPlayers = (players) => {
		setTourneyPlayers(players);
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
		leaveTourney();
	}

	return (
		<GameContext.Provider value={{
			inQueue, inGame, inTourney, gameStarted, gameEnded, gameErrored,
			gameType, room, players, tourney, tourneyPlayers,
			joinPong2Game, joinPong2Tourney,
			joinPong3Game, joinRoyalGame,
			setGameStarted, setGameEnded, setGameErrored,
			updateRoom, updatePlayers,
			updateTourney, updateTourneyPlayers,
			resetAll
		}}>
			{children}
		</GameContext.Provider>
	);
}

export const useGame = () => useContext(GameContext);
