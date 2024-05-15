import React from 'react';
import { useContext } from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import AuthenticationContext from '../context/AuthenticationContext';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../styles/header.module.css';

const ProfilePicture = () => {
    const {user} = useContext(AuthenticationContext);
    let avatar = "/images/rachid.jpg";

    if (user && user.avatar) {
        avatar = user.avatar;
    }

    return (
        <Image
            src={avatar}
            alt={"Your avatar"}
            width={40}
            height={40}
            placeholder={"blur"}
            style={{
                borderRadius: '50%',
                marginLeft: '10px'
            }}
        />
    )
}

// Maybe put the NavDropdown directly on the profile picture and remove settings icon ?
// In dropdown menu, make Sign in/Sign out conditional based on current login
// Align profile picture to the right?
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
                        <ProfilePicture />
                    </Nav.Link>
                </Nav>
            </Navbar>
        </div>
    );
};

export default Header;

