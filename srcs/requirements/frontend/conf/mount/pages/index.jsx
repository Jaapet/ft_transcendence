// pages/index.js

import Head from 'next/head';
import styles from '../styles/home.module.css';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';

const Header = () => (
	<div className={styles.header}>
    <Navbar bg="dark" variant="dark">
        <Navbar.Brand href="#home">Transcendence</Navbar.Brand>
        <Nav className="mr-auto">
            <Nav.Link href="#leaderboard">Leaderboard</Nav.Link>
            <Nav.Link href="#how-to-play">How to play</Nav.Link>
            <Nav.Link href="#credits">Credits</Nav.Link>
        </Nav>
        <NavDropdown title="User Menu" id="basic-nav-dropdown">
            <NavDropdown.Item href="#profile">My Profile</NavDropdown.Item>
            <NavDropdown.Item href="#logout">Log out</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item href="#special-thanks">Special thanks</NavDropdown.Item>
        </NavDropdown>
		<img src="images/rachid.jpg" style={{borderRadius: '50%', width: '40px', height: '40px', marginLeft: '35.5cm'}} />
    </Navbar>
	</div>
);
const VideoBackground = () => (
  <div className={styles.videoBackground}>
    <div className={styles.videoOverlay}></div>
    <iframe src="images/tmp_background.gif" allowFullScreen></iframe>
  </div>
);

const Title = () => (
  <div className={styles.title}>
    <h1>Transcendence</h1>
    <div className={styles.buttons}>
      <a href="login.html" className={styles.button}>Log In</a>
      <a href="game.html" className={styles.button}>Game</a>
      <a href="settings.html" className={styles.button}>Settings</a>
    </div>
  </div>
);

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Transcendance</title>
      </Head>

      <style jsx global>{`
        body {
          background-color: rgb(0, 0, 0);
        }
      `}</style>

		<Header/>
    	<VideoBackground />
    	<Title />
    </div>
  );
}
