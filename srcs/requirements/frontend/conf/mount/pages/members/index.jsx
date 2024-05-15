import React from 'react';
import Image from 'next/image';

const MemberTableHead = () => {
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

const MemberTableRow = ({ member }) => {
	return (
		<tr>
			<td>
				<a href={"/members/" + member.id}>
				<Image
					src={member.avatar}
					alt={member.username + "'s avatar"}
					width={40}
					height={40}
				/>
				</a>
			</td>
			<th>{member.id}</th>
			<th><a href={"/members/" + member.id}>
				{member.username}
			</a></th>
			<td>{member.email}</td>
			<td>{member.join_date}</td>
			<td>{member.is_admin ? 'Admin' : 'User'}</td>
		</tr>
	)
}

const MemberTable = ({ members }) => {
	return (
		<table class="table table-sm table-striped table-dark mt-4 w-75 mx-auto">
			<MemberTableHead />
			<tbody>
			{ members.map(member => (
				<MemberTableRow member={member} />
			)) }
			</tbody>
		</table>
	)
}

export default function Members({ members }) {
	if (!members) {
		return (
			<div align="center">
				<p>Something went wrong...</p>
				<p>Please reload the page.</p>
			</div>
		);
	}

	return (
		<div>
			<h1 class="text-center mt-4 w-25 mx-auto">{ `Member list` }</h1>
			<MemberTable members={members} />
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
- join_date			(string I think?)
- is_superuser	(bool)
- is_admin			(bool)
*/
export async function getServerSideProps({ params }) {
	const result = await fetch('http://backend:8000/api/members/');

	if (result.status != 200) {
		return {
			props: {
				members: null
			}
		}
	}

	const data = await result.json();

	return {
		props: {
			members: data.results || null
		}
	}
}
