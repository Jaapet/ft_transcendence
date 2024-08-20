import { useEffect, useState } from 'react';
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../../../styles/base.module.css';
import { useAuth } from '../../../context/AuthenticationContext';
import { useUser } from '../../../context/UserContext';
import { ListGroup, Button } from 'react-bootstrap';
import ToastList from '../../../components/toasts/ToastList';
import ErrorToast from '../../../components/toasts/ErrorToast';
import SuccessToast from '../../../components/toasts/SuccessToast';
import StatusCircle from '../../../components/StatusCircle';

const RemoveFriendButton = ({ myFriends, setMyFriends, target_id }) => {
	const { removeFriend } = useUser();

	const handleClick = async (event) => {
		event.preventDefault();
		const success = await removeFriend({target_id});
		if (success) {
			setMyFriends((myFriends) => myFriends.filter(friend => friend.id !== target_id));
		}
	}

	return (
		<Button variant="danger" onClick={handleClick} style={{ fontSize: '15px', marginTop: '10px', position: 'absolute', right: '10px' }} >
			Remove friend
		</Button>
	);
}

const UserFriendListFriend = ({ myFriends, setMyFriends, friend }) => {
	return (
		<ListGroup.Item
			className={`
				d-flex
				justify-content-between
				align-items-center
				bg-dark
				text-white
			`}
		>
			<div className="ms-1 me-auto text-start" style={{ display: 'flex', flexDirection: 'row', padding: '5px', fontSize: '1.2em', minWidth: '450px' }}>
				<div className="mt-2 mb-0 ml-0 mr-1">
					<Link href={`/users/${friend.id}`} passHref>
						<Image style={{marginBottom: '5px'}}
							src={friend.avatar}
							alt={`${friend.username}'s avatar`}
							width={45}
							height={45}
						/>
					</Link>
				</div>
				<div className="mx-2 my-2">
					<Link
						href={`/users/${friend.id}`}
						passHref
						className="link-offset-1-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover"
					>
						{friend.username}
					</Link>
				</div>
				<div
					style={{
						position: 'absolute',
						right: '3.3cm',
						marginRight: '10px',
						marginTop:'9px'
					}}
				>
					<StatusCircle status={friend.is_online} />
				</div>
				<div>
					<RemoveFriendButton
						myFriends={myFriends}
						setMyFriends={setMyFriends}
						target_id={friend.id}
					/>
				</div>
			</div>
		</ListGroup.Item>
	);
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
	const UserFriendList = ({ user, myFriends, setMyFriends }) => {

		if (!myFriends || myFriends.length < 1) {
			return (
				<div className={`card ${styles.customCard}`}>
					<div className="card-body">
						<h2 className="card-title mb-0">You have no friends 🤭🫵</h2>
						<img src="/images/sadboy.png" alt="Royal Icon" style={{ width: '50%', height: 'auto' }}></img>
					</div>
				</div>
			);
		}

	return (
		<div className={`card-body ${styles.cardInfo}`}>
			<div className={`card ${styles.customCard}`}>
				<div className="card-body">
					<ListGroup>
						{myFriends.map(friend => (
							<UserFriendListFriend 
								key={friend.id}
								myFriends={myFriends}
								setMyFriends={setMyFriends}
								friend={friend}
							/>
						))}
					</ListGroup>
				</div>
			</div>
		</div>
	);
}

const FriendListToasts = ({ showError, setShowError, errorMsg, setErrorMsg, showMsg, setShowMsg, msg, setMsg }) => {
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

export default function UserFriends({ status, detail, current_user, friends }) {
	const { user, logout } = useAuth();
	const { userError, userMsg, clearUserError, clearUserMsg } = useUser();

	const [showError, setShowError] = useState(false);
	const [errorMsg, setErrorMsg] = useState('');
	const [showMsg, setShowMsg] = useState(false);
	const [msg, setMsg] = useState('');
	const [myFriends, setMyFriends] = useState(friends);

	const handleLogout = async () => {
		await logout();
	}

	useEffect(() => {
		if (userError) {
			setErrorMsg(userError);
			setShowError(true);
			clearUserError();
		}
		if (userMsg) {
			setMsg(userMsg);
			setShowMsg(true);
			clearUserMsg();
		}
	}, [userError, userMsg, setErrorMsg, setShowError, setMsg, setShowMsg, clearUserError, clearUserMsg]);

	if (status === 401 && detail === 'Not logged in') {
		handleLogout();
	}

	if (status !== 200 || !user || !current_user || !current_user.id || !user || !user.id) {
		return (
			<div className={styles.container}>
				<p className="bg-light text-black">Something went wrong...</p>
				<p className="bg-light text-black">Please reload the page.</p>
			</div>
		);
	}

	if (current_user.id !== user.id) {
		return (
			<div className={styles.container}>
				<p className="bg-light text-black">Forbidden</p>
			</div>
		);
	}

	return (
		<div
			className={styles.container}
			style={{

				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				minHeight: 'calc(100vh - 68px)',
				flexDirection: 'column',
				textAlign: 'center',
			}}
		>
			<FriendListToasts
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
				<title>Friend List</title>
			</Head>

			<h1 className={styles.background_title}>Your friends</h1>
			<div className={`card ${styles.backCard}`}>
				<UserFriendList user={user} myFriends={myFriends} setMyFriends={setMyFriends} />
				<p>
					<Link
						href={`/users/${user.id}/friend_requests`}
						passHref
						className={`link-offset-1-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover`}
					>
						Go to friend requests inbox
					</Link>
				</p>
				<p>
					<Link
						href={`/users/${user.id}`}
						passHref
						className={`link-offset-1-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover`}
					>
						Back to profile
					</Link>
				</p>
			</div>
		</div>
	);
}

export async function getServerSideProps(context) {
	const { id } = context.params;

	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/current_user/friends`, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Cookie': context.req.headers.cookie
			},
			body: JSON.stringify({ id })
		});
		if (!response) {
			throw new Error('User friend list fetch failed');
		}
		if (response.status === 404) {
			return {
				props: {
					status: 404,
					detail: 'Resource not found',
					current_user: null,
					friends: null
				}
			}
		}

		const data = await response.json();
		if (!data) {
			throw new Error('User friend list fetch failed');
		}
		if (!response.ok) {
			throw new Error(data.message, 'User friend list fetch failed');
		}

		return {
			props: {
				status: 200,
				detail: 'Success',
				current_user: data.user,
				friends: data.friends
			}
		}
	} catch (error) {
		//console.error('USER FRIEND LIST:', error);
		return {
			props: {
				status: 401,
				detail: error.message,
				current_user: null,
				friends: null
			}
		}
	}
}
