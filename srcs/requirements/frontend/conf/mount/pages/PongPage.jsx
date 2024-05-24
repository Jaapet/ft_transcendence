import React from 'react';
import Pong from '../components/pong';
import styles from '../styles/base.module.css';


const PongPage = () => {
  return (
	<div className={styles.container}>
	<div>
		<Pong/>
	</div>
	</div>
  );
};

export default PongPage;
