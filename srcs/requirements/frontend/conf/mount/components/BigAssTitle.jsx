import Link from 'next/link';
import styles from '../styles/home.module.css';

const BigTitle = () => (
	<div className={styles.title}>
		<h1 style={{ fontSize: '5em' }}>Transcendence</h1>
		<div className={styles.buttons}>
			<Link href="/account/login" passHref className={styles.button}>
				Log In
			</Link>
			<Link href="/chooseGame" passHref className={styles.button}>
				Game
			</Link>
			<Link href="/settings" passHref className={styles.button}>
				Settings
			</Link>
		</div>
	</div>
);

export default BigTitle;
