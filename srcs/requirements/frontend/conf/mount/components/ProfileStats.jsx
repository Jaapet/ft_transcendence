import React from 'react';
import styles from '../styles/base.module.css';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

const ProfileStats = ({ user }) => {
	const pong2_played =	user ? user.pong2_games_played || 0 : 0;
	const pong2_won =			user ? user.pong2_games_won || 0 : 0;
	const pong2_winrate =	pong2_played > 0 ? Math.round((pong2_won / pong2_played) * 1000) / 10 : 0;
	const pong3_played =	user ? user.pong3_games_played || 0 : 0;
	const pong3_won =			user ? user.pong3_games_won || 0 : 0;
	const pong3_winrate =	pong3_played > 0 ? Math.round((pong3_won / pong3_played) * 1000) / 10 : 0;

	const pong2_tooltip = (
		<Tooltip
			id='pong2tooltip'
			style={{
				position: 'fixed',
				zIndex: 1000,
				pointerEvents: 'none'
			}}
			>
			{`${pong2_played} games played, ${pong2_won} won`}
		</Tooltip>
	);

	const pong3_tooltip = (
		<Tooltip
			id='pong3tooltip'
			style={{
				position: 'fixed',
				zIndex: 1000,
				pointerEvents: 'none'
			}}
			>
			{`${pong3_played} games played, ${pong3_won} won`}
		</Tooltip>
	);

	return (
		<div className={`card ${styles.customCard}`} style={{backgroundColor:'transparent', marginTop: '10px', minWidth: '220px'}}>
			<div className="card-body" style={{
				backgroundColor:'rgba(0, 0, 0, 0.5)',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-around',
				padding: '5px'
			}}>
				<p className="card-text" style={{fontSize: '30px', marginBottom: '0'}}>Winrates</p>
				<div style={{
					display: 'flex',
					justifyContent: 'space-around',
					marginBottom: '5px'
				}}>

					<OverlayTrigger
						placement="top"
						overlay={pong2_tooltip}
					>
						<div style={{
							width: '40%',
							backgroundColor:'rgba(255, 255, 255, 0.1)',
							borderRadius: '20% 5%',
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'space-around',
						}}>
							<p style={{ fontSize: '25px', marginBottom: '0' }}>Classic</p>
							<p style={{ fontSize: '25px', marginBottom: '0' }}>{pong2_winrate}%</p>
						</div>
					</OverlayTrigger>

					<OverlayTrigger
						placement="top"
						overlay={pong3_tooltip}
					>
						<div style={{
							width: '40%',
							backgroundColor:'rgba(255, 255, 255, 0.1)',
							borderRadius: '20% 5%',
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'space-around',
						}}>
							<p style={{ fontSize: '25px', marginBottom: '0' }}>1v2</p>
							<p style={{ fontSize: '25px', marginBottom: '0' }}>{pong3_winrate}%</p>
						</div>
					</OverlayTrigger>

				</div>
				<p style={{ fontSize: '20px', marginBottom: '0' }}>Played {pong2_played + pong3_played} games in total</p>
			</div>
		</div>
	);
}

export default ProfileStats;