import cookie from 'cookie'

export default async (req, res) => {
	// Only POST allowed
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res.status(405).json({ message: 'Method ${req.method} is not allowed' });
	}

	if (!req.headers.cookie) {
		return res.status(401).json({ message: 'Unauthorized' });
	}

	try {
		// Get refresh token
		const { refresh } = cookie.parse(req.headers.cookie);
		if (!refresh) {
			throw new Error('Could not fetch refresh token');
		}

		// Fetch access token
		const tokRes = await fetch(`http://backend:8000/api/token/refresh/`, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ refresh })
		});
		if (!tokRes) {
			throw new Error('Could not fetch access token');
		}

		const tokData = await tokRes.json();
		if (!tokData) {
			throw new Error('Could not fetch access token');
		}
		if (!tokRes.ok) {
			throw new Error(tokData.detail || 'Could not fetch access token');
		}
		const accessToken = tokData.access;

		// Fetch user data
		const userRes = await fetch(`http://backend:8000/api/user/`, {
			headers: {
				'Authorization': 'Bearer ' + accessToken
			}
		});
		if (!userRes) {
			throw new Error('Could not fetch user data');
		}

		const userData = await userRes.json();
		if (!userData)
			throw new Error('Could not fetch user data');
		if (!userRes.ok)
			throw new Error(userData.detail || 'Could not fetch user data');

		return res.status(200).json({ user: userData, access: accessToken });
	} catch (error) {
		console.error('API USER:', error);
		return res.status(401).json({ message: error.message });
	}
}