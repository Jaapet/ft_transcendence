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

		const { id } = req.body;
		if (!id) {
			throw new Error('No user id provided');
		}

		// Fetch user
		const userRes = await fetch(`https://backend:8000/api/members/${id}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${access}`
			}
		});
		if (!userRes) {
			throw new Error(`Could not fetch data for user ${id}`);
		}
		
		const userData = await userRes.json();
		if (!userData) {
			throw new Error(`Could not fetch data for user ${id}`);
		}
		if (userRes.status === 404) {
			//console.error('API USER FRIEND REQUESTS:', userData.detail);
			return res.status(404).json({ message: userData.detail });
		}
		if (!userRes.ok) {
			throw new Error(userData.detail || `Could not fetch data for user ${id}`);
		}

		// Fetch user's list of sent friend requests
		const sentRes = await fetch(`https://backend:8000/api/friend_requests/requests_sent/?user_id=${id}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${access}`
			}
		});
		if (!sentRes) {
			throw new Error(`Could not fetch list of sent friend requests for user ${id}`);
		}
		
		const sentData = await sentRes.json();
		if (!sentData) {
			throw new Error(`Could not fetch list of sent friend requests for user ${id}`);
		}
		if (sentRes.status === 404) {
			//console.error('API USER FRIEND REQUESTS:', sentData.detail);
			return res.status(404).json({ message: sentData.detail });
		}
		if (!sentRes.ok) {
			throw new Error(sentData.detail || `Could not fetch list of sent friend requests for user ${id}`);
		}

		// Fetch user's list of received friend requests
		const recvRes = await fetch(`https://backend:8000/api/friend_requests/requests_received/?user_id=${id}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${access}`
			}
		});
		if (!recvRes) {
			throw new Error(`Could not fetch list of received friend requests for user ${id}`);
		}
		
		const recvData = await recvRes.json();
		if (!recvData) {
			throw new Error(`Could not fetch list of received friend requests for user ${id}`);
		}
		if (recvRes.status === 404) {
			//console.error('API USER FRIEND REQUESTS:', recvData.detail);
			return res.status(404).json({ message: recvData.detail });
		}
		if (!recvRes.ok) {
			throw new Error(recvData.detail || `Could not fetch list of received friend requests for user ${id}`);
		}

		return res.status(200).json({ user: userData, requests_sent: sentData, requests_received: recvData });
	} catch (error) {
		//console.error('API USER FRIEND REQUESTS:', error);
		return res.status(401).json({ message: error.message });
	}
}
