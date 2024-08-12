import React, { useState } from 'react';
import {Row, Col, Button, Card, Dropdown } from 'react-bootstrap';
import styles from '../styles/base.module.css';
import { useAuth } from '../context/AuthenticationContext';

export default function HowToPlay({ status, detail }) {
	const [selectedGame, setSelectedGame] = useState('game1');
	const [numberOfPlayers, setNumberOfPlayers] = useState(2);
	const { logout } = useAuth();

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

	const renderGameDescription = () => {
		/* classic pong */
		if (selectedGame === 'game1') {
			return (
				<Card className={styles.customCard}>
					<Card.Body>
						<Card.Title className={styles.cardInfo}>Classic Pong Rules</Card.Title>
						<Dropdown>
							<Dropdown.Toggle variant="success" id="dropdown-basic">
								{numberOfPlayers} Players
							</Dropdown.Toggle>
							<Dropdown.Menu>
								<Dropdown.Item onClick={() => setNumberOfPlayers(2)}>2 Players</Dropdown.Item>
								<Dropdown.Item onClick={() => setNumberOfPlayers(3)}>3 Players</Dropdown.Item>
							</Dropdown.Menu>
						</Dropdown>
						<div className="mt-3">
							{numberOfPlayers === 2 ? (
								<p className="text-justify">
									In 2-player Classic Pong, the goal is to score by hitting the ball past your opponent's paddle.
									Players move their paddles vertically with the up and down arrow keys in order to hit the ball.
									The first to reach 5 points wins.
								</p>
							) : (
								<p class="text-justify">
									In this modified version of Pong for 3 players, the objective of the ball player is to pass behind a paddle before the timer runs out. The paddles win if the timer runs out before the ball can score.
									Each paddle player controls a paddle vertically and tries to block the ball. The ball player can influence the ball's movement vertically. All players use the up and down arrow keys.
								</p>
							)}
						</div>
					</Card.Body>
				</Card>
			);
		}

		/* royal pong */
/* 		else if (selectedGame === 'game2') {
			return (
				<Card className={styles.customCard}>
					<Card.Body>
						<Card.Title className={styles.cardInfo}>Royal Pong Rules</Card.Title>
						<Card.Text>
							Royal Pong is a battle royale game inspired by Pong where every player controls a ball.
							The balls bounce off each other, allowing players to push the others around.
							The objective is to be the last ball remaining on the platform. If you get pushed off the platform, your game ends there.
						</Card.Text>
					</Card.Body>
				</Card>
			);
		}
		*/	
	};

	return (
		<div className={styles.container}>
			<h1 className={styles.background_title } style={{marginTop: '0.5cm'}}>? How to Play ?</h1>

			<Card className={styles.backCard} style={{marginTop: '0.5cm'}}>
				<Row>
					<Col className="text-center">
						<p>Select a game to view its instructions:</p>
							<Button
								className={`${styles.button} ${selectedGame === 'game1' ? '' : styles.selected}`}
								style={{ fontSize: '38px' }}
								onClick={() => setSelectedGame('game1')}
							>
								Classic Pong
							</Button>
	{/* 						<Button
								className={`${styles.button} ${selectedGame === 'game2' ? '' : styles.selected}`}
								style={{ fontSize: '38px' }}
								onClick={() => setSelectedGame('game2')}
							>
								Royal Pong
							</Button> */}
					</Col>
				</Row>
				<Row className="mt-4">
					<Col>
						{renderGameDescription()}
					</Col>
				</Row>
			</Card>
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
