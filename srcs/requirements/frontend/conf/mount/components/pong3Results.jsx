import styles from '../styles/base.module.css';
import Image from 'next/image';
import Link from 'next/link';

const Pong3Results = ({ playerL, playerR, playerB, ballWon }) => {
	return (
		<div className={`card ${styles.customCard} mt-5`}>
			<div className={`card-body ${styles.cardInfo}`}>
				{ ballWon ?
					<>
						<h1 className={`mb-3`}>The ball won! ({playerB.username})</h1>
						<Link href={`/users/${playerB.id}`} passHref>
							<Image
								src={playerB.avatar}
								alt={`${playerB.username}'s avatar`}
								width={300}
								height={300}
							/>
						</Link>
					</>
				:
					<>
						<h1 className={`mb-3`}>The paddles won! ({playerL.username} & {playerR.username})</h1>
						<Link href={`/users/${playerL.id}`} passHref>
							<Image
								src={playerL.avatar}
								alt={`${playerL.username}'s avatar`}
								width={300}
								height={300}
							/>
						</Link>
						<Link href={`/users/${playerR.id}`} passHref>
							<Image
								src={playerR.avatar}
								alt={`${playerR.username}'s avatar`}
								width={300}
								height={300}
							/>
						</Link>
					</>
				}
			</div>
		</div>
	);
};

export default Pong3Results;
