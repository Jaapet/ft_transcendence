import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../../../styles/base.module.css';
import Header from '../../../components/Header';

{/* <div className={`card ${styles.customCard}`}></div> */}

const ProfileMemberCard = ({ user }) => {
	return (
		<div>
			{/* pp + join date */}
			<div className={`card ${styles.customCard}`}>
			<Image src={user.avatar} alt="Profile Picture" width={720} height={360} className="card-img-top" />
				<div className="card-body">
					<h5 className="card-title">{user.username}</h5>
					<p className="card-text"><small className="text-muted">Joined on:<br/>{user.join_date}</small></p>
				</div>
			</div>

			{/* elo */}
			<div className={`card ${styles.customCard}`} style={{backgroundColor:'transparent', marginTop: '20px' }}>
				<div className="card-body">
					<p className="card-text"> future elo here</p>
				</div>
			</div>
		</div>
	);
}



const ProfileMatchPlayerLink = ({ id, username }) => {
	if (id === null) {
		return (<span>{username}</span>);
	}

	return (
		<a href={`/users/${id}`} className="link-offset-1-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover">
			{username}
		</a>
	);
}

const ProfileMatchPlayers = ({ user, match }) => {
	if (match.winner_id === user.id) {
		return (
			<p className="fs-2 mb-0">
				<strong style={{color: '#00B300'}}>
					{match.winner_username}
				</strong>
				&nbsp;vs&nbsp;
				<ProfileMatchPlayerLink id={match.loser_id} username={match.loser_username} />
			</p>
		);
	} else if (match.loser_id === user.id) {
		return (
			<p className="fs-2 mb-0">
				<ProfileMatchPlayerLink id={match.winner_id} username={match.winner_username} />
				&nbsp;vs&nbsp;
				<strong style={{color: '#B30086'}}>
					{match.loser_username}
				</strong>
			</p>
		);
	}
}

const ProfileMatchList = ({ user, last_matches }) => {
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

	if (!last_matches || last_matches.length < 1) {
		return (
			<div className={`card ${styles.customCard}`}>
				<div className="card-body">
					<h5 className="card-title mb-0">No matches to display :/</h5>
				</div>
			</div>
		);
	}

	return (
		<div className={`card ${styles.customCard}`}>
			<div className="card-body">
				
				<ul className="list-group list-group">
					{last_matches.map(match => (
 						<li key={match.id} className={`list-group-item ${styles.customList}`}>							<ProfileMatchPlayers user={user} match={match} />
							<p className="fs-3 mb-0">{match.winner_score}-{match.loser_score}</p>
							<p className="fs-4 mb-0">{match.end_date}</p>
						</li>
					))}
				</ul>
				<p><a href={`/users/${user.id}/match_history`} className="link-offset-1-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover">
					See {user.username}'s full match history
				</a></p>
			</div>
		</div>
	);
}

const ProfileSideInfo = ({ user, last_matches }) => {
	return (
		<div className={`card ${styles.backCard}`}>
			<div className={`card-body ${styles.cardInfo}`}>
				<h5 className="card-text">Last Matches</h5>
				<ProfileMatchList user={user} last_matches={last_matches} />
				<h5 className="card-text">Email: {user.email}</h5>
			</div>
		</div>
	);
	
}

export default function Profile({ status, user, last_matches }) {
	/* TODO: Implement redirect here
	if (status === 404) {
		// redirect here
	}
	*/
	if (status === 401 || status === 404) {
		return (<p>Something went wrong...</p>);
	}

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
						<ProfileMemberCard user={user} />
					</div>
					<div className="col-md-8">
						<ProfileSideInfo user={user} last_matches={last_matches} />
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
					last_matches: null
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
				last_matches: data.last_matches
			}
		}
	} catch (error) {
		console.error('USER PROFILE:', error);
		return {
			props: {
				status: 401,
				user: null,
				last_matches: null
			}
		}
	}
}
