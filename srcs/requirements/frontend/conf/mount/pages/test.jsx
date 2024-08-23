import React from 'react';
import TourneyDisplay from '../components/TourneyDisplay';

// TODO: Remove this page

const TestContent = () => {
	const blinky = {
		id: 1,
		username: 'Blinky',
		avatar: '/images/default.png'
	}
	const pinky = {
		id: 2,
		username: 'Pinky',
		avatar: '/images/default.png'
	}
	const inky = {
		id: 3,
		username: 'Inky',
		avatar: '/images/default.png'
	}
	const clyde = {
		id: 4,
		username: 'Clyde',
		avatar: '/images/default.png'
	}

	const matches = {}
	matches['SFUP'] = {
		p1: blinky,
		p2: inky,
		winner: inky
	};
	matches['SFDO'] = {
		p1: pinky,
		p2: clyde,
		winner: pinky
	};
	matches['WF'] = {
		p1: inky,
		p2: pinky,
		winner: pinky
	};
	matches['LF'] = {
		p1: blinky,
		p2: clyde,
		winner: blinky
	};

	return (
		<div className='my-5'>
			<h1 style={{ color: 'black', textAlign: 'center', fontFamily: 'Roboto', marginTop: '100px' }}>Test Content</h1>
			<TourneyDisplay matches={matches} />
		</div>
	);
}

export default function TestPage () {
	return (
		<div>
			<TestContent/>
		</div>
	);
}