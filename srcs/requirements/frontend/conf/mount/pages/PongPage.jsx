import React from 'react';
import { useEffect, useState } from 'react';
import Pong from '../components/pong';
import Image from 'next/image';
import styles from '../styles/base.module.css';
import { useAuth } from '../context/AuthenticationContext';
import { useGame } from '../context/GameContext';

export default function PongPage({ status, detail }) {
	const { logout } = useAuth();
	const { joinPong2Game, inQueue, room, players } = useGame();
	const [playerL, setPlayerL] = useState(null);
	const [playerR, setPlayerR] = useState(null);
	const [scoreL, setScoreL] = useState(0);
	const [scoreR, setScoreR] = useState(0);

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
		console.log('PONG PAGE PLAYERS:', players); // debug
		if (players) {
			Object.entries(players).map(([key, player]) => {
				console.log('PONG PAGE PLAYER ROLE:', player.role); // debug
				if (player.role === 'leftPaddle')
					setPlayerL(player);
				else if (player.role === 'rightPaddle')
					setPlayerR(player);
			});
		}
	}, [players]);

	return (
	<div className={styles.container}>
		<div
			style={{
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				width: '100%', 
				marginTop: '8cm',
			}}
		>

		{/* Players */}
		{ room && !inQueue ?
			<>
				{/* Player 1 */}
				<div
					className={`card ${styles.customCard}`}
					style={{
						width: '200px', 
						marginRight: 'auto',
					}}
				>
					<div className={`card-body ${styles.cardInfo}`}>
						{ playerL ?
							<>
								<h5>{playerL.username}</h5>
								<Image
									src={playerL.avatar}
									alt={`${playerL.username}'s avatar`}
									width={100}
									height={100}
								/>
								<p>{`ELO: ${playerL.elo}`}</p>
								<h1>{scoreL}</h1>
							</>
						:
							<>
								<h5>Player 1</h5>
								<h1>{scoreL}</h1>
							</>
						}
					</div>
				</div>

				{/* Player 2 */}
				<div
					className={`card ${styles.customCard}`}
					style={{
						width: '200px', 
						marginLeft: 'auto', 
					}}
				>
					<div className={`card-body ${styles.cardInfo}`}>
						{ playerR ?
							<>
								<h5>{playerR.username}</h5>
								<Image
									src={playerR.avatar}
									alt={`${playerR.username}'s avatar`}
									width={100}
									height={100}
								/>
								<p>{`ELO: ${playerR.elo}`}</p>
								<h1>{scoreR}</h1>
							</>
						:
							<>
								<h5>Player 2</h5>
								<h1>{scoreR}</h1>
							</>
						}
					</div>
				</div>
			</>
		:
			<></>
		}
		</div>

		{/* Game canvas */}
		<div>
			<Pong
				scoreL={scoreL} setScoreL={setScoreL}
				scoreR={scoreR} setScoreR={setScoreR}
			/>
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
