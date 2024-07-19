import React from 'react';
import styles from '../styles/game.module.css';

const ButtonColor = ({ color, handleColorChange }) => {
	const handleClick = () => {
		handleColorChange(color); // Call handleColorChange with the selected color
	};

	return (
		<button
			className={styles.colorButton} 
			style={{ backgroundColor: color }} // Set background color dynamically
			onClick={handleClick} // Handle click event
		></button>
	);
};

export default ButtonColor;
