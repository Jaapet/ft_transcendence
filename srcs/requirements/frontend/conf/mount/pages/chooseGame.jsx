import React from "react";
import Link from "next/link";
import Head from "next/head";
import styles from '../styles/base.module.css';
import { useAuth } from '../context/AuthenticationContext';

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
			<div className={styles.buttonContainer}>
				<Link href="/PongPage" passHref className={styles.button}>
					Classic Pong
				</Link>
				<Link href="/RoyalPage" passHref className={styles.button}>
					Royal Pong
				</Link>
			</div>
			<div>
				{/*
					<img src="/images/pongicon.png" alt="Pong Icon" style={{ width: '300px', marginTop: '1rem', marginRight:'2cm' }} />
					<img src="/images/crown.jpg" alt="Royal Icon" style={{ width: '200px', marginLeft:'0cm' }} />
				*/}
				{/* 	maybe put icons or how to play things here */}
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
