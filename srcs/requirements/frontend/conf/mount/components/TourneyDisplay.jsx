import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const TourneyDisplayHead = () => {
	return (
		<thead>
			<tr key="0">
				<th scope="col">Avatar</th>
				<th scope="col">Username</th>
				<th scope="col">ELO</th>
				<th scope="col">Rank</th>
			</tr>
		</thead>
	)
}

const TourneyDisplayRow = ({ player }) => {
	return (
		<tr key={player.id}>
			<td>
				<Link href={`/users/${player.id}`} passHref>
					<Image
						src={player.avatar}
						alt={`${player.username}'s avatar`}
						width={50}
						height={50}
					/>
				</Link>
			</td>
			<td>{player.username}</td>
			<td>{player.elo}</td>
			<td>{player.role.rank}</td>
		</tr>
	);
}

const TourneyDisplay = ({ players }) => {
	return (
		<table className="table table-sm table-striped table-dark mt-4 w-75 mx-auto">
			<TourneyDisplayHead />
			<tbody>
			{ players ? Object.entries(players).map(([key, player]) => (
				<TourneyDisplayRow key={key} player={player} />
			)) : <></> }
			</tbody>
		</table>
	)
}

export default TourneyDisplay;