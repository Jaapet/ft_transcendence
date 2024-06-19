import { useEffect } from 'react';
import { useAuth } from '../context/AuthenticationContext';
import io from 'socket.io-client'; // Import Socket.io client library

// This is a test page for websockets :)
// so TODO: Remove this later

const Royal = () => {
	const { user } = useAuth();

	useEffect(() => {
		if (!user) {
			return;
		}

		const socket = io(`https://${process.env.NEXT_PUBLIC_FQDN}:${process.env.NEXT_PUBLIC_WEBSOCKET_PORT}`); // Connect to server on port 3001
		socket.emit('join', { gameType: 'pong2', userId: user.id, userELO: user.elo_pong, userAvatar: user.avatar });

		socket.on('connect', () => {
			console.log('Connected to websocket server');
		});
		socket.on('connect_error', (error) => {
			console.error('Connection error for websocket server:', error);
		});
		socket.on('disconnect', () => {
			console.log('Disconnected from websocket server');
		});

    // Add event listeners for user input
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    function handleKeyDown(event) {
			console.log('KEYDOWN', event.key);
      // Send input to the server
      socket.emit('input', { gameType: 'pong2', input: { key: event.key, type: 'keydown' } });
    }

    function handleKeyUp(event) {
			console.log('KEYUP', event.key);
      // Send input to the server
      socket.emit('input', { gameType: 'pong2', input: { key: event.key, type: 'keyup' } });
    }

    // Handle input received from server
    socket.on('input', ({ playerId, input }) => {
      console.log(`Input received from player ${playerId}:`, input);
      // Handle input from server, update game state accordingly
    });

    // Handle info received from server
    socket.on('info', ({ message }) => {
      console.log('Info received from server:', message);
    });

    // Handle info received from server
    socket.on('gameStart', ({ players }) => {
      console.log('Game started with these players:');
      // Iterate over the players object
      Object.keys(players).forEach(playerKey => {
        const player = players[playerKey];
        console.log(`Player ${player.id} (${player.elo})`);
      });
    });

    // Clean up
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      socket.disconnect(); // Disconnect when component unmounts
    };
  }, [user]);

  // Game rendering code...
};

export default Royal;
