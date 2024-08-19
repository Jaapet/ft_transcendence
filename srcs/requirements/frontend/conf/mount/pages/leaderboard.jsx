import React from 'react';
import { Card, Col, Row, Table } from 'react-bootstrap';
import Link from 'next/link';
import styles from '../styles/base.module.css';
import { useAuth } from '../context/AuthenticationContext';

const LeaderboardTableRow = ({ player, index, type }) => {
	//console.log(player); // debug
	return (
		<tr key={index} className={`list-group-item ${styles.customList} d-flex justify-content-between`}>
			<th>{index}</th>
			<th>
				<Link
					href={`/users/${player.id}`}
					passHref
					style={{color: '#38255faa', texthecoration: 'none'}}
				>
					{player.username}
				</Link>
			</th>
			<th>{type === 'pong' ? player.elo_pong : player.elo_royal}</th>
		</tr>
	);
}

const LeaderboardTable = ({ title, leaders, type }) => {
	return (
		<Card className={styles.customCard}>
			<Card.Body>
				<Card.Title className={styles.cardInfo}>{title}</Card.Title>

				<table className="list-group" style={{minWidth: '300px', maxWidth: '375px'}}>
					<thead className={`list-group-item ${styles.customList}`}>
						<tr key="0" className="d-flex justify-content-between">
							<th scope="col">Rank</th>
							<th scope="col">Player</th>
							<th scope="col">ELO</th>
						</tr>
					</thead>
					<tbody>
						{leaders.map((player, index) => (
							<LeaderboardTableRow player={player} index={index + 1} type={type} />
						))}
					</tbody>
				</table>

			</Card.Body>
		</Card>
	);
}

export default function Leaderboard({ status, detail, pong, royal }) {
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

	//console.log('pong', pong); // debug
	//console.log('royal', royal); // debug

	return (
		<div className={styles.container}>
			<h1 className={styles.background_title} style={{margin: '20px'}}>Leaderboards</h1>
			<Card className={styles.backCard} style={{}}>
				<Row>
					<Col md={6}>
						<LeaderboardTable title={'Classic Pong Players'} leaders={pong} type={'pong'} />
					</Col>
					<Col md={6}>
						<LeaderboardTable title={'Royal Pong Players'} leaders={royal} type={'royal'} />
					</Col>
				</Row>
			</Card>
		</div>
	);
}

export async function getServerSideProps(context) {
	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/leaderboards`, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Cookie': context.req.headers.cookie
			}
		});
		if (!response) {
			throw new Error('Leaderboards fetch failed');
		}
		if (response.status === 404) {
			return {
				props: {
					status: 404,
					detail: 'Resource not found',
					pong: null,
					royal: null
				}
			}
		}

		const data = await response.json();
		if (!data) {
			throw new Error('Leaderboards fetch failed');
		}
		if (!response.ok) {
			throw new Error(data.message, 'Leaderboards fetch failed');
		}

		return {
			props: {
				status: 200,
				detail: 'Success',
				pong: data.pong,
				royal: data.royal
			}
		}
	} catch (error) {
		console.error('USER LEADERBOARDS:', error);
		return {
			props: {
				status: 401,
				detail: error.message,
				pong: null,
				royal: null
			}
		}
	}
}
