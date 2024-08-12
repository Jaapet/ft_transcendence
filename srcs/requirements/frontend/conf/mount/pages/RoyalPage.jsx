import React from 'react';
import styles from '../styles/base.module.css';
import DrawingCanvas from '../components/Drawing';

import { useAuth } from '../context/AuthenticationContext';

export default function RoyalPage({ status, detail }) {
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
		<div
		  style={{
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			width: '100%', 
		  }}
		>


		  {/* Current leaderboard */}
		  <div
			className={`card ${styles.customCard}`}
			style={{
				position: 'absolute',
				right: '0%',
				top: '3cm', 
				width: '200px',
			}}
		  >
			<div className={`card-body ${styles.cardInfo}`}>
			  <h5>Leaderboard: (coming one day)</h5>
			  {/* Put the leaderboard here */}
			</div>
		  </div>
		
		</div>


		{/* Game canvas */}
		<DrawingCanvas/>
		  <Royal />
		</div>
	);
}

export async function getServerSideProps(context) {
	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/user`, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Cookie': context.req.headers.cookie
			}
		});
		if (!response) {
			throw new Error('Dummy fetch failed');
		}
		if (response.status === 404) {
			return {
				props: {
					status: 404,
					detail: 'Resource not found'
				}
			}
		}

		const data = await response.json();
		if (!data) {
			throw new Error('Dummy fetch failed');
		}
		if (!response.ok) {
			throw new Error(data.message, 'Dummy fetch failed');
		}

		return {
			props: {
				status: 200,
				detail: 'Success'
			}
		}
	} catch (error) {
		return {
			props: {
				status: 401,
				detail: error.message
			}
		}
	}
}
