import React from 'react';
import Image from 'next/image';

const Superuser = ({ is_superuser }) => {
	if (!is_superuser) {
		return null;
	}

	return <h4 class="card-text">Superuser</h4>;
}

const Admin = ({ is_admin }) => {
	if (!is_admin) {
		return null;
	}

	return <h5 class="card-text">Admin</h5>;
}

export default function Member({ member }) {
	if (!member) {
		return (
			<div align="center">
				<p>Something went wrong...</p>
				<a href="/members/">Back to member list</a>
			</div>
		);
	}

	return (
		<div align="center">
			<div class="card" style={{width: '18rem'}}>
				<Image
					src={member.avatar}
					class="card-img-top"
					alt={member.username + "'s avatar"}
					width={400}
					height={400}
				/>
				<div class="card-body">
					<h3 class="card-title">{member.username} ({member.id})</h3>
					<p class="card-text">{member.email}</p>
					<p class="card-text">Joined on {member.join_date}</p>
					<Superuser is_superuser={member.is_superuser} />
					<Admin is_admin={member.is_admin} />
				</div>
			</div>
			<a href="/members/">Back to member list</a>
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
export async function getServerSideProps(context) {
	const { id } = context.params;
	const result = await fetch(`http://backend:8000/members/${id}`);

	if (result.status == 403) {
		return {
			props: {
				member: null
			}
		}
	}

	const data = await result.json();

	return {
		props: {
			member: data || null
		}
	}
}
