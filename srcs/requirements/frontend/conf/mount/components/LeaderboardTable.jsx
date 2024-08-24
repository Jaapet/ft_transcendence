import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../styles/leaderboard.module.css';

const LeaderboardTablePlayer = ({ player, index }) => {
	let playerClass = `${styles.player}`;
	switch (index) {
		case 1:
			playerClass += ` ${styles.playerFirst}`;
			break ;
		case 2:
			playerClass += ` ${styles.playerSecond}`;
			break ;
		case 3:
			playerClass += ` ${styles.playerThird}`;
			break ;
		case 4:
			playerClass += ` ${styles.playerFourth}`;
			break ;
		case 5:
		default:
			playerClass += ` ${styles.playerFifth}`;
			break ;
	}

	return (
		<Link
			href={`/users/${player.id}`}
			passHref
			style={{
				textDecoration: 'none'
			}}
		>
			<div className={playerClass}>
				<Image
					src={player?.avatar || '/images/default.png'}
					alt={`${player?.username || 'Someone'}'s avatar`}
					width={80}
					height={80}
					style={{
						borderRadius: '30%',
						aspectRatio: '1 / 1',
						height: '80%',
						width: 'auto',
						marginLeft: '1.5vmin'
					}}
				/>
				<div className={styles.playerNameContainer}>
					<b className={styles.playerName}>
						{player.username}
					</b>
				</div>
				<div className={styles.playerElo}>
					{player.elo_pong}
				</div>
			</div>
		</Link>
	);
}

const LeaderboardTable = ({ leaders }) => {
	return (
		<div className={styles.container}>
			{leaders.map((player, index) => (
				<LeaderboardTablePlayer player={player} index={index + 1} />
			))}
		</div>
	);
}

export default LeaderboardTable;