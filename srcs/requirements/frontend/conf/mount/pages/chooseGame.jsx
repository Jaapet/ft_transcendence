import React from "react";
import Link from "next/link";
import Head from "next/head";
import styles from '../styles/base.module.css';
import { useAuth } from '../context/AuthenticationContext';
import PerformanceSwitch from '../components/PerformanceSwitch';
import CameraSwitch from '../components/CameraSwitch';

export default function ChooseGame({ status, detail }) {
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
				<title>Choose Game</title>
			</Head>
			<h1 className={`mt-5 ${styles.background_title}`}>Choose Your Game</h1>
			<div style={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center'
			}}>
				<div className={styles.buttonContainerGame}>
					<Link href="/PongPage" passHref className={styles.button}>
						Classic Pong
					</Link>
					<Link href="/Pong3Page" passHref className={styles.button}>
						1v2 Pong
					</Link>
				</div>
				<div className={styles.buttonContainerGame}>
					<Link href="/PongTourney" passHref className={`${styles.button} ${styles.buttonTourney}`}>
						Pong Tourney
					</Link>
				</div>
				<PerformanceSwitch style={{ marginTop: '5px' }} />
				<CameraSwitch style={{ marginTop: '5px' }} />
			</div>
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
