import Link from 'next/link';
import styles from '../styles/home.module.css';

const BigTitle = () => (
	<div className={styles.title}>
		<h1 style={{ fontSize: '5em' }}>Transcendence</h1>
		<div className={styles.buttons}>
			<Link href={`/users`} passHref className={styles.button}>
				Users
			</Link>
			<Link href="/chooseGame" passHref className={styles.button}>
				Play
			</Link>
			<Link href="/leaderboard" passHref className={styles.button}>
				Leaderboard
			</Link>
		</div>
	</div>
);

export default BigTitle;
