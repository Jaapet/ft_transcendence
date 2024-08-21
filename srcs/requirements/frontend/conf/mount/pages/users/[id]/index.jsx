import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../../../styles/base.module.css';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthenticationContext';
import { Card } from 'react-bootstrap';
import StatusCircle from '../../../components/StatusCircle';
import MatchScoreCard from '../../../components/MatchScoreCard';
import FriendButton from '../../../components/FriendButton';
import ToastList from '../../../components/toasts/ToastList';
import ErrorToast from '../../../components/toasts/ErrorToast';
import SuccessToast from '../../../components/toasts/SuccessToast';

const ProfileMemberCardPicture = ({ user }) => {
	return (
		<Card className={`${styles.customCard}`} style={{ width: '220px', backgroundColor: '#212529' }}>
			<Image
				src={user.avatar}
				alt="Profile Picture"
				width={220} height={220}
				style={{ objectFit: 'cover', width: 'auto', height: 'auto' }}
				className="card-img-top"
				priority={true}
			/>
			<div className="card-body">
				<div className={`card-body ${styles.cardInfo}`}>
					<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'start' }}>
						<StatusCircle status={user.is_online} />
						<h2 className="card-title" style={{ margin: 0, marginLeft: 5 }}>{user.username}</h2>
					</div>
				</div>
			</div>
		</Card>
	);
}

const ProfileMemberCardELO = ({ user }) => {
	return (
		<div className={`card ${styles.customCard}`} style={{backgroundColor:'transparent', marginTop: '20px', minWidth: '220px'}}>
			<div className="card-body" style={{backgroundColor:'rgba(255, 255, 255, 0.1)'}}>
				<p className="card-text"> Pong:{user.elo_pong} </p>
			</div>
		</div>
	);
}

const ProfileMemberCardFriendButton = ({ target_user, setShowError, setErrorMsg, setShowMsg, setMsg }) => {
	const { user } = useAuth();

	if (!user || !target_user || !user.id || !target_user.id || user.id === target_user.id) {
		return ;
	}

	return (
		<div className={`card ${styles.customCard}`} style={{marginTop: '15px', minWidth: '220px'}}>
			<FriendButton
				target_id={target_user.id}
				setShowError={setShowError}
				setErrorMsg={setErrorMsg}
				setShowMsg={setShowMsg}
				setMsg={setMsg}
			/>
		</div>
	);
}

const ProfileMemberCardEditButton = ({ target_user }) => {
	const { user } = useAuth();

	if (!user || !target_user || !user.id || !target_user.id || user.id !== target_user.id) {
		return ;
	}

	return (
		<div className={`card ${styles.customCard}`} style={{marginTop: '15px', minWidth: '220px'}}>
			<Link
				href={`${user.id}/edit`}
				type="button"
				className="btn btn-warning"
				style={{fontSize: '25px', textAlign: 'center'}}
			>
				Edit
			</Link>
		</div>
	);

	return (
		<Link href={`${user.id}/edit`} className={styles.minorbutton} passHref>
			<strong>Edit</strong>
		</Link>
	);
}

const ProfileMemberCard = ({ user, setShowError, setErrorMsg, setShowMsg, setMsg }) => {
	return (
		<div>
			{/* pp + join date */}
			<ProfileMemberCardPicture user={user} />

			{/* friend button */}
			<ProfileMemberCardFriendButton
				target_user={user}
				setShowError={setShowError}
				setErrorMsg={setErrorMsg}
				setShowMsg={setShowMsg}
				setMsg={setMsg}
			/>

			<div className='buttonVerticalContainer'>
				{/* Edit button */}
				<ProfileMemberCardEditButton target_user={user} />
			</div>

			{/* elo */}
			<ProfileMemberCardELO user={user} />

		</div>
	);
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
						<MatchScoreCard key={`${match.type}_${match.id}`} user={user} match={match} />
					))}
				</ul>
			</div>
		</div>
	);
}

const ProfileSideInfo = ({ user, last_matches }) => {
	return (
		<div className={`card-body ${styles.cardInfo}`}>
			<h5 className="card-text">Last Matches</h5>
			<ProfileMatchList user={user} last_matches={last_matches} />
			<p>
				<Link
					href={`/users/${user.id}/match_history`}
					passHref
					className="link-offset-1-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover"
				>
					See {user.username}'s full match history
				</Link>
			</p>
		</div>
	);
}

const ProfileToasts = ({ showError, setShowError, errorMsg, setErrorMsg, showMsg, setShowMsg, msg, setMsg }) => {
	return (
		<ToastList position="top-right">
			<ErrorToast
				name="Error"
				show={showError}
				setShow={setShowError}
				errorMessage={errorMsg}
				setErrorMessage={setErrorMsg}
			/>
			<SuccessToast
				name="Success"
				show={showMsg}
				setShow={setShowMsg}
				message={msg}
				setMessage={setMsg}
			/>
		</ToastList>
	);
}

export default function Profile({ status, detail, user, last_matches }) {
	const [showError, setShowError] = useState(false);
	const [errorMsg, setErrorMsg] = useState('');
	const [showMsg, setShowMsg] = useState(false);
	const [msg, setMsg] = useState('');
	const { logout } = useAuth();

	const handleLogout = async () => {
		await logout();
	}

	if (status === 401 && detail === 'Not logged in') {
		handleLogout();
	}

	if (status !== 200 || !user) {
		return (
			<div className={styles.container}>
				<p className="bg-light text-black">Something went wrong...</p>
				<p className="bg-light text-black">Please reload the page.</p>
			</div>
		);
	}

	return (
			<div className={styles.container}>
				<ProfileToasts
					showError={showError}
					setShowError={setShowError}
					errorMsg={errorMsg}
					setErrorMsg={setErrorMsg}
					showMsg={showMsg}
					setShowMsg={setShowMsg}
					msg={msg}
					setMsg={setMsg}
				/>

				<Head>
					<title>Profile Page</title>
				</Head>

				<h1 className={`mt-3 ${styles.background_title}`}>{user.username}</h1>
				<div className={`card ${styles.backCard}`}>
				<div className="row">
					<div className="col-md-4">
						<ProfileMemberCard
							user={user}
							setShowError={setShowError}
							setErrorMsg={setErrorMsg}
							setShowMsg={setShowMsg}
							setMsg={setMsg}
						/>
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
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/profile`, {
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
					detail: 'Resource not found',
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
				detail: 'Success',
				user: data.user,
				last_matches: data.last_matches
			}
		}
	} catch (error) {
		//console.error('USER PROFILE:', error);
		return {
			props: {
				status: 401,
				detail: error.message,
				user: null,
				last_matches: null
			}
		}
	}
}
