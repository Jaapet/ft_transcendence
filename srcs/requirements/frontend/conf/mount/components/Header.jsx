import React from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import styles from '../styles/home.module.css';

const Header = () => {
    return (
        <div className={styles.header}>
            <Navbar bg="dark" variant="dark">
                <Navbar.Brand href="#home">Transcendence</Navbar.Brand>
                <Nav className="mr-auto">
                    <Nav.Link href="#leaderboard">Leaderboard</Nav.Link>
                    <Nav.Link href="#how-to-play">How to play</Nav.Link>
                    <Nav.Link href="#credits">Credits</Nav.Link>
                </Nav>
                <Nav style={{ marginLeft: '36cm' }}>
                    <NavDropdown title={<img src="/images/setting.png" alt="User Menu" className={styles.settingIcon} />} style={{position: 'relative'}}id="basic-nav-dropdown">
                        <NavDropdown.Item href="#profile">My Profile</NavDropdown.Item>
                        <NavDropdown.Item href="#logout">Log out</NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item href="#special-thanks">Special thanks</NavDropdown.Item>
                    </NavDropdown>
                    <Nav.Link>
                        <img src="images/rachid.jpg" style={{ borderRadius: '50%', width: '40px', height: '40px', marginLeft: '10px' }} />
                    </Nav.Link>
                </Nav>
            </Navbar>
        </div>
    );
};

export default Header;
