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
		if (!userRes.ok) {
			throw new Error(userData.detail || `Could not fetch data for user ${id}`);
		}

		// Fetch user's pong2 match history
		const pong2Res = await fetch(`https://backend:8000/api/pong2_matches/player_matches/?player_id=${id}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${access}`
			}
		});
		if (!pong2Res) {
			throw new Error(`Could not fetch pong2 match history for user ${id}`);
		}

		const pong2Data = await pong2Res.json();
		if (!pong2Data) {
			throw new Error(`Could not fetch pong2 match history for user ${id}`);
		}
		if (pong2Res.status !== 404 && !pong2Res.ok) {
			throw new Error(pong2Data.detail || `Could not fetch pong2 match history for user ${id}`);
		}

		// Fetch user's pong3 match history
		const pong3Res = await fetch(`https://backend:8000/api/pong3_matches/player_matches/?player_id=${id}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${access}`
			}
		});
		if (!pong3Res) {
			throw new Error(`Could not fetch pong3 match history for user ${id}`);
		}

		const pong3Data = await pong3Res.json();
		if (!pong3Data) {
			throw new Error(`Could not fetch pong3 match history for user ${id}`);
		}
		if (pong3Res.status !== 404 && !pong3Res.ok) {
			throw new Error(pong3Data.detail || `Could not fetch pong3 match history for user ${id}`);
		}

		return res.status(200).json({ user: userData, pong2_matches: pong2Data, pong3_matches: pong3Data });
	} catch (error) {
		//console.error('API USER MATCH HISTORY:', error);
		return res.status(401).json({ message: error.message });
	}
}
