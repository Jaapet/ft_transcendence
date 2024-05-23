import React from 'react';
import styles from '../styles/error.module.css';

const ErrorPage = () => {
  return (
    <div className={styles.container}>
      <p>Oops! Something went wrong.</p>
      <p>We couldn't retrieve the information at the moment. Please try again later.</p>
    </div>
  );
};

export default ErrorPage;
