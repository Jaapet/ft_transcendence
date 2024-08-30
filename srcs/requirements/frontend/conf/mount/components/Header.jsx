import React from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthenticationContext';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../styles/header.module.css';

const ProfileNavPicture = () => {
	const { user } = useAuth();
	const loggedIn = user && user.avatar;

	if (!loggedIn) {
		return (
			"Login"
		);
	}

	return (
		<Image
			src={user.avatar}
			alt={"Your avatar"}
			width={40}
			height={40}
			style={{
				borderRadius: '50%',
				right: '2cm'
			}}
		/>
	);
}

const ProfileNavLog = () => {
	const { user, logout } = useAuth();

	// Logged in version
	if (user) {
		const handleLogout = async (event) => {
			event.preventDefault();
			await logout();
		}
		
		//profile picture dropdown content
		return (
			<>
				<NavDropdown.ItemText>{user.username}</NavDropdown.ItemText>
				<NavDropdown.Divider />
				<Link href={`/users/${user.id}`} passHref legacyBehavior>
					<NavDropdown.Item as="a">My Profile</NavDropdown.Item>
				</Link>
				<Link href={`/users/${user.id}/friends`} passHref legacyBehavior>
					<NavDropdown.Item as="a">Friends</NavDropdown.Item>
				</Link>
				<NavDropdown.Divider />
				<Link href={`/users/${user.id}/edit`} passHref legacyBehavior>
					<NavDropdown.Item as="a">Edit profile</NavDropdown.Item>
				</Link>
				<Link href={`/users/${user.id}/edit_2fa`} passHref legacyBehavior>
					<NavDropdown.Item as="a">2FA settings</NavDropdown.Item>
				</Link>
				<NavDropdown.Item as="button" onClick={handleLogout}>Log out</NavDropdown.Item>
			</>
		);
	}

	// Unauthenticated version
	return (
		<>
			<Link href="/account/login" passHref legacyBehavior>
				<NavDropdown.Item as="a">Login</NavDropdown.Item>
			</Link>
			<Link href="/account/register" passHref legacyBehavior>
				<NavDropdown.Item as="a">Register</NavDropdown.Item>
			</Link>
		</>
	);
}

// first button to dropdown then dropdown content
const ProfileNav = () => {
	return (
	  <Nav className="mr-auto">
		<NavDropdown
		  title={<ProfileNavPicture />}
		  style={{ position: 'relative'}}
		  id="basic-nav-dropdown"
		>
			<ProfileNavLog />
		</NavDropdown>
	  </Nav>
	);
};

const Header = () => {
	const { user } = useAuth();

	const logoLink = user ? '/' : '/account/login';

	return (
		<div className={styles.header}>
			<Navbar bg="dark" variant="dark">
				<Navbar.Brand>
					<Link href={logoLink} passHref legacyBehavior>
						<Nav.Link className={`${styles.logo} mx-3`}>Transcendence</Nav.Link>
					</Link>
				</Navbar.Brand>
				{user ? (
					<Nav className="mr-auto">
						<Nav.Link as={Link} href="/users">Users</Nav.Link>
						<Nav.Link as={Link} href="/howtoplay">How to play</Nav.Link>
						<Nav.Link as={Link} href="/chooseGame">Play</Nav.Link>
					</Nav>
				) : (
					<></>
				)}
				<ProfileNav />
			</Navbar>
		</div>
	);
}

export default Header;

