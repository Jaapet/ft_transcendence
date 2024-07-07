import Link from 'next/link';
import styles from '../styles/base.module.css';

const MatchScoreCardPlayerLink = ({ id, username }) => {
	if (id === null) {
		return (<span>{username}</span>);
	}

	return (
		<Link
			href={`/users/${id}`}
			passHref
			className="link-offset-1-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover"
		>
			{username}
		</Link>
	);
}

const Pong2MatchScoreCardPlayers = ({ user, match }) => {
	if (match.winner_id === user.id) {
		return (
			<p className="fs-2 mb-0">
				<strong style={{color: '#006300'}}>
					{match.winner_username}
				</strong>
				&nbsp;vs&nbsp;
				<MatchScoreCardPlayerLink id={match.loser_id} username={match.loser_username} />
			</p>
		);
	} else if (match.loser_id === user.id) {
		return (
			<p className="fs-2 mb-0">
				<MatchScoreCardPlayerLink id={match.winner_id} username={match.winner_username} />
				&nbsp;vs&nbsp;
				<strong style={{color: '#B30086'}}>
					{match.loser_username}
				</strong>
			</p>
		);
	}
}

const Pong2MatchScoreCard = ({ user, match }) => {
	return (
		<li key={`pong2_${match.id}`} className={`list-group-item ${styles.customList}`}>
			<Pong2MatchScoreCardPlayers user={user} match={match} />
			<p className="fs-3 mb-0">{match.winner_score}-{match.loser_score}</p>
			<p className="fs-4 mb-0">{match.end_date}</p>
		</li>
	);
}

const Pong3MatchScoreCard = ({ user, match }) => {
	return (
		<li key={`pong3_${match.id}`} className={`list-group-item ${styles.customList}`}>
			<p>WORK IN PROGRESS (PONG3)</p>
			<p className="fs-4 mb-0">{match.end_date}</p>
		</li>
	);
}

const RoyalMatchScoreCard = ({ user, match }) => {
	return (
		<li key={`royal_${match.id}`} className={`list-group-item ${styles.customList}`}>
			<p>WORK IN PROGRESS (ROYAL)</p>
			<p className="fs-4 mb-0">{match.end_date}</p>
		</li>
	);
}

const MatchScoreCard = ({ user, match }) => {
	if (!user || !match) {
		return ;
	}

	switch (match.type) {
		case 'pong2':
			return (<Pong2MatchScoreCard user={user} match={match} />);
		case 'pong3':
			return (<Pong3MatchScoreCard user={user} match={match} />);
		case 'royal':
			return (<RoyalMatchScoreCard user={user} match={match} />);
	}
}

export default MatchScoreCard;
