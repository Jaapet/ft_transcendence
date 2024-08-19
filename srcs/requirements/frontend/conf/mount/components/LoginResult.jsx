import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthenticationContext';

const LoginResult = () => {
	const { user } = useAuth();

	if (!user) {
		return (
			<div className="text-center">
				<p className="h6 mb-3">You are not logged in</p>
				<Link href="/account/login" className="fw-bold text-body">
					<u>Log in here</u>
				</Link>
			</div>
		);
	}

	return (
		<div className="text-center">
			<p className="h6 mb-3">You are logged in as <b>{user.username}</b></p>
			<Link href={`/users/${user.id}`}>
				<Image
					src={user.avatar}
					alt={"Your avatar"}
					width={120}
					height={120}
					style={{
						borderRadius: '30%',
						right: '2cm'
					}}
					className="mb-3"
				/>
			</Link>
			<br/>
			<Link href="/" className="fw-bold text-body">
				<u>Home Page</u>
			</Link>
		</div>
	);
}

export default LoginResult;
