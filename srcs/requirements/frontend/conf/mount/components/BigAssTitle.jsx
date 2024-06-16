import Link from 'next/link';
import styles from '../styles/home.module.css';
import { useAuth } from '../context/AuthenticationContext';

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

			{/*				Put something useful here idk 
			<Link href={`${user.id}/friends`} passHref className={styles.button}>
				Friends
			</Link>
			*/}
		</div>
	</div>
);

export default BigTitle;
