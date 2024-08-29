import React from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../../styles/base.module.css';
import { useAuth } from '../../context/AuthenticationContext';
import StatusCircle from '../../components/StatusCircle';

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
				<th scope="col" onClick={() => onSort('elo_pong')}>ELO {getSortDirection('elo_pong')}</th>
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
				<StatusCircle userId={user.id} />
			</td>

			<td>{user.elo_pong}</td>
		</tr>
	);
}

const UserTable = ({ users, onSort, sortConfig }) => (
	<table className="table table-sm table-striped table-dark mt-4 w-50 mx-auto" style={{marginBottom: '2cm'}}>
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
	const [sortConfig, setSortConfig] = useState({ key: 'username', direction: 'descending' });

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

	useEffect(() => {
		handleSort('username');
	}, [users]);

	const handleSort = (column) => {
		let direction = 'ascending';
		if (sortConfig && sortConfig.key === column && sortConfig.direction === 'ascending')
			direction = 'descending';

		const sortedData = [...users].sort((a, b) => {
			if (column === 'is_online') { // Online Status
				const order = {
					online: 1,
					ingame: 2,
					offline: 3,
					unknown: 4
				};

				const aVal = order[a[column]];
				const bVal = order[b[column]];

				if (aVal < bVal)
					return direction === 'ascending' ? -1 : 1;

				if (aVal > bVal)
					return direction === 'ascending' ? 1 : -1;

				return 0;
			} else if (column === 'username') { // Username
				const aName = a[column].toUpperCase();
				const bName = b[column].toUpperCase();

				if (aName < bName)
					return direction === 'ascending' ? -1 : 1;

				if (aName > bName)
					return direction === 'ascending' ? 1 : -1;

				return 0;
			} else { // ELO
				if (a[column] < b[column])
						return direction === 'ascending' ? 1 : -1;

				if (a[column] > b[column])
						return direction === 'ascending' ? -1 : 1;

				return 0;
			}
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
		return {
			props: {
				status: 401,
				detail: error.message,
				users: null
			}
		}
	}
}
