import LikeButton from "./like-button";

const response = await fetch('http://backend:8000/');
const users = await response.json();

function Header({ title })
{
	return <h1>{title ? title : 'Default title'}</h1>;
}

export default function HomePage()
{
	return (
		<div>
			<Header title="Our beautiful database" />
			<ul>
				{users.map((user, index) => (
					<li key={index}>
						<ul>Name: {user.firstname} {user.lastname}</ul>
						<ul>Phone: {user.phone}</ul>
						<ul>Joined on {user.join_date}</ul>
					</li>
				))}
			</ul>
			<LikeButton />
		</div>
	);
}