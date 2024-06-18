import React from 'react';
import styles from '../styles/game.module.css';


const ButtonColor = ({ color, handleColorChange }) => {
  return (

	<button
	className={styles.colorButton}
	style={{ backgroundColor: color }}
	onClick={() => handleColorChange(color)}
  ></button>
  );
};

export default ButtonColor;
