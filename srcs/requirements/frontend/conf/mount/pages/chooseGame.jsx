import React from "react";
import Link from "next/link";
import Head from "next/head";
import styles from '../styles/base.module.css';

const ChooseGame = () => {
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
};

export default ChooseGame;
