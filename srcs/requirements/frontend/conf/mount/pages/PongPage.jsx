import React from 'react';
import { useEffect, useState } from 'react';
import styles from '../styles/base.module.css';
import Pong from '../components/pong';
import PongPlayerCard from '../components/PongPlayerCard';
import PongResults from '../components/pongResults';
import { useAuth } from '../context/AuthenticationContext';
import DrawingCanvas from '../components/Drawing';
import { useGame } from '../context/GameContext';

export default function PongPage({ status, detail }) {
	const { logout } = useAuth();
	const { joinPong2Game, resetAll, inQueue, room, players } = useGame();
	const [playerL, setPlayerL] = useState(null);
	const [playerR, setPlayerR] = useState(null);
	const [scoreL, setScoreL] = useState(0);
	const [scoreR, setScoreR] = useState(0);
	const [gameEnd, setGameEnd] = useState(false);
	const [winner, setWinner] = useState(null);
	const [winnerScore, setWinnerScore] = useState(0);

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
		joinPong2Game();

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
		if (players) {
			Object.entries(players).map(([key, player]) => {
				//console.log('PONG PAGE PLAYER ROLE:', player.role); // debug
				if (player.role === 'leftPaddle')
					setPlayerL(player);
				else if (player.role === 'rightPaddle')
					setPlayerR(player);
			});
		}
	}, [players]);

	if (gameEnd && winner) {
		return (
			<div className={`${styles.container} pt-5`}>
				<PongResults winner={winner} winnerScore={winnerScore} />
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

				{/* Game canvas */}
				<DrawingCanvas />
				<Pong
					scoreL={scoreL} setScoreL={setScoreL}
					scoreR={scoreR} setScoreR={setScoreR}
					gameEnd={gameEnd} setGameEnd={setGameEnd}
					setWinner={setWinner} setWinnerScore={setWinnerScore}
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
