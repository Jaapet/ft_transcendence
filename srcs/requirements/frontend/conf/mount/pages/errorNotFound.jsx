import React from 'react';
import styles from '../styles/base.module.css';

const ErrorPage = () => {
  return (
    <div className={styles.container}>
		
		<h5 className={styles.background_title}> Oops </h5>

		<div className={styles.cardInfo}>
			<p>Something went wrong.</p>
			<p>We couldn't retrieve requested informations at the moment.</p>
			<p>Here's some pretty stuff to make you wait : </p>
			
			<div className={styles.buttonContainer} >

			<img src="images/uranus.webp" alt="ArrowsGif" style={{height: '5cm'}}/>
			<img src="images/saturnus.webp" alt="ArrowsGif" style={{height: '5cm'}}/>
			<img src="images/flowers.webp" alt="ArrowsGif" style={{height: '5cm'}}/>

			</div>

			<p style={{position: 'absolute', bottom: '1.5cm'}}>Reload the page might resolve your problem but I can't promise.</p>
    	</div>
    
	</div>
  );
};

export default ErrorPage;
