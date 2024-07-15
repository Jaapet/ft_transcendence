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

		// Fetch leaderboards
		const userRes = await fetch(`https://backend:8000/api/leaderboards`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${access}`
			}
		});
		if (!userRes) {
			throw new Error(`Could not fetch leaderboards`);
		}
		
		const userData = await userRes.json();
		if (!userData) {
			throw new Error(`Could not fetch leaderboards`);
		}
		if (userRes.status === 404) {
			console.error('API LEADERBOARDS:', userData.detail);
			return res.status(404).json({ message: userData.detail });
		}
		if (!userRes.ok) {
			throw new Error(userData.detail || `Could not fetch leaderboards`);
		}

		return res.status(200).json({ pong: userData.pong, royal: userData.royal });
	} catch (error) {
		console.error('API LEADERBOARDS:', error);
		return res.status(401).json({ message: error.message });
	}
}
