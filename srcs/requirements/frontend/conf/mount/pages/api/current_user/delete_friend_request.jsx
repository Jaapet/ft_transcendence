import refreshToken from '../../../lib/refresh';

export default async (req, res) => {
	// Only POST allowed
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res.status(405).json({ message: `Method ${req.method} is not allowed` });
	}

	try {
		const access = await refreshToken(
			req,
			() => {res.setHeader('Set-Cookie', 'refresh=; HttpOnly; Secure; Max-Age=0; SameSite=Strict; Path=/');}
		);
		if (!access) {
			throw new Error('Not logged in');
		}

		const { request_id } = req.body;
		if (!request_id) {
			throw new Error('No friend request id provided');
		}

		const reqRes = await fetch(`https://backend:8000/api/friend_request/delete`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${access}`
			},
			body: JSON.stringify({ request_id })
		});
		if (!reqRes) {
			throw new Error(`Could not delete friend request ${request_id}`);
		}

		const reqData = await reqRes.json();
		if (!reqData) {
			throw new Error(`Could not delete friend request ${request_id}`);
		}
		if (!reqRes.ok) {
			throw new Error(reqData.detail || `Could not delete friend request ${request_id}`);
		}

		return res.status(200).json({ message: reqData.detail });
	} catch (error) {
		console.error('API DELETE FRIEND REQUEST:', error);
		return res.status(401).json({ message: error.message });
	}
}
