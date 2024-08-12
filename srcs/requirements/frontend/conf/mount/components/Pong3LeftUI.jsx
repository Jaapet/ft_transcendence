import styles from '../styles/base.module.css';
import Image from 'next/image';

const Pong3LeftUI = ({ playerL, playerB }) => {
	return (
		<div
			className={`card ${styles.customCard}`}
			style={{ width: '200px' }}
		>
			<div className={`card-body ${styles.cardInfo}`}>
				{ playerL ?
					<>
						<h5>{playerL.username}</h5>
						<Image
							src={playerL.avatar}
							alt={`${playerL.username}'s avatar`}
							width={100}
							height={100}
						/>
						<p>{`ELO: ${playerL.elo}`}</p>
					</>
				:
					<>
						<h5>Player 1 (left paddle)</h5>
						<p>Could not load info...</p>
					</>
				}
			</div>
			<div className={`card-body ${styles.cardInfo}`}>
				{ playerB ?
					<>
						<h5>{playerB.username}</h5>
						<Image
							src={playerB.avatar}
							alt={`${playerB.username}'s avatar`}
							width={100}
							height={100}
						/>
						<p>{`ELO: ${playerB.elo}`}</p>
					</>
				:
					<>
						<h5>Player 3 (ball)</h5>
						<p>Could not load info...</p>
					</>
				}
			</div>
		</div>
	);
};

export default Pong3LeftUI;
