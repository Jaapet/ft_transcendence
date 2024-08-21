import React from 'react';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

const StatusCircle = ({ status }) => {

	let hoverTip = '';

	switch (status) {
		case 'online':
			hoverTip = 'Online';
			break ;
		case 'ingame':
			hoverTip = 'In game';
			break ;
		case 'offline':
		default:
			hoverTip = 'Offline';
			break ;
	}

	const tooltip = (
		<Tooltip
			id='tooltip'
			style={{
				position: 'fixed',
				zIndex: 1000,
				pointerEvents: 'none'
			}}
			>
			{hoverTip}
		</Tooltip>
	);

	return (
		<OverlayTrigger
			placement="top"
			overlay={tooltip}
		>
			<div
				style={{
					display: 'inline-block',
					width: '15px',
					height: '15px',
					borderRadius: '50%',
					backgroundColor: status === "offline" ? 'red' : status === "ingame" ? 'orange' : 'green' ,
					marginRight: '5px',
					verticalAlign: 'middle'
				}}
			>
			</div>
		</OverlayTrigger>
	);
};

export default StatusCircle;
