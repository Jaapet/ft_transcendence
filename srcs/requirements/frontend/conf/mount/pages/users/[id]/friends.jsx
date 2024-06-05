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

const RemoveFriendButton = ({ myFriends, setMyFriends, target_id }) => {
	const { removeFriend } = useUser();

	const handleClick = async (event) => {
		event.preventDefault();
		const success = await removeFriend({target_id});
		if (success) {
			setMyFriends((myFriends) => myFriends.filter(friend => friend.id !== target_id));
		}
	}

	// TODO: Make this a bootstrap button!
	return (
		<Button variant="danger" onClick={handleClick} style={{ fontSize: '15px' }} >
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
			<div className="ms-1 me-auto text-start" style={{ display: 'flex', flexDirection: 'row' }}>
				<div className="mt-2 mb-0 ml-0 mr-1">
					<Link href={`/users/${friend.id}`} passHref>
						<a>
							<Image
								src={friend.avatar}
								alt={`${friend.username}'s avatar`}
								width={40}
								height={40}
							/>
						</a>
					</Link>
				</div>
				<div className="mx-2 my-2">
					<Link href={`/users/${friend.id}`} passHref>
						<a className="link-offset-1-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover">
							{friend.username}
						</a>
					</Link>
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

export default function UserFriends({ status, current_user, friends }) {
	const { user } = useAuth();
	const { userError, userMsg, clearUserError, clearUserMsg } = useUser();

	const [showError, setShowError] = useState(false);
	const [errorMsg, setErrorMsg] = useState('');
	const [showMsg, setShowMsg] = useState(false);
	const [msg, setMsg] = useState('');
	const [myFriends, setMyFriends] = useState(friends);

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

	/* TODO: Implement redirect here
	if (status === 404) {
		// redirect here
	}
	*/

	if (!user || !user.id || status === 401 || status === 404) {
		return (
			<div className={styles.container}>
				<Head>
					<title>Error</title>
				</Head>
				<p>Something went wrong...</p>
			</div>
		);
	}

// TODO: Do we really need to forbid users from seeing other users' friend lists?
	if (current_user.id !== user.id) {
		return (
			<div className={styles.container}>
				<Head>
					<title>Forbidden</title>
				</Head>
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
				minHeight: '91vh',
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
				<UserFriendList user={user} friends={friends} setMyFriends={setMyFriends} />
				<p>
					<Link href={`/users/${user.id}/friend_requests`} passHref>
						<a className={`link-offset-1-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover`}>
							Go to friend requests inbox
						</a>
					</Link>
				</p>
				<p>
					<Link href={`/users/${user.id}`} passHref>
						<a className={`link-offset-1-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover`}>
							Back to profile
						</a>
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
				current_user: data.user,
				friends: data.friends
			}
		}
	} catch (error) {
		console.error('USER FRIEND LIST:', error);
		return {
			props: {
				status: 401,
				current_user: null,
				friends: null
			}
		}
	}
}
