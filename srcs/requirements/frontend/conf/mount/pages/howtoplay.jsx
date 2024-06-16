// pages/how-to-play.jsx
import React, { useState } from 'react';
import {Row, Col, Button, Card } from 'react-bootstrap';
import styles from '../styles/base.module.css';

const HowToPlay = () => {
  const [selectedGame, setSelectedGame] = useState('game1');

  const renderGameDescription = () => {
    if (selectedGame === 'game1') {
      return (
        <Card className={styles.customCard}>
          <Card.Body>
            <Card.Title>Game 1 Instructions</Card.Title>
            <Card.Text>
              Here are the instructions for Game 1. Explain the rules, objectives, and how to play the game in detail.
            </Card.Text>
          </Card.Body>
        </Card>
      );
    } else if (selectedGame === 'game2') {
      return (
        <Card className={styles.customCard}>
          <Card.Body>
            <Card.Title>Game 2 Instructions</Card.Title>
            <Card.Text>
              Here are the instructions for Game 2. Explain the rules, objectives, and how to play the game in detail.
            </Card.Text>
          </Card.Body>
        </Card>
      );
    }
  };

  return (
	<div className={styles.container}>
          <h1 className={styles.background_title } style={{marginTop: '2cm'}}>? How to Play ?</h1>
          <Card className={styles.backCard} style={{marginTop: '2cm'}}>
      <Row>
        <Col className="text-center">
          <p>Select a game to view the instructions:</p>
		  <Button variant="info" className="m-4" onClick={() => setSelectedGame('game1')}>
            Classic pong
          </Button>
          <Button variant="info" className="m-4" onClick={() => setSelectedGame('game2')}>
            Pong Royale
          </Button>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          {renderGameDescription()}
        </Col>
      </Row>
	  </Card>
	</div>
  );
};

export default HowToPlay;
