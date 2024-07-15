import React from 'react';
import { Card, Col, Row, Table } from 'react-bootstrap';
import styles from '../styles/base.module.css';

const Leaderboard = () => {
  const placeholderData = [
    { rank: 1, name: 'Player 1', score: 100 },
    { rank: 2, name: 'Player 2', score: 90 },
    { rank: 3, name: 'Player 3', score: 80 },
    { rank: 4, name: 'Player 4', score: 70 },
    { rank: 5, name: 'Player 5', score: 60 },
  ];

  const renderLeaderboardTable = (gameTitle) => (
    <Card className={styles.customCard}>
      <Card.Body>
        <Card.Title className={styles.cardInfo}>{gameTitle}</Card.Title>

         <ul className="list-group" style={{minWidth: '300px', maxWidth: '375px'}}>
          <li className={`list-group-item ${styles.customList}`}>
            <div className="d-flex justify-content-between">
              <strong>Rank</strong>
              <strong>Name</strong>
              <strong>Score</strong>
            </div>
          </li>
		  
          {placeholderData.map((player, index) => (
            <li key={index} className={`list-group-item ${styles.customList}`}>
              <div className="d-flex justify-content-between">
                <span>{player.rank}</span>
                <span>{player.name}</span>
                <span>{player.score}</span>
              </div>
            </li>
          ))}
        </ul>

      </Card.Body>
    </Card>
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.background_title} style={{margin: '20px'}}>Leaderboards</h1>
	<Card className={styles.backCard} style={{}}>
	<Row>
        <Col md={4}>
          {renderLeaderboardTable('Pong Classic 2 Players')}
        </Col>
        <Col md={4}>
          {renderLeaderboardTable('Pong Classic 3 Players')}
        </Col>
        <Col md={4}>
          {renderLeaderboardTable('Pong Royale')}
        </Col>
      </Row>
	</Card>
    
	</div>
  );
};

export default Leaderboard;
