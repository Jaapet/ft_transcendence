import React, { useState } from 'react';
import {Row, Col, Button, Card, Dropdown } from 'react-bootstrap';
import styles from '../styles/base.module.css';

const HowToPlay = () => {
  const [selectedGame, setSelectedGame] = useState('game1');
  const [numberOfPlayers, setNumberOfPlayers] = useState(2);

  const renderGameDescription = () => {
    /* classic pong */
	if (selectedGame === 'game1') {
		return (
			<Card className={styles.customCard}>
			<Card.Body>
			  
			  <Card.Title className={styles.cardInfo}>Classic Pong Rules</Card.Title>
				
				<Dropdown>
				  <Dropdown.Toggle variant="success" id="dropdown-basic">
					{numberOfPlayers} Players
				  </Dropdown.Toggle>
				  <Dropdown.Menu>
					<Dropdown.Item onClick={() => setNumberOfPlayers(2)}>2 Players</Dropdown.Item>
					<Dropdown.Item onClick={() => setNumberOfPlayers(3)}>3 Players</Dropdown.Item>
				  </Dropdown.Menu>
				</Dropdown>

				<div className="mt-3">
            {numberOfPlayers === 2 ? (
              <p className="text-justify">
                In Classic Pong for 2 players, the goal is to score by hitting the ball past your opponent's paddle.
                Players move their paddles vertically, with W (up) and S (down), to hit the ball, which bounces off walls.
                A point is scored when the ball passes the opponent's paddle, and the first to reach 11 points wins.
              </p>
            ) : (
				<p class="text-justify">
				In this modified version of Pong for 3 players, the objective is for the ball player to pass behind a paddle before the time runs out. Each paddle player controls a paddle positioned to block the ball. The ball can move alike the paddles, which can move vertically (W up and S down) to intercept the ball.
				The ball wins if it successfully passes behind a paddle before the time limit expires. Conversely, the paddles win if the ball fails to do so before time runs out.
			</p>
            )}
          </div>
        </Card.Body>
      </Card>
    );

  } /* royale pong */
	else if (selectedGame === 'game2') {
      return (
        <Card className={styles.customCard}>
          <Card.Body>
		  <Card.Title className={styles.cardInfo}>Pong Royale Rules</Card.Title>
            <Card.Text>
        		Game 2 is like a Pong battle royale where every player controls a ball. The balls bounce off each other, allowing players to push others around. The objective is to be the last ball remaining on the game platform. If you get pushed off the platform, your game ends there.
            </Card.Text>
          </Card.Body>
        </Card>
      );
    }
  };

  return (
	<div className={styles.container}>
          <h1 className={styles.background_title } style={{marginTop: '0.5cm'}}>? How to Play ?</h1>
          
	<Card className={styles.backCard} style={{marginTop: '0.5cm'}}>
    	<Row>
        <Col className="text-center">
          	<p>Select a game to view the instructions:</p>
		
			  <Button
              className={`${styles.button} ${selectedGame === 'game1' ? styles.selected : ''}`}
              style={{ fontSize: '38px' }}
              onClick={() => setSelectedGame('game1')}
            >
              Classic Pong
            </Button>
          
		 
            <Button
              className={`${styles.button} ${selectedGame === 'game2' ? styles.selected : ''}`}
              style={{ fontSize: '38px' }}
              onClick={() => setSelectedGame('game2')}
            >
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
