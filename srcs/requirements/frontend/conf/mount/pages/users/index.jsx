import React from 'react';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../../styles/base.module.css';
import { useAuth } from '../../context/AuthenticationContext';

const UserTableHead = ({ onSort, sortConfig }) => {
	const getSortDirection = (column) => {
		if (sortConfig && sortConfig.key === column) {
			return sortConfig.direction === 'ascending' ? '▲' : '▼';
		}
		return null;
	};
	
	return (
		<thead>
			<tr key="0">
				<th scope="col">Avatar</th>
				<th scope="col" onClick={() => onSort('username')}>Username {getSortDirection('username')}</th>
				<th scope="col" onClick={() => onSort('is_online')}>Online? {getSortDirection('is_online')}</th>
				<th scope="col" onClick={() => onSort('elo_pong')}>Pong ELO {getSortDirection('elo_pong')}</th>
				<th scope="col" onClick={() => onSort('elo_royal')}>Royal ELO {getSortDirection('elo_royal')}</th>
				<th scope="col" onClick={() => onSort('join_date')}>Join date {getSortDirection('join_date')}</th>
			</tr>
		</thead>
	)
}

const UserTableRow = ({ user }) => {
	return (
		<tr key={user.id}>
			<td>
				<Link href={`/users/${user.id}`} passHref>
					<Image
						src={user.avatar}
						alt={`${user.username}'s avatar`}
						width={40}
						height={40}
					/>
				</Link>
			</td>
			<th>
				<Link href={`/users/${user.id}`} passHref>
					{user.username}
				</Link>
			</th>

			{/* status colored dot */}
			<td>
				<span
					style={{
						display: 'inline-block',
						width: '15px',
						height: '15px',
						borderRadius: '50%',
						backgroundColor: user.is_online ? 'green' : 'red',
						marginRight: '5px',
						verticalAlign: 'middle'
					}}
				></span>
			</td>

			<td>{user.elo_pong}</td>
			<td>{user.elo_royal}</td>
			<td>{user.join_date}</td>
		</tr>
	);
}

const UserTable = ({ users, onSort, sortConfig }) => (
	<table className="table table-sm table-striped table-dark mt-4 w-75 mx-auto" style={{marginBottom: '2cm'}}>
		<UserTableHead onSort={onSort} sortConfig={sortConfig} />
		<tbody>
			{ users.map(user => (
				<UserTableRow key={user.id} user={user} />
			)) }
		</tbody>
	</table>
);

export default function Users({ status, detail, users }) {
	const { logout } = useAuth();
	const [sortedUsers, setSortedUsers] = useState(users);
	const [sortConfig, setSortConfig] = useState({ key: 'username', direction: 'ascending' });

	const handleLogout = async () => {
		await logout();
	}

	if (status === 401 && detail === 'Not logged in') {
		handleLogout();
	}

	if (status !== 200 || !users) {
		return (
			<div className={styles.container}>
				<p className="bg-light text-black">Something went wrong...</p>
				<p className="bg-light text-black">Please reload the page.</p>
			</div>
		);
	}

	const handleSort = (column) => {
		let direction = 'ascending';
		if (sortConfig && sortConfig.key === column && sortConfig.direction === 'ascending')
			direction = 'descending';

		const sortedData = [...users].sort((a, b) => {
			if (a[column] < b[column])
				return direction === 'ascending' ? -1 : 1;

			if (a[column] > b[column])
				return direction === 'ascending' ? 1 : -1;

			return 0;
		});
		setSortConfig({ key: column, direction });
		setSortedUsers(sortedData);
	};

	return (
		<div>
			<div className={styles.container}>
			<h1 className={styles.background_title}> User List </h1>
			<UserTable users={sortedUsers} onSort={handleSort} sortConfig={sortConfig} />
		</div>
		</div>
	)
}

/*
Each member has the following data:
- id						(big int, unique)
- username			(string, unique)
- password			(string, hashed)
- email					(string, unique)
- avatar				(string, link to image hosted on backend)
- join_date			(string)
- is_superuser	(bool)
- is_admin			(bool)
*/
export async function getServerSideProps(context) {
	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/user_list`, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Cookie': context.req.headers.cookie
			}
		});
		if (!response) {
			throw new Error('User list fetch failed');
		}
		if (response.status === 404) {
			return {
				props: {
					status: 404,
					detail: 'Resource not found',
					users: null
				}
			}
		}

		const data = await response.json();
		if (!data) {
			throw new Error('User list fetch failed');
		}
		if (!response.ok) {
			throw new Error(data.message, 'User list fetch failed');
		}

		return {
			props: {
				status: 200,
				detail: 'Success',
				users: data.users
			}
		}
	} catch (error) {
		console.error('USER LIST:', error);
		return {
			props: {
				status: 401,
				detail: error.message,
				users: null
			}
		}
	}
}
