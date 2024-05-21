import Link from "next/link";
import React from "react";
import Header from "../components/Header";
import styles from '../styles/base.module.css';

const ChooseGame = () => {
	return (
	  <div>
		  <Header></Header>
		  <div>
		  <div className={styles.container}/>
			<h4>bonjour oui je suis le choix de jeu</h4>
			<Link href="/gamePage" passHref>
        <a className={styles.button}>Game</a>
		</Link>
		  </div>
	  </div>
	);
  };
  
  export default ChooseGame;
  