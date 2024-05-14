// pages/index.js

import Head from 'next/head';
import styles from '../styles/home.module.css';
import Header from '../components/Header';

const VideoBackground = () => (
  <div className={styles.videoBackground}>
    <div className={styles.videoOverlay}></div>
    <iframe src="images/tmp_background.gif" allowFullScreen></iframe>
  </div>
);

const BigTitle = () => (
  <div className={styles.title}>
    <h1 style={{fontSize: '5em'}}>Transcendence</h1>
    <div className={styles.buttons}>
      <a href="login.html" className={styles.button}>Log In</a>
      <a href="game.html" className={styles.button}>Game</a>
      <a href="settings.html" className={styles.button}>Settings</a>
    </div>
  </div>
);

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Transcendence</title>
      </Head>

      <style jsx global>{`
        body {
          background-color: rgb(0, 0, 0);
        }
      `}</style>

		<Header/>
    	<VideoBackground />
    	<BigTitle />
    </div>
  );
}
