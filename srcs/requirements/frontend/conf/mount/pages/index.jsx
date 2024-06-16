import Head from 'next/head';
import styles from '../styles/home.module.css';
import BigTitle from '../components/BigAssTitle';

const VideoBackground = () => (
  <div className={styles.videoBackground}>
    <div className={styles.videoOverlay}></div>
    <iframe src="images/pong.webp" allowFullScreen></iframe>
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

    	<VideoBackground />
    	<BigTitle />
    </div>
  );
}
