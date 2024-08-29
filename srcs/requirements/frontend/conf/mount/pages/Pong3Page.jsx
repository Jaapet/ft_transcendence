import React from 'react';
import Link from "next/link";
import { useEffect, useState } from 'react';
import styles from '../styles/base.module.css';
import Pong3 from '../components/pong3';
import Pong3LeftUI from '../components/Pong3LeftUI';
import Pong3RightUI from '../components/Pong3RightUI';
import Pong3Results from '../components/pong3Results';
import { useAuth } from '../context/AuthenticationContext';
import DrawingCanvas from '../components/Drawing';
import { useGame } from '../context/GameContext';

export default function PongPage({ status, detail }) {
	const { logout } = useAuth();
	const { joinPong3Game, resetAll, inQueue, room, players } = useGame();
	const [timeLeft, setTimeLeft] = useState(30.0);
	const [playerL, setPlayerL] = useState(null);
	const [playerR, setPlayerR] = useState(null);
	const [playerB, setPlayerB] = useState(null);
	const [ballWon, setBallWon] = useState(false);
	const [gameEnd, setGameEnd] = useState(false);
	const [gameError, setGameError] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

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
		joinPong3Game();

		return () => {
			resetAll();
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
		setPlayerL(null);
		setPlayerR(null);
		setPlayerB(null);
		if (players) {
			Object.entries(players).map(([key, player]) => {
				if (player.role === 'leftPaddle')
					setPlayerL(player);
				else if (player.role === 'rightPaddle')
					setPlayerR(player);
				else if (player.role === 'ball')
					setPlayerB(player);
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

	if (gameEnd) {
		return (
			<div className={`${styles.container} pt-5`}>
				<Pong3Results
					playerL={playerL}
					playerR={playerR}
					playerB={playerB}
					ballWon={ballWon}
				/>
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
					justifyContent: room && !inQueue ? 'space-between' : 'center',
					alignItems: 'center',
					width: '100vw',
					height: '78vh',
				}}
			>

				{ room && !inQueue ?
					<>
						{/* Player 1 */}
						<Pong3LeftUI playerL={playerL} playerB={playerB} />
					</>
				:
					<></>
				}

				{/* Game canvas */}
				<DrawingCanvas />
				<Pong3
					gameEnd={gameEnd} setGameEnd={setGameEnd}
					setTimeLeft={setTimeLeft} setBallWon={setBallWon}
					gameError={gameError} setGameError={setGameError}
					setErrorMessage={setErrorMessage}
				/>

				{ room && !inQueue ?
					<>
						{/* Player 2 */}
						<Pong3RightUI playerR={playerR} timeLeft={timeLeft} />
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
					detail: 'Resource not found'
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
		if (data.detail) {
			return {
				props: {
					status: 401,
					detail: data.detail
				}
			}
		}

		return {
			props: {
				status: 200,
				detail: 'Success'
			}
		}
	} catch (error) {
		return {
			props: {
				status: 401,
				detail: error.message
			}
		}
	}
}
