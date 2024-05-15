import React from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import Link from 'next/link';
import styles from '../styles/header.module.css';

const Header = () => {
    return (
        <div className={styles.header}>
            <Navbar bg="dark" variant="dark">

			<Navbar.Brand>
			<Link href="/" passHref>
                        <Nav.Link className={styles.logo}>Transcendence</Nav.Link>
            </Link>
			</Navbar.Brand>

                <Nav className="mr-auto">
                    <Nav.Link href="#leaderboard">Leaderboard</Nav.Link>
                    <Nav.Link href="#how-to-play">How to play</Nav.Link>
                    <Nav.Link href="#credits">Credits</Nav.Link>
                </Nav>
                <Nav className="mr-auto">
                    <NavDropdown title={<img src="/images/setting.png" alt="User Menu" className={styles.settingIcon} />} id="basic-nav-dropdown">
                        <Link href="/profile" passHref>
                            <NavDropdown.Item as="a">My Profile</NavDropdown.Item>
                        </Link>
                        <Link href="/logout" passHref>
                            <NavDropdown.Item as="a">Log out</NavDropdown.Item>
                        </Link>
                        <NavDropdown.Divider />
                        <Link href="/special-thanks" passHref>
                            <NavDropdown.Item as="a">Special thanks</NavDropdown.Item>
                        </Link>
                    </NavDropdown>
                    <Nav.Link>
                        <img src="/images/rachid.jpg" style={{ borderRadius: '50%', width: '40px', height: '40px', marginLeft: '10px' }} />
                    </Nav.Link>
                </Nav>
            </Navbar>
        </div>
    );
};

export default Header;

