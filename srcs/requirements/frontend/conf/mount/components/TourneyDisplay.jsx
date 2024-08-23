import React from 'react';
import Image from 'next/image';
import styles from '../styles/tourney.module.css';

const TourneyDisplayGamePlayerCard = ({ player, winner, finals }) => {
	let playerClass = `${styles.player}`;
	let placement = '';
	if (winner && player) {
		const won = (winner.id === player.id);
		if (finals) {
			if (finals === 'wf') {
				playerClass += won ? ` ${styles.playerFirst}` : ` ${styles.playerSecond}`;
				placement = won ? '1st ' : '2nd ';
			} else if (finals === 'lf') {
				playerClass += won ? ` ${styles.playerThird}` : ` ${styles.playerLast}`;
				placement = won ? '3rd ' : '4th ';
			}
		}
		playerClass += won ? ` ${styles.playerWinner}` : ` ${styles.playerLoser}`;
	}

	return (
		<div className={playerClass}>
			<Image
				src={player?.avatar || '/images/default.png'}
				alt={`${player?.username || 'Someone'}'s avatar`}
				width={50}
				height={50}
				style={{
					borderRadius: '35%',
					height: '4vh',
					width: '4vh',
					marginLeft: '0.5vw',
					marginRight: '0.5vw'
				}}
			/>
			{placement + `${player?.username || ''}`}
		</div>
	);
}

const TourneyDisplayGame = ({ player1, player2, winner, finals }) => {
	return (
		<div className={styles.game}>
			<TourneyDisplayGamePlayerCard player={player1} winner={winner} finals={finals} />
			<TourneyDisplayGamePlayerCard player={player2} winner={winner} finals={finals} />
		</div>
	);
}

const TourneyDisplayFirstRound = ({ up, down }) => {
	return (
		<ul className={styles.round}>
			<h4 className={styles.title}>Semifinals</h4>
			<TourneyDisplayGame
				player1={up?.p1 || null}
				player2={up?.p2 || null}
				winner={up?.winner || null}
				finals={null}
			/>
			<div>&nbsp;</div>
			<TourneyDisplayGame
				player1={down?.p1 || null}
				player2={down?.p2 || null}
				winner={down?.winner || null}
				finals={null}
			/>
		</ul>
	);
}

const TourneyDisplaySecondRound = ({ wf, lf }) => {
	return (
		<ul className={styles.round}>
			<h4 className={styles.title}>Winners Finals</h4>
			<TourneyDisplayGame
				player1={wf?.p1 || null}
				player2={wf?.p2 || null}
				winner={wf?.winner || null}
				finals='wf'
			/>
			<div>&nbsp;</div>
			<div>&nbsp;</div>
			<h4 className={styles.title}>Losers Finals</h4>
			<TourneyDisplayGame
				player1={lf?.p1 || null}
				player2={lf?.p2 || null}
				winner={lf?.winner || null}
				finals='lf'
			/>
		</ul>
	);
}

const TourneyDisplay = ({ matches }) => {
	const up =		matches ? matches['SFUP'] || null : null;
	const down =	matches ? matches['SFDO'] || null : null;
	const wf =		matches ? matches['WF'] || null : null;
	const lf =		matches ? matches['LF'] || null : null;

	return (
		<div className={styles.container}>
			<TourneyDisplayFirstRound up={up} down={down} />
			<TourneyDisplaySecondRound wf={wf} lf={lf} />
		</div>
	);
}

export default TourneyDisplay;