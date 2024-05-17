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

		// Fetch access token
		const tokRes = await fetch(`http://backend:8000/api/token/refresh/`, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ refresh })
		});
		if (!tokRes.ok) {
			throw new Error('Could not fetch access token');
		}

		const tokData = await tokRes.json();
		if (!tokData || !tokData.access) {
			return res.status(500).json({ message: 'Something went wrong' });
		}
		const accessToken = tokData.access;

		// Fetch user data
		const userRes = await fetch(`http://backend:8000/api/user/`, {
			headers: {
				'Authorization': 'Bearer ' + accessToken
			}
		});
		if (!userRes.ok) {
			throw new Error('Could not fetch user data');
		}

		const userData = await userRes.json();

		return res.status(200).json({ user: userData, access: accessToken });
	} catch (error) {
		console.error('Error during login refresh:', error);
		return res.status(401).json({ message: 'Login refresh failed' });
	}
}
