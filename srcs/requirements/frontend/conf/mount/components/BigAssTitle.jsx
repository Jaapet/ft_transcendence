import Link from 'next/link';
import styles from '../styles/home.module.css';

const BigTitle = () => (
  <div className={styles.title}>
    <h1 style={{ fontSize: '5em' }}>Transcendence</h1>
    <div className={styles.buttons}>
      <Link href="/login" passHref>
        <a className={styles.button}>Log In</a>
      </Link>
      <Link href="/game" passHref>
        <a className={styles.button}>Game</a>
      </Link>
      <Link href="/settings" passHref>
        <a className={styles.button}>Settings</a>
      </Link>
    </div>
  </div>
);

export default BigTitle;
