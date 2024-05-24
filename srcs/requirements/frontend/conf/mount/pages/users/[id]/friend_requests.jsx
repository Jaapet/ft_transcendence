import React from 'react';
import Head from 'next/head';
import styles from '../../../styles/base.module.css';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthenticationContext'

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

	console.log('user', user); // debug

	if (current_user.id !== user.id) {
		return (
			<div className={styles.container}>
				<Head>
					<title>Forbidden</title>
				</Head>
				<p>Forbidden!</p>
			</div>
		);
	}

	console.log('current_user', current_user); // debug
	console.log('requests_sent', requests_sent); // debug
	console.log('requests_received', requests_received); // debug

	return (
		<div className={styles.container}>
			<Head>
				<title>Profile Page</title>
			</Head>
			
			{/* TODO: 2 lists: friend requests sent and received
			with options to accept and decline the received ones
			and delete the sent ones*/}
			<p>Work in progress...</p>
		</div>
	);
};

export async function getServerSideProps(context) {
	const { id } = context.params;

	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user_friend_requests`, {
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
