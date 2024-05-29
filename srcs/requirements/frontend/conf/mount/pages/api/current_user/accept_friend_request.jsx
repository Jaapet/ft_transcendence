import cookie from 'cookie';

export default async (req, res) => {
	// Only POST allowed
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
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

		const { request_id } = req.body;
		if (!request_id) {
			throw new Error('No friend request id provided');
		}

		const reqRes = await fetch(`http://backend:8000/api/friend_request/accept`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${access}`
			},
			body: JSON.stringify({ request_id })
		});
		if (!reqRes) {
			throw new Error(`Could not accept friend request ${request_id}`);
		}

		const reqData = await reqRes.json();
		if (!reqData) {
			throw new Error(`Could not accept friend request ${request_id}`);
		}
		if (!reqRes.ok) {
			throw new Error(reqData.detail || `Could not accept friend request ${request_id}`);
		}

		return res.status(200).json({ message: reqData.detail });
	} catch (error) {
		console.error('API ACCEPT FRIEND REQUEST:', error);
		return res.status(401).json({ message: error.message });
	}
}
