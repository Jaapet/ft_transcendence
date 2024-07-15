import styles from '../styles/base.module.css';
import Image from 'next/image';
import Link from 'next/link';

const PongResults = ({ winner, winnerScore }) => {
	return (
		<div className={`card ${styles.customCard} mt-5`}>
			<div className={`card-body ${styles.cardInfo}`}>
				{ winner ?
					<>
						<h1 className={`mb-3`}>{winner.username} won!</h1>
						<Link href={`/users/${winner.id}`} passHref>
							<Image
								src={winner.avatar}
								alt={`${winner.username}'s avatar`}
								width={300}
								height={300}
							/>
						</Link>
						<h3 className={`mt-3`}>They won with {winnerScore} points</h3>
					</>
				:
					<h3>Something went wrong...</h3>
				}
			</div>
		</div>
	);
};

export default PongResults;
