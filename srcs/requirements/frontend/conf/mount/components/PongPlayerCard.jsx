import styles from '../styles/base.module.css';
import Image from 'next/image';

const PongPlayerCard = ({ nb, player, score }) => {
	return (
		<div
			className={`card ${styles.customCard}`}
			style={{ width: '200px', minWidth: '130px' }}
		>
			<div className={`card-body ${styles.cardInfo}`}>
				{ player ?
					<>
						<h5>{player.username}</h5>
						<Image
							src={player.avatar}
							alt={`${player.username}'s avatar`}
							width={100}
							height={100}
						/>
						<p>{`ELO: ${player.elo}`}</p>
						{ score || score === 0 ? <h1>{score}</h1> : <></> }
					</>
				:
					<>
						{ nb ? <h5>Player {nb}</h5> : <h5>Player</h5> }
						{ score || score === 0 ? <h1>{score}</h1> : <></> }
					</>
				}
			</div>
		</div>
	);
};

export default PongPlayerCard;
