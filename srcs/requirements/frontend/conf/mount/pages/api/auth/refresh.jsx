import cookie from 'cookie';

// This function is used for manual Login Refresh
// Only use this through refreshToken (lib/refresh.jsx)

export default async (req, res) => {
	// Only POST allowed
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res.status(405).json({ message: `Method ${req.method} is not allowed` });
	}

	try {
		const cookies = cookie.parse(req.headers.cookie || "");
		const refresh = cookies.refresh;
		if (!refresh) {
			throw new Error('No refresh token available');
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
		if (!tokData || !tokData.access) {
			throw new Error('Could not fetch access token');
		}
		if (!tokRes.ok) {
			throw new Error(tokData.detail || 'Could not fetch access token');
		}

		return res.status(200).json({ access: tokData.access });
	} catch (error) {
		console.error('API REFRESH:', error);
		return res.status(401).json({ message: 'API could not refresh access token'});
	}
}
