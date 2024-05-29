import cookie from 'cookie';
import { useAuth } from '../../context/AuthenticationContext';

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
			throw new Error(`Could not send friend request to user ${id}`);
		}

		const reqData = await reqRes.json();
		if (!reqData) {
			throw new Error(`Could not send friend request to user ${id}`);
		}
		if (!reqRes.ok) {
			throw new Error(reqData.detail || `Could not send friend request to user ${id}`);
		}

		return res.status(201).json({ message: reqData.detail });
	} catch (error) {
		console.error('API ADD FRIEND:', error);
		return res.status(401).json({ message: error.message });
	}
}