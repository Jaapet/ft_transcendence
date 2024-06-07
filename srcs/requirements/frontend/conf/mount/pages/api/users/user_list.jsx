import refreshToken from '../../../lib/refresh';
import cookie from 'cookie';

export default async (req, res) => {
	// Only POST allowed
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res.status(405).json({ message: `Method ${req.method} is not allowed` });
	}

	try {
		const access = await refreshToken(
			req,
			() => {
				// TODO: change to https later
				res.setHeader('Set-Cookie', [
					cookie.serialize('refresh', '', {
						httpOnly: true,
						secure: false,
						expires: new Date(0),
						sameSite: 'strict',
						path: '/'
					})
				]);
			}
		);
		if (!access) {
			throw new Error('Not logged in');
		}

		// Fetch user list
		const userRes = await fetch(`http://backend:8000/api/members`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${access}`
			}
		});
		if (!userRes) {
			throw new Error(`Could not fetch user list`);
		}
		
		const userData = await userRes.json();
		if (!userData) {
			throw new Error(`Could not fetch user list`);
		}
		if (userRes.status === 404) {
			console.error('API USER LIST:', userData.detail);
			return res.status(404).json({ message: userData.detail });
		}
		if (!userRes.ok) {
			throw new Error(userData.detail || `Could not fetch user list`);
		}

		return res.status(200).json({ users: userData.results });
	} catch (error) {
		console.error('API USER LIST:', error);
		return res.status(401).json({ message: error.message });
	}
}
