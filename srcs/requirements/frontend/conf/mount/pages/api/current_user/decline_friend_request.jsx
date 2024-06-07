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

		const { request_id } = req.body;
		if (!request_id) {
			throw new Error('No friend request id provided');
		}

		const reqRes = await fetch(`http://backend:8000/api/friend_request/decline`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${access}`
			},
			body: JSON.stringify({ request_id })
		});
		if (!reqRes) {
			throw new Error(`Could not decline friend request ${request_id}`);
		}

		const reqData = await reqRes.json();
		if (!reqData) {
			throw new Error(`Could not decline friend request ${request_id}`);
		}
		if (!reqRes.ok) {
			throw new Error(reqData.detail || `Could not decline friend request ${request_id}`);
		}

		return res.status(200).json({ message: reqData.detail });
	} catch (error) {
		console.error('API DECLINE FRIEND REQUEST:', error);
		return res.status(401).json({ message: error.message });
	}
}
