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

		const { id } = req.body;
		if (!id) {
			throw new Error('No user id provided');
		}

		// Fetch user
		const userRes = await fetch(`http://backend:8000/api/members/${id}`, {
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
			console.error('API USER MATCH HISTORY:', userData.detail);
			return res.status(404).json({ message: userData.detail });
		}
		if (!userRes.ok) {
			throw new Error(userData.detail || `Could not fetch data for user ${id}`);
		}

		// Fetch user's match history
		const matchRes = await fetch(`http://backend:8000/api/matches/player_matches/?player_id=${id}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${access}`
			}
		});
		if (!matchRes) {
			throw new Error(`Could not fetch match history for user ${id}`);
		}
		
		const matchData = await matchRes.json();
		if (!matchData) {
			throw new Error(`Could not fetch match history for user ${id}`);
		}
		if (matchRes.status === 404) {
			console.error('API USER MATCH HISTORY:', matchData.detail);
			return res.status(200).json({ user: userData, matches: null });
		}
		if (!matchRes.ok) {
			throw new Error(matchData.detail || `Could not fetch match history for user ${id}`);
		}

		return res.status(200).json({ user: userData, matches: matchData });
	} catch (error) {
		console.error('API USER MATCH HISTORY:', error);
		return res.status(401).json({ message: error.message });
	}
}
