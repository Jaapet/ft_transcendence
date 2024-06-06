import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect } from 'react';
import { AuthenticationProvider } from '../context/AuthenticationContext';
import { UserProvider } from '../context/UserContext';
import Header from '../components/Header';
import io from 'socket.io-client';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
	const socket = io(`https://${process.env.FQDN}:${process.env.PROJECT_PORT_ID}81`);

	console.log('app.js random debug message\n\n');

    socket.on('connect', () => {
      console.log('Connected to server');
    });
	if (socket.connected)
		console.log("working???!\n");
	else
		console.log("OSKOUR IT IS NOT WORKING");

    socket.on('messageFromServer', (message) => {
      console.log('Received from server:', message);
    });
	socket.on('disconnect', () => {
		console.log('Disconnected from server');
	  });

    // Nettoyage lors de la déconnexion
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <AuthenticationProvider>
      <UserProvider>
        <Header />
        <Component {...pageProps} />
      </UserProvider>
    </AuthenticationProvider>
  );
}

export default MyApp;
