import styles from '../styles/base.module.css';
import Image from 'next/image';

const Pong3RightUI = ({ playerR, timeLeft }) => {
	return (
		<div
			className={`card ${styles.customCard}`}
			style={{ width: '200px' }}
		>
			<div className={`card-body ${styles.cardInfo}`}>
				{ playerR ?
					<>
						<h5>{playerR.username}</h5>
						<Image
							src={playerR.avatar}
							alt={`${playerR.username}'s avatar`}
							width={100}
							height={100}
						/>
						<p>{`ELO: ${playerR.elo}`}</p>
					</>
				:
					<>
						<h5>Player 2 (right paddle)</h5>
						<p>Could not load info...</p>
					</>
				}
			</div>
			<div className={`card-body ${styles.cardInfo}`}>
				{ timeLeft ?
					<>
						<h5>Time left:</h5>
						<h1>{timeLeft}</h1>
					</>
				:
					<>
						<p>Could not load info...</p>
					</>
				}
			</div>
		</div>
	);
};

export default Pong3RightUI;
