import React from 'react';
import Link from "next/link";
import { useEffect, useState } from 'react';
import styles from '../styles/base.module.css';
import PongT from '../components/pongT';
import PongPlayerCard from '../components/PongPlayerCard';
import PongResults from '../components/pongResults';
import { useAuth } from '../context/AuthenticationContext';
import DrawingCanvas from '../components/Drawing';
import { useGame } from '../context/GameContext';

export default function PongTourney({ status, detail }) {
	const { logout } = useAuth();
	const { joinPong2Tourney, resetAll, inQueue, room, players, tourney, tourneyPlayers } = useGame();

	// Tourney states
	/*
		Inside TOURNEY PLAYER:
			Upper or Lower group
			Upper or Lower player in group
			const TourneyState = {
				Start: 'Start',									// 0 (starting pos)
				SemiFinals: 'SemiFinals',				// 1 (first match)
				LosersFinals: 'LosersFinals',		// 1 (final for 3rd)
				Loser: 'Loser',									// 0 (final for 4th)
				WinnersFinals: 'WinnersFinals',	// 2 (final for 2nd)
				Winner: 'Winner'								// 3 (final for 1st)
			};
	*/

	// Game states
	const [playerL, setPlayerL] = useState(null);
	const [playerR, setPlayerR] = useState(null);
	const [scoreL, setScoreL] = useState(0);
	const [scoreR, setScoreR] = useState(0);
	const [gameEnd, setGameEnd] = useState(false);
	const [winner, setWinner] = useState(null);
	const [winnerScore, setWinnerScore] = useState(0);
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
		joinPong2Tourney();

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

	if (gameEnd && winner) {
		// TODO: Replace by tourney results (or let it show for a bit only, then switch back to tourney results?)
		return (
			<div className={`${styles.container} pt-5`}>
				<PongResults winner={winner} winnerScore={winnerScore} />
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
					setWinner={setWinner} setWinnerScore={setWinnerScore}
					gameError={gameError} setGameError={setGameError}
					setErrorMessage={setErrorMessage}
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
