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
			style={{color: '#38255faa', textDecoration: 'none'}}
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

const Pong3MatchScoreCardPlayers = ({ match }) => {
	return (
		<p className="fs-2 mb-0">
			<MatchScoreCardPlayerLink id={match.paddle1_id} username={match.paddle1_username} />
			&nbsp;&&&nbsp;
			<MatchScoreCardPlayerLink id={match.paddle2_id} username={match.paddle2_username} />
			&nbsp;vs&nbsp;
			<MatchScoreCardPlayerLink id={match.ball_id} username={match.ball_username} />
		</p>
	);
}



  
  const RoyalMatchScoreCardPlayers = ({ match }) => {
	return (
	  <div>
		{match.players.sort((a, b) => a.position - b.position).map((player, index) => {
		  // Calculer la couleur en fonction de la position
		  const red = Math.round((index / (match.players.length - 1)) * 255);
		  const green = 255 - red;
		  const color = `rgb(${red}, ${green}, 0)`;
  
		  return (
			<p key={player.id} className="fs-2 mb-0" style={{ display: 'flex', alignItems: 'center', marginLeft: '40%' }}>
			  <span style={{ width: '30px', textAlign: 'left', color }}>{player.position}.</span>&nbsp;
			  <MatchScoreCardPlayerLink id={player.id} username={player.username} />
			</p>
		  );
		})}
	  </div>
	);
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
	if (match.ball_won) {
		return (
			<li key={`pong3_${match.id}`} className={`list-group-item ${styles.customList}`}>
				<Pong3MatchScoreCardPlayers match={match} />
				<p className="fs-3 mb-0">
					<strong style={{color: '#006300'}}>{match.ball_username}</strong> won
				</p>
				<p className="fs-4 mb-0">{match.end_date}</p>
			</li>
		);
	} else {
		return (
			<li key={`pong3_${match.id}`} className={`list-group-item ${styles.customList}`}>
				<Pong3MatchScoreCardPlayers match={match} />
				<p className="fs-3 mb-0">
					<strong style={{color: '#006300'}}>{match.paddle1_username} - {match.paddle2_username}</strong> team won
				</p>
				<p className="fs-4 mb-0">{match.end_date}</p>
			</li>
		);
	}
}

const RoyalMatchScoreCard = ({ match }) => {
  return (
    <li key={`royal_${match.id}`} className={`list-group-item ${styles.customList}`}>
      <RoyalMatchScoreCardPlayers match={match} />
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
