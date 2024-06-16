import Link from 'next/link';
import styles from '../styles/home.module.css';

const BigTitle = () => (

	
	<div className={styles.title}>
		<h1 style={{ fontSize: '5em' }}>Transcendence</h1>
		<div className={styles.buttons}>
		<Link href={`/users`} passHref className={styles.button}>
				Peoples
			</Link>
			<Link href="/chooseGame" passHref className={styles.button}>
				Game
			</Link>
			<Link href="/howtoplay" passHref className={styles.button}>
				How to play?
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
