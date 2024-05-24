import React from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthenticationContext';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../styles/header.module.css';

const ProfileNavPicture = () => {
	const { user } = useAuth();
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
			style={{
				borderRadius: '50%',
				marginLeft: '10px'
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

		return (
			<>
				<NavDropdown.ItemText>{user.username}</NavDropdown.ItemText>
				<NavDropdown.Divider />
				<Link href={`/users/${user.id}`} passHref>
					<NavDropdown.Item as="a">My Profile</NavDropdown.Item>
				</Link>
				<NavDropdown.Item as="button" onClick={handleLogout}>Log out</NavDropdown.Item>
			</>
		);
	}

	// Unauthenticated version
	return (
		<>
			<Link href="/account/login" passHref>
				<NavDropdown.Item as="a">Login</NavDropdown.Item>
			</Link>
			<Link href="/account/register" passHref>
				<NavDropdown.Item as="a">Register</NavDropdown.Item>
			</Link>
		</>
	);
}

const ProfileNav = () => {
	return (
		<Nav className="mr-auto">
			<NavDropdown title={<ProfileNavPicture />} id="basic-nav-dropdown">
				<ProfileNavLog />
				<NavDropdown.Divider />
				<Link href="/special-thanks" passHref>
					<NavDropdown.Item as="a">Special thanks</NavDropdown.Item>
				</Link>
			</NavDropdown>
		</Nav>
	);
}

// TODO: Align ProfileNav to the right?
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
					<Nav.Link href="/users">Users</Nav.Link>
					<Nav.Link href="#how-to-play">How to play</Nav.Link>
					<Nav.Link href="#credits">Credits</Nav.Link>
				</Nav>
				<ProfileNav />
			</Navbar>
		</div>
	);
}

export default Header;

