import React from 'react';
import Head from 'next/head';
import styles from '../../../styles/base.module.css';
import Link from 'next/link';

const UserMatchHistoryMatchPlayerLink = ({ id, username }) => {
	if (id === null) {
		return (<span>{username}</span>);
	}

	return (
		<Link href={`/users/${id}`} passHref>
			<a className="link-offset-1-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover">
				{username}
			</a>
		</Link>
	);
}

const UserMatchHistoryMatchPlayers = ({ user, match }) => {
	if (match.winner_id === user.id) {
		return (
			<p className="fs-2 mb-0">
				<strong style={{color: '#00B300'}}>
					{match.winner_username}
				</strong>
				&nbsp;vs&nbsp;
				<UserMatchHistoryMatchPlayerLink id={match.loser_id} username={match.loser_username} />
			</p>
		);
	} else if (match.loser_id === user.id) {
		return (
			<p className="fs-2 mb-0">
				<UserMatchHistoryMatchPlayerLink id={match.winner_id} username={match.winner_username} />
				&nbsp;vs&nbsp;
				<strong style={{color: '#B30086'}}>
					{match.loser_username}
				</strong>
			</p>
		);
	}
}

/*
Match objects contain:
- url							(url to match resource in backend)
- id							(unique id)
- winner					(url to backend resource)
- loser						(url to backend resource)
- winner_score		(number)
	- loser_score			(number)
	- start_date			(string 'Month DD YYYY')
	- end_date				(string 'Month DD YYYY')
	- start_time			(string 'HH:MM')
	- end_time				(string 'HH:MM')
	- winner_username	(string)
	- loser_username	(string)
	- winner_id				(number)
	- loser_id				(number)
	Indexed on:
	- winner
	- loser
	- end_datetime
	*/
	const UserMatchHistoryList = ({ user, matches }) => {

		if (!matches || matches.length < 1) {
			return (
				<div className={`card ${styles.customCard}`}>
					<div className="card-body">
						<h5 className="card-title mb-0">No matches to display :/</h5>
						<p>
							<Link href={`/users/${user.id}`} passHref>
								<a className="link-offset-1-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover">
									Back to {user.username}'s profile
								</a>
							</Link>
						</p>
					</div>
				</div>
			);
		}

	return (
		<div className={`card-body ${styles.cardInfo}`}>
			<h4 className="card-title">{user.username}'s match history</h4>
			<div className={`card ${styles.customCard}`}>
				<div className="card-body">
					<ul className="list-group list-group">
						{matches.map(match => (
							<li key={match.id} className={`list-group-item ${styles.customList}`}>
								<UserMatchHistoryMatchPlayers user={user} match={match} />
								<p className="fs-3 mb-0">{match.winner_score}-{match.loser_score}</p>
								<p className="fs-4 mb-0">{match.end_date}</p>
							</li>
						))}
					</ul>
				</div>
			</div>
			<p>
				<Link href={`/users/${user.id}`} passHref>
					<a className={`link-offset-1-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover`}>
						Back to {user.username}'s profile
					</a>
				</Link>
			</p>
		</div>
	);
}

export default function UserMatchHistory({ status, user, matches }) {
	/* TODO: Implement redirect here
	if (status === 404) {
		// redirect here
	}
	*/
	if (status === 401 || status === 404) {
		return (<p>Something went wrong...</p>);
	}

	return (
		<div className={styles.container}>
			<Head>
				<title>Profile Page</title>
			</Head>
			
			<h1 className={`mt-3 ${styles.background_title}`}>{user.username}</h1>
			<div className={`card ${styles.backCard}`}>
				<UserMatchHistoryList user={user} matches={matches} />
			</div>
		</div>
	);
};

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
					user: null,
					matches: null
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
				user: data.user,
				matches: data.matches
			}
		}
	} catch (error) {
		console.error('USER MATCH HISTORY:', error);
		return {
			props: {
				status: 401,
				user: null,
				matches: null
			}
		}
	}
}
