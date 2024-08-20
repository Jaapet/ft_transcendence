import React from 'react';
import Link from "next/link";
import { useEffect, useState } from 'react';
import styles from '../styles/base.module.css';
import PongT from '../components/pongT';
import PongPlayerCard from '../components/PongPlayerCard';
import TourneyDisplay from '../components/TourneyDisplay';
import { useAuth } from '../context/AuthenticationContext';
import DrawingCanvas from '../components/Drawing';
import { useGame } from '../context/GameContext';
import io from 'socket.io-client';

export default function PongTourney({ status, detail, user }) {
	const { logout } = useAuth();
	const {
		joinPong2Tourney, resetAllTourney,
		inQueue, room, players,
		tourney, tourneyPlayers,
		updateRoom, updatePlayers,
		updateTourney, updateTourneyPlayers,
		tourneyEnded,
		setTourneyStarted,
		setTourneyEnded
	} = useGame();

	// Game states
	const [playerL, setPlayerL] = useState(null);
	const [playerR, setPlayerR] = useState(null);
	const [scoreL, setScoreL] = useState(0);
	const [scoreR, setScoreR] = useState(0);
	const [gameEnd, setGameEnd] = useState(false);
	const [gameError, setGameError] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	const [socket, setSocket] = useState(null);

	const handleLogout = async () => {
		await logout();
	}

	if (status === 401 && detail === 'Not logged in') {
		handleLogout();
	}

	if (status !== 200) {
		return (
			<div className={styles.container}>
				<p className="bg-light text-black">Something went wrong...</p>
				<p className="bg-light text-black">Please reload the page.</p>
			</div>
		);
	}

	useEffect(() => {
		joinPong2Tourney();
		const mySocket = io(`https://${process.env.NEXT_PUBLIC_FQDN}:${process.env.NEXT_PUBLIC_WEBSOCKET_PORT}`);
		setSocket(mySocket);

		mySocket.emit('joinTourney', { gameType: 'pong2', userId: user.id, userName: user.username, userELO: user.elo_pong, userAvatar: user.avatar });

		mySocket.on('connect_error', (error) => {
			//console.error('Connection error for websocket server:', error);
		});

		mySocket.on('updateRoom', ({ room, players }) => {
			//console.log('Room updated to', room); // debug
			//console.log('With players:', players); // debug
			updateRoom(room, players);
		});

		mySocket.on('updatePlayers', ({ players }) => {
			//console.log('Room updated with these new players:', players); // debug
			updatePlayers(players);
		});

		mySocket.on('updateTourney', ({ tourney, tourneyPlayers }) => {
			updateTourney(tourney, tourneyPlayers);
		});

		mySocket.on('updateTourneyPlayers', ({ tourneyPlayers }) => {
			updateTourneyPlayers(tourneyPlayers);
		});

		mySocket.on('tourneyStart', ({ players }) => {
			//console.log(`PONG_CMPT: Received tourneyStart`); // debug
			//console.log(`PONG_CMPT: Received player list:`, players); // debug
			setTourneyStarted(true);
		});

		mySocket.on('tourneyEnd', () => {
			//console.log(`PONG_CMPT: Received tourneyEnd`); // debug
			setTourneyEnded(true);
		});

		return () => {
			resetAllTourney();
			mySocket.disconnect();
			setSocket(null);
		}
	}, []);

/*
	player = {
		id,
		username,
		ready,
		elo,
		avatar,
		role,
		readyTimer
	}
*/
	useEffect(() => {
		//console.log('PONG PAGE PLAYERS:', players); // debug
		if (room && players) {
			Object.entries(players).map(([key, player]) => {
				//console.log('PONG PAGE PLAYER ROLE:', player.role); // debug
				if (player.role === 'leftPaddle')
					setPlayerL(player);
				else if (player.role === 'rightPaddle')
					setPlayerR(player);
			});
		}
	}, [players]);

	if (gameError) {
		return (
			<div className={`${styles.container} pt-5`}>
				<div className={`card ${styles.customCard} mt-5`}>
					<div className={`card-body ${styles.cardInfo}`}>
						{ errorMessage ?
							<h1>{errorMessage}</h1>
						:
							<h1>Something went wrong...</h1>
						}
					</div>
				</div>
				<div className={styles.retrybuttonContainer}>
					<Link href="/chooseGame" passHref className={styles.retrybutton}>
						Play Again
					</Link>
					<Link href="/" passHref className={styles.retrybutton}>
						Main Menu
					</Link>
				</div>
			</div>
		);
	}

	if (tourneyEnded) {
		// TODO: Replace by actual tourney results
		return (
			<div className={`${styles.container} pt-5`}>
				<p>THE TOURNEY HAS ENDED!</p>
				<TourneyDisplay players={tourneyPlayers} />
				<div className={styles.retrybuttonContainer}>
					<Link href="/chooseGame" passHref className={styles.retrybutton}>
						Play Again
					</Link>
					<Link href="/" passHref className={styles.retrybutton}>
						Main Menu
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					width: '100vw',
					height: '78vh',
				}}
			>

				{ room && !inQueue ?
					<>
						{/* Player 1 */}
						<PongPlayerCard nb={1} player={playerL} score={scoreL} />
					</>
				:
					<></>
				}

				<DrawingCanvas />
				<PongT
					tourney={tourney} tourneyPlayers={tourneyPlayers}
					scoreL={scoreL} setScoreL={setScoreL}
					scoreR={scoreR} setScoreR={setScoreR}
					gameEnd={gameEnd} setGameEnd={setGameEnd}
					gameError={gameError} setGameError={setGameError}
					setErrorMessage={setErrorMessage}
					socket={socket} myUser={user}
				/>

				{ room && !inQueue ?
					<>
						{/* Player 2 */}
						<PongPlayerCard nb={2} player={playerR} score={scoreR} />
					</>
				:
					<></>
				}

			</div>
		</div>
	);
}

export async function getServerSideProps(context) {
	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/user`, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Cookie': context.req.headers.cookie
			}
		});
		if (!response) {
			throw new Error('Dummy fetch failed');
		}
		if (response.status === 404) {
			return {
				props: {
					status: 404,
					detail: 'Resource not found',
					user: null
				}
			}
		}

		const data = await response.json();
		if (!data) {
			throw new Error('Dummy fetch failed');
		}
		if (!response.ok) {
			throw new Error(data.message, 'Dummy fetch failed');
		}

		return {
			props: {
				status: 200,
				detail: 'Success',
				user: data.user
			}
		}
	} catch (error) {
		return {
			props: {
				status: 401,
				detail: error.message,
				user: null
			}
		}
	}
}
