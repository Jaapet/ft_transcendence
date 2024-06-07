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

		const { target_id } = req.body;
		if (!target_id) {
			throw new Error('No user id provided');
		}

		const reqRes = await fetch(`http://backend:8000/api/friend_request/send`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${access}`
			},
			body: JSON.stringify({ target_id })
		});
		if (!reqRes) {
			throw new Error(`Could not send friend request to user ${target_id}`);
		}

		const reqData = await reqRes.json();
		if (!reqData) {
			throw new Error(`Could not send friend request to user ${target_id}`);
		}
		if (!reqRes.ok) {
			throw new Error(reqData.detail || `Could not send friend request to user ${target_id}`);
		}

		return res.status(201).json({ message: reqData.detail });
	} catch (error) {
		console.error('API ADD FRIEND:', error);
		return res.status(401).json({ message: error.message });
	}
}
