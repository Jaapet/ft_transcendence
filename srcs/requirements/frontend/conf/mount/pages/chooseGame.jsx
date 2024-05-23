import Link from "next/link";
import React from "react";
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
                    <Link href="/PongPage" passHref>
                        <a className={styles.button}>Classic Pong</a>
                    </Link>
                    <Link href="/RoyalPage" passHref>
                        <a className={styles.button}>Royal Pong</a>
                    </Link>
                </div>
            </div>
    );
};

export default ChooseGame;
