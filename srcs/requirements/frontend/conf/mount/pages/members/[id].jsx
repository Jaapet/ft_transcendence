import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../../styles/base.module.css';
import Header from '../../components/Header';

export default function Profile({ status, user }) {
	/* TODO: Implement redirect here
	if (status === 404) {
		// redirect here
	}
	*/
	if (status === 401 || status === 404) {
		return (<p>Something went wrong...</p>);
	}

	/*
	Match objects contain:
	- winner			(Member Foreign Key)
	- loser				(Member Foreign Key)
	- winner_score		(IntegerField)
	- loser_score		(IntegerField)
	- start_datetime	(DateTimeField)
	- end_datetime		(DateTimeField)
	Indexed on:
	- winner
	- loser
	- end_datetime
	*/
	// Exemple de données de matchs
	const last_matches = [
		{ id: 1, winner: user.username, loser: 'Player1', winner_score: 10, loser_score: 4, start_datetime: '2024-05-10', end_datetime: '2024-05-10'},
		{ id: 2, winner: 'Player2', loser: user.username, winner_score: 10, loser_score: 7, start_datetime: '2024-05-05', end_datetime: '2024-05-05'},
		{ id: 3, winner: user.username, loser: 'Player3', winner_score: 10, loser_score: 2, start_datetime: '2024-05-03', end_datetime: '2024-05-03'},
	];

	return (
		<div>
			<Header />
			<div className={styles.container}>
				<Head>
					<title>Profile Page</title>
				</Head>
				<h1 className={`mt-3 ${styles.background_title}`}>{user.username}</h1>
				<div className="row">
					<div className="col-md-4">
						<div className={`card ${styles.customCard}`}>
							<Image src={user.avatar} alt="Profile Picture" width={150} height={150} className="card-img-top" />
							<div className="card-body">
								<h5 className="card-title">{user.username}</h5>
								{/* TODO: Add ELO here */}
								<p className="card-text"><small className="text-muted">Joined on: {user.join_date}</small></p>
							</div>
						</div>
					</div>
					<div className="col-md-8">
						<div className={`card ${styles.customCard}`}>
				<div className={`card ${styles.customCard}`}>
					<div className="card-body">
						<h5 className="card-title">Last Matches</h5>
						<ul className="list-group list-group">
							{last_matches.map(match => (
								<li key={match.id} className="list-group-item">
									{match.winner === user.username &&
										<p className="fs-2" style={{margin: '0'}}><strong style={{color: '#00B300'}}>{match.winner}</strong> vs {match.loser}</p>
									}
									{match.loser === user.username &&
										<p className="fs-2" style={{margin: '0'}}>{match.winner} vs <strong style={{color: '#B30086'}}>{match.loser}</strong></p>
									}
									<p className="fs-3" style={{margin: '0'}}>{match.winner_score}-{match.loser_score}</p>
									<p className="fs-4" style={{margin: '0'}}>{match.end_datetime}</p>
								</li>
							))}
						</ul>
						<p><a href="/account/match-history" className="link-offset-1-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover">See full match history</a></p>
						</div>
					</div>
							<div className="card-body">
								<h5 className="card-title">Contact Information</h5>
								<p className="card-text">Email: {user.email}</p>
							</div>
				</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export async function getServerSideProps(context) {
	const { id } = context.params;

	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/profile`, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Cookie': context.req.headers.cookie
			},
			body: JSON.stringify({ id })
		});
		if (!response) {
			throw new Error('User profile fetch failed');
		}
		if (response.status === 404) {
			return {
				props: {
					status: 404,
					user: null,
				}
			}
		}

		const data = await response.json();
		if (!data) {
			throw new Error('User profile fetch failed');
		}
		if (!response.ok) {
			throw new Error(data.message, 'User profile fetch failed');
		}

		return {
			props: {
				status: 200,
				user: data.user,
			}
		}
	} catch (error) {
		console.error('PROFILE:', error);
		return {
			props: {
				status: 401,
				user: null,
			}
		}
	}
}
