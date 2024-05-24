import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const UserTableHead = () => {
	return (
		<thead>
			<tr>
				<th scope="col">Avatar</th>
				<th scope="col">ID</th>
				<th scope="col">Username</th>
				<th scope="col">Email</th>
				<th scope="col">Join date</th>
				<th scope="col">Role</th>
			</tr>
		</thead>
	)
}

const UserTableRow = ({ user }) => {
	return (
	  <tr>
		<td>
		  <Link href={`/users/${user.id}`} passHref>
			<a>
			  <Image
				src={user.avatar}
				alt={`${user.username}'s avatar`}
				width={40}
				height={40}
			  />
			</a>
		  </Link>
		</td>
		<th>{user.id}</th>
		<th>
		  <Link href={`/users/${user.id}`} passHref>
			<a>
			  {user.username}
			</a>
		  </Link>
		</th>
		<td>{user.email}</td>
		<td>{user.join_date}</td>
		<td>{user.is_admin ? 'Admin' : 'User'}</td>
	  </tr>
	)
  }

const UserTable = ({ users }) => {
	return (
		<table class="table table-sm table-striped table-dark mt-4 w-75 mx-auto">
			<UserTableHead />
			<tbody>
			{ users.map(user => (
				<UserTableRow user={user} />
			)) }
			</tbody>
		</table>
	)
}

export default function Users({ users }) {
	if (!users) {
		return (
			<div align="center">
				<p>Something went wrong...</p>
				<p>Please reload the page.</p>
			</div>
		);
	}

	return (
		<div>
			<h1 class="text-center mt-4 w-25 mx-auto">{ `User list` }</h1>
			<UserTable users={users} />
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
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user_list`, {
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
				users: data.users
			}
		}
	} catch (error) {
		console.error('USER LIST:', error);
		return {
			props: {
				status: 401,
				users: null
			}
		}
	}
}
