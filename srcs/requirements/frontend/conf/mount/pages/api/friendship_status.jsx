import cookie from 'cookie';

export default async (req, res) => {
	// Only GET allowed
	if (req.method !== 'GET') {
		res.setHeader('Allow', ['GET']);
		return res.status(405).json({ message: `Method ${req.method} is not allowed` });
	}

	try {
		if (!req.headers.cookie) {
			throw new Error('Unauthorized');
		}
		const { access } = cookie.parse(req.headers.cookie);
		if (!access) {
			// TODO: make a refresh function
			throw new Error('Could not fetch access token');
		}

		const { user_id, target_id } = req.query;
		if (!user_id) {
			throw new Error('No user_id provided');
		}
		if (!target_id) {
			throw new Error('No target_id provided');
		}

		const reqRes = await fetch(`http://backend:8000/api/friends/friendship_status?user1_id=${user_id}&user2_id=${target_id}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${access}`
			}
		});
		if (!reqRes) {
			throw new Error(`Could not get friendship status with user ${target_id}`);
		}

		const reqData = await reqRes.json();
		if (!reqData) {
			throw new Error(`Could not get friendship status with user ${target_id}`);
		}
		if (!reqRes.ok) {
			throw new Error(reqData.detail || `Could not get friendship status with user ${target_id}`);
		}

		return res.status(200).json({ message: reqData.detail });
	} catch (error) {
		console.error('API CHECK FRIENDSHIP:', error);
		return res.status(401).json({ message: error.message });
	}
}
