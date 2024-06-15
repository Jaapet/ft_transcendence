import { useEffect } from 'react';
import { useAuth } from '../context/AuthenticationContext';
import io from 'socket.io-client'; // Import Socket.io client library

const Royal = () => {
	const { user } = useAuth();

	useEffect((user) => {
		const socket = io(`https://${process.env.NEXT_PUBLIC_FQDN}:${process.env.NEXT_PUBLIC_WEBSOCKET_PORT}`); // Connect to server on port 3001
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
    socket.on('input', (input) => {
      console.log('Input received from server:', input);
      // Handle input from server, update game state accordingly
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
