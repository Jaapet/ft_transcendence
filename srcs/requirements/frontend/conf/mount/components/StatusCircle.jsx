import React from 'react';

const StatusCircle = ({ status }) => {
	return (
		<span
			style={{
				display: 'inline-block',
				width: '15px',
				height: '15px',
				borderRadius: '50%',
				backgroundColor: status === "offline" ? 'red' : status === "ingame" ? 'blueviolet' : 'green' ,
				marginRight: '5px',
				verticalAlign: 'middle'
			}}
		>
		</span>
	);
};

export default StatusCircle;
