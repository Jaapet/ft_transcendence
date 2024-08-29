import React from 'react';
import styles from '../styles/base.module.css';
import { useAuth } from '../context/AuthenticationContext';
import LeaderboardTable from '../components/LeaderboardTable';
import Head from 'next/head';

export default function Leaderboard({ status, detail, pong }) {
	const { logout } = useAuth();

	const handleLogout = async () => {
		await logout();
	}

	if (status === 401 && detail === 'Not logged in') {
		handleLogout();
	}

	if (status !== 200) {
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
				<title>Leaderboard</title>
			</Head>
			<h1 className={styles.background_title} style={{margin: '20px'}}>Leaderboard</h1>
			<LeaderboardTable leaders={pong} />
		</div>
	);
}

export async function getServerSideProps(context) {
	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/leaderboards`, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Cookie': context.req.headers.cookie
			}
		});
		if (!response) {
			throw new Error('Leaderboards fetch failed');
		}
		if (response.status === 404) {
			return {
				props: {
					status: 404,
					detail: 'Resource not found',
					pong: null
				}
			}
		}

		const data = await response.json();
		if (!data) {
			throw new Error('Leaderboards fetch failed');
		}
		if (!response.ok) {
			throw new Error(data.message, 'Leaderboards fetch failed');
		}

		return {
			props: {
				status: 200,
				detail: 'Success',
				pong: data.pong
			}
		}
	} catch (error) { 
		return {
			props: {
				status: 401,
				detail: error.message,
				pong: null
			}
		}
	}
}
