import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../../styles/base.module.css';
import { useAuth } from '../../../context/AuthenticationContext';
import { useUser } from '../../../context/UserContext';
import { Card, Nav, ListGroup, Button } from 'react-bootstrap';
import ToastList from '../../../components/toasts/ToastList';
import ErrorToast from '../../../components/toasts/ErrorToast';
import SuccessToast from '../../../components/toasts/SuccessToast';

const AcceptFriendRequestButton = ({ requests, setReqs, request_id, setShowError, setErrorMsg, setShowMsg, setMsg }) => {
	const { acceptFriendRequest } = useUser();

	const handleClick = async (event) => {
		event.preventDefault();
		const success = await acceptFriendRequest({request_id});
		if (success) {
			setReqs((requests) => requests.filter(request => request.id !== request_id));
		}
	}

	return (
		<Button variant="success" className="me-2" onClick={handleClick}>
			Accept
		</Button>
	);
}

const DeclineFriendRequestButton = ({ requests, setReqs, request_id, setShowError, setErrorMsg, setShowMsg, setMsg }) => {
	const { declineFriendRequest } = useUser();

	const handleClick = async (event) => {
		event.preventDefault();
		const success = await declineFriendRequest({request_id});
		if (success) {
			setReqs((requests) => requests.filter(request => request.id !== request_id));
		}
	}

	return (
		<Button variant="outline-danger" onClick={handleClick}>
			Decline
		</Button>
	);
}

const DeleteFriendRequestButton = ({ requests, setReqs, request_id, setShowError, setErrorMsg, setShowMsg, setMsg }) => {
	const { deleteFriendRequest } = useUser();

	const handleClick = async (event) => {
		event.preventDefault();
		const success = await deleteFriendRequest({request_id});
		if (success) {
			setReqs((requests) => requests.filter(request => request.id !== request_id));
		}
	}

	return (
		<Button variant="danger" onClick={handleClick}>
			Delete
		</Button>
	);
}

const UserFriendRequestSent = ({ requests, setReqs, request, setShowError, setErrorMsg, setShowMsg, setMsg }) => {
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
			<div className="ms-2 me-auto text-start" style={{ display: 'flex', flexDirection: 'column' }}>
				<div style={{ fontSize: 'max(min(2vw, 30px), 20px)' }}>
					You invited&nbsp;
					<Link
						href={`/users/${request.recipient_id}`}
						passHref
						className="link-offset-1-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover"
					>
						{request.recipient_username}
					</Link>
				</div>
				<div style={{ fontSize: 'max(min(1.4vw, 21px), 14px)' }}>
					{request.date} {request.time}
				</div>
			</div>
			<DeleteFriendRequestButton
				requests={requests}
				setReqs={setReqs}
				request_id={request.id}
				setShowError={setShowError}
				setErrorMsg={setErrorMsg}
				setShowMsg={setShowMsg}
				setMsg={setMsg}
			/>
		</ListGroup.Item>
	);
}

const UserFriendRequestsTableBodySent = ({ requests, setReqs, setShowError, setErrorMsg, setShowMsg, setMsg }) => {
	if (!requests || requests.length < 1) {
		return (
			<div>
			<Card.Text>Don't you want to socialize?</Card.Text>
				<img src="/images/lonelyguy.png" style={{ width: '20%', height: 'auto' }} priority={true}></img>
			</div>
		);
	}

	return (
		<ListGroup>
			{ requests.map(request => (
				<UserFriendRequestSent
					key={request.id}
					requests={requests}
					setReqs={setReqs}
					request={request}
					setShowError={setShowError}
					setErrorMsg={setErrorMsg}
					setShowMsg={setShowMsg}
					setMsg={setMsg}
				/>
			)) }
		</ListGroup>
	);
}

const UserFriendRequestReceived = ({ requests, setReqs, request, setShowError, setErrorMsg, setShowMsg, setMsg }) => {
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
			<div className="ms-2 me-auto text-start" style={{ display: 'flex', flexDirection: 'column' }}>
				<div style={{ fontSize: 'max(min(2vw, 30px), 20px)' }}>
					<Link
						href={`/users/${request.sender_id}`}
						passHref
						className="link-offset-1-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover"
					>
						{request.sender_username}
					</Link>
					&nbsp;invited you
				</div>
				<div style={{ fontSize: 'max(min(1.4vw, 21px), 14px)' }}>
					{request.date} {request.time}
				</div>
			</div>
			<AcceptFriendRequestButton
				requests={requests}
				setReqs={setReqs}
				request_id={request.id}
				setShowError={setShowError}
				setErrorMsg={setErrorMsg}
				setShowMsg={setShowMsg}
				setMsg={setMsg}
			/>
			<DeclineFriendRequestButton
				requests={requests}
				setReqs={setReqs}
				request_id={request.id}
				setShowError={setShowError}
				setErrorMsg={setErrorMsg}
				setShowMsg={setShowMsg}
				setMsg={setMsg}
			/>
		</ListGroup.Item>
	);
}

const UserFriendRequestsTableBodyReceived = ({ requests, setReqs, setShowError, setErrorMsg, setShowMsg, setMsg }) => {
	if (!requests || requests.length < 1) {
		return (
			<div>
			<Card.Text>You're not interesting anyone...</Card.Text>
				<img src="/images/aloneguy.png" style={{ width: '20%', height: 'auto' }} priority={true}></img>
			</div>
		);
	}

	return (
		<ListGroup>
			{ requests.map(request => (
				<UserFriendRequestReceived
					key={request.id}
					requests={requests}
					setReqs={setReqs}
					request={request}
					setShowError={setShowError}
					setErrorMsg={setErrorMsg}
					setShowMsg={setShowMsg}
					setMsg={setMsg}
				/>
			)) }
		</ListGroup>
	);
}

const UserFriendRequestsTableBody = ({ activeTab, sent, recv, setSent, setRecv, setShowError, setErrorMsg, setShowMsg, setMsg }) => {
	if (activeTab === '#sent') {
		return (
			<UserFriendRequestsTableBodySent
				requests={sent}
				setReqs={setSent}
				setShowError={setShowError}
				setErrorMsg={setErrorMsg}
				setShowMsg={setShowMsg}
				setMsg={setMsg}
			/>
		);
	} else if (activeTab === '#received') {
		return (
			<UserFriendRequestsTableBodyReceived
				requests={recv}
				setReqs={setRecv}
				setShowError={setShowError}
				setErrorMsg={setErrorMsg}
				setShowMsg={setShowMsg}
				setMsg={setMsg}
			/>
		);
	} else {
		return (<Card.Text>Somethig went wrong...</Card.Text>);
	}
}

const UserFriendRequestsTable = ({ sent, recv, setSent, setRecv, setShowError, setErrorMsg, setShowMsg, setMsg }) => {
	const [activeTab, setActiveTab] = useState('#received');

	const handleSelect = (eventKey) => {
		setActiveTab(eventKey);
	}

	if (!sent || !recv) {
		return (
			<div className={styles.container}>
				<p className="bg-light text-black">Something went wrong...</p>
				<p className="bg-light text-black">Please reload the page.</p>
			</div>
		);
	}

	return (
		<Card
			className="bg-dark text-white mt-3"
			style={{ width: '60%' }}
		>
			<Card.Header>
				<Nav
					justify
					variant="tabs"
					defaultActiveKey="#received"
					onSelect={handleSelect}
					className="bg-dark text-white"
				>
					<Nav.Item>
						<Nav.Link href="#received">Received {recv.length ? `(${recv.length})` : '(0)'}</Nav.Link>
					</Nav.Item>
					<Nav.Item>
						<Nav.Link href="#sent">Sent {sent.length ? `(${sent.length})` : '(0)'}</Nav.Link>
					</Nav.Item>
				</Nav>
			</Card.Header>
			<Card.Body>
				<UserFriendRequestsTableBody
					activeTab={activeTab}
					sent={sent}
					recv={recv}
					setSent={setSent}
					setRecv={setRecv}
					setShowError={setShowError}
					setErrorMsg={setErrorMsg}
					setShowMsg={setShowMsg}
					setMsg={setMsg}
				/>
			</Card.Body>
		</Card>
	);
}

const FriendRequestsToasts = ({ showError, setShowError, errorMsg, setErrorMsg, showMsg, setShowMsg, msg, setMsg }) => {
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

export default function UserFriendRequests({ status, detail, current_user, requests_sent, requests_received }) {
	const { user, logout } = useAuth();
	const { userError, userMsg, clearUserError, clearUserMsg } = useUser();

	const [showError, setShowError] = useState(false);
	const [errorMsg, setErrorMsg] = useState('');
	const [showMsg, setShowMsg] = useState(false);
	const [msg, setMsg] = useState('');
	const [sentRequests, setSentRequests] = useState(requests_sent);
	const [receivedRequests, setReceivedRequests] = useState(requests_received);

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

	if (status !== 200 || !current_user || !current_user.id || !user || !user.id) {
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
			<FriendRequestsToasts
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
				<title>Friend Requests</title>
			</Head>

			<UserFriendRequestsTable
				sent={sentRequests}
				recv={receivedRequests}
				setSent={setSentRequests}
				setRecv={setReceivedRequests}
				setShowError={setShowError}
				setErrorMsg={setErrorMsg}
				setShowMsg={setShowMsg}
				setMsg={setMsg}
			/>
			<p>
				<Link
					href={`/users/${user.id}/friends`}
					passHref
					className={styles.cardInfo}
					style={{ fontWeight: 'bold' }}
				>
					Go to friend list
				</Link>
			</p>
			<p>
				<Link
					href={`/users/${user.id}`}
					passHref
					className={styles.cardInfo}
					style={{ fontWeight: 'bold' }}
				>
					Back to profile
				</Link>
			</p>
		</div>
	);
}

export async function getServerSideProps(context) {
	const { id } = context.params;

	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/current_user/user_friend_requests`, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Cookie': context.req.headers.cookie
			},
			body: JSON.stringify({ id })
		});
		if (!response) {
			throw new Error('User friend requests fetch failed');
		}
		if (response.status === 404) {
			return {
				props: {
					status: 404,
					detail: 'Resource not found',
					current_user: null,
					requests_sent: null,
					requests_received: null
				}
			}
		}

		const data = await response.json();
		if (!data) {
			throw new Error('User friend requests fetch failed');
		}
		if (!response.ok) {
			throw new Error(data.message, 'User friend requests fetch failed');
		}

		return {
			props: {
				status: 200,
				detail: 'Success',
				current_user: data.user,
				requests_sent: data.requests_sent,
				requests_received: data.requests_received
			}
		}
	} catch (error) {
		return {
			props: {
				status: 401,
				detail: error.message,
				current_user: null,
				requests_sent: null,
				requests_received: null
			}
		}
	}
}
