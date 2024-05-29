import { useState } from 'react';
import Head from 'next/head';
import styles from '../../../styles/base.module.css';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthenticationContext'
import { Card, Nav, ListGroup, Button } from 'react-bootstrap';

const UserFriendRequestSent = ({ request }) => {
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
					<Link href={`/users/${request.recipient_id}`} passHref>
						<a className="link-offset-1-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover">
							{request.recipient_username}
						</a>
					</Link>
				</div>
				<div style={{ fontSize: 'max(min(1.4vw, 21px), 14px)' }}>
					{request.date} {request.time}
				</div>
			</div>
			<Button variant="danger">Delete</Button>
		</ListGroup.Item>
	);
}

const UserFriendRequestsTableBodySent = ({ requests }) => {
	if (!requests || requests.length < 1) {
		return (
			<Card.Text>No requests to display</Card.Text>
		);
	}

	return (
		<ListGroup>
			{ requests.map(request => (
				<UserFriendRequestSent key={request.id} request={request} />
			)) }
		</ListGroup>
	);
}

const UserFriendRequestReceived = ({ request }) => {
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
					<Link href={`/users/${request.sender_id}`} passHref>
						<a className="link-offset-1-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover">
							{request.sender_username}
						</a>
					</Link>
					&nbsp;invited you
				</div>
				<div style={{ fontSize: 'max(min(1.4vw, 21px), 14px)' }}>
					{request.date} {request.time}
				</div>
			</div>
			<Button variant="success" className="me-2">Accept</Button>
			<Button variant="outline-danger">Decline</Button>
		</ListGroup.Item>
	);
}

const UserFriendRequestsTableBodyReceived = ({ requests }) => {
	if (!requests || requests.length < 1) {
		return (
			<Card.Text>No requests to display</Card.Text>
		);
	}

	return (
		<ListGroup>
			{ requests.map(request => (
				<UserFriendRequestReceived key={request.id} request={request} />
			)) }
		</ListGroup>
	);
}

const UserFriendRequestsTableBody = ({ activeTab, sent, recv }) => {
	if (activeTab === '#sent') {
		return (<UserFriendRequestsTableBodySent requests={sent} />);
	} else if (activeTab === '#received') {
		return (<UserFriendRequestsTableBodyReceived requests={recv} />);
	} else {
		return (<Card.Text>Somethig went wrong...</Card.Text>);
	}
}

const UserFriendRequestsTable = ({ sent, recv }) => {
	const [activeTab, setActiveTab] = useState('#received');

	const handleSelect = (eventKey) => {
		setActiveTab(eventKey);
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
				<UserFriendRequestsTableBody activeTab={activeTab} sent={sent} recv={recv} />
			</Card.Body>
		</Card>
	);
}

export default function UserFriendRequests({ status, current_user, requests_sent, requests_received }) {
	const { user } = useAuth();

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
		<div className={styles.container}>
			<Head>
				<title>Profile Page</title>
			</Head>
			<UserFriendRequestsTable sent={requests_sent} recv={requests_received} />
		</div>
	);
};

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
				current_user: data.user,
				requests_sent: data.requests_sent,
				requests_received: data.requests_received
			}
		}
	} catch (error) {
		console.error('USER FRIEND REQUESTS:', error);
		return {
			props: {
				status: 401,
				current_user: null,
				requests_sent: null,
				requests_received: null
			}
		}
	}
}
