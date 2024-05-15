import React from 'react';
import styles from '../styles/error.module.css';
import Header from '../components/Header'

const ErrorPage = () => {
  return (
	<div>
		<Header></Header>
    <div className={styles.container}>
      <p>Oops! Something went wrong.</p>
      <p>We couldn't retrieve the information at the moment. Please try again later.</p>
    </div>
	</div>
  );
};

export default ErrorPage;
