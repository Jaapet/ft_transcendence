import { useState } from 'react';
import React from 'react';
import Head from 'next/head';
import styles from '../../../styles/base.module.css';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthenticationContext';
import MatchScoreCard from '../../../components/MatchScoreCard';
import { Card, Nav } from 'react-bootstrap';

const UserMatchHistoryListEmpty = ({ user }) => {
	return (
		<div>
			<h4 className="mb-0">No matches to display :/</h4>
			<p>
				<Link
					href={`/users/${user.id}`}
					passHref
					className="link-offset-1-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover"
				>
					Back to {user.username}'s profile
				</Link>
			</p>
		</div>
	);
}

const UserMatchHistoryListMatch = ({ user, matches }) => {
	if (!matches || matches.length < 1) {
		return (<UserMatchHistoryListEmpty user={user} />);
	}

	return (
		<Card.Body className={`${styles.cardInfo}`}>
			<h4>{user.username}'s match history</h4>
			<Card className={`${styles.customCard}`}>
				<Card.Body>
					<ul className="list-group list-group">
						{matches.map(match => (
							<MatchScoreCard key={`${match.type}_${match.id}`} user={user} match={match} />
						))}
					</ul>
				</Card.Body>
			</Card>
			<p>
				<Link
					href={`/users/${user.id}`}
					passHref
					className={`link-offset-1-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover`}
				>
					Back to {user.username}'s profile
				</Link>
			</p>
		</Card.Body>
	);
}

const UserMatchHistoryList = ({ user, activeTab, pong2_matches, pong3_matches, royal_matches }) => {
	if (activeTab === '#pong2') {
		return (<UserMatchHistoryListMatch user={user} matches={pong2_matches} />);
	} else if (activeTab === '#pong3') {
		return (<UserMatchHistoryListMatch user={user} matches={pong3_matches} />);
	} else if (activeTab === '#royal') {
		return (<UserMatchHistoryListMatch user={user} matches={royal_matches} />);
	} else {
		return (<Card.Text>Somethig went wrong...</Card.Text>);
	}
}

export default function UserMatchHistory({ status, detail, user, pong2_matches, pong3_matches, royal_matches }) {
	const { logout } = useAuth();
	const [activeTab, setActiveTab] = useState('#pong2');

	const handleSelect = (eventKey) => {
		setActiveTab(eventKey);
	}

	const handleLogout = async () => {
		await logout();
	}

	if (status === 401 && detail === 'Not logged in') {
		handleLogout();
	}

	if (status !== 200 || !user || !pong2_matches || !pong3_matches || !royal_matches) {
		return (
			<div className={styles.container}>
				<p className="bg-light text-black">Something went wrong...</p>
				<p className="bg-light text-black">Please reload the page.</p>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<Head>
				<title>Profile Page</title>
			</Head>
			
			<h1 className={`mt-1 ${styles.background_title}`}>{user.username}</h1>
			<Card
				className="bg-dark text-white mt-3"
				style={{ width: '60%', bottom: '30px'}}
			>
				<Card.Header >
					<Nav
						justify
						variant="tabs"
						defaultActiveKey="#pong2"
						onSelect={handleSelect}
						className="bg-dark text-white"
					>
						<Nav.Item>
							<Nav.Link href='#pong2'>Pong 1v1</Nav.Link>
						</Nav.Item>
						<Nav.Item>
							<Nav.Link href='#pong3'>Pong 1v2</Nav.Link>
						</Nav.Item>
						<Nav.Item>
							<Nav.Link href='#royal'>Royal Pong</Nav.Link>
						</Nav.Item>
					</Nav>
				</Card.Header>
				<Card.Body>
					<UserMatchHistoryList
						user={user}
						activeTab={activeTab}
						pong2_matches={pong2_matches}
						pong3_matches={pong3_matches}
						royal_matches={royal_matches}
					/>
				</Card.Body>
			</Card>
		</div>
	);
}

export async function getServerSideProps(context) {
	const { id } = context.params;

	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/user_match_history`, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Cookie': context.req.headers.cookie
			},
			body: JSON.stringify({ id })
		});
		if (!response) {
			throw new Error('User match history fetch failed');
		}
		if (response.status === 404) {
			return {
				props: {
					status: 404,
					detail: 'Resource not found',
					user: null,
					pong2_matches: null,
					pong3_matches: null,
					royal_matches: null
				}
			}
		}

		const data = await response.json();
		if (!data) {
			throw new Error('User match history fetch failed');
		}
		if (!response.ok) {
			throw new Error(data.message, 'User match history fetch failed');
		}

		return {
			props: {
				status: 200,
				detail: 'Success',
				user: data.user,
				pong2_matches: data.pong2_matches,
				pong3_matches: data.pong3_matches,
				royal_matches: data.royal_matches
			}
		}
	} catch (error) {
		console.error('USER MATCH HISTORY:', error);
		return {
			props: {
				status: 401,
				detail: error.message,
				user: null,
				pong2_matches: null,
				pong3_matches: null,
				royal_matches: null
			}
		}
	}
}
