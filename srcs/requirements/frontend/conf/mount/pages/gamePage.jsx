import React from 'react';
import Pong from '../components/game';
import Header from '../components/Header';

const GamePage = () => {
  return (
	<div>
		<Header></Header>
		<div>
			<Pong/>
		</div>
	</div>
  );
};

export default GamePage;
