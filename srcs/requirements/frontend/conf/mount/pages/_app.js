import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { AuthenticationProvider } from '../context/AuthenticationContext';
import { UserProvider } from '../context/UserContext';
import { GameProvider } from '../context/GameContext';
import Header from '../components/Header';
import Footer from '../components/Footer';


function MyApp({ Component, pageProps }) {
	return (
		<AuthenticationProvider>
			<UserProvider>
				<GameProvider>
					<Header />
					<Component {...pageProps} />
          <Footer />
				</GameProvider>
			</UserProvider>
		</AuthenticationProvider>
	);
}

export default MyApp;
