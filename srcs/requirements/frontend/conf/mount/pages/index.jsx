import Head from 'next/head';
import styles from '../styles/home.module.css';
import Header from '../components/Header';
import BigTitle from '../components/BigAssTitle';

const VideoBackground = () => (
  <div className={styles.videoBackground}>
    <div className={styles.videoOverlay}></div>
    <iframe src="images/tmp_background.gif" allowFullScreen></iframe>
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
