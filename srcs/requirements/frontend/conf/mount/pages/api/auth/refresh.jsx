// This function is used for manual Login Refresh
// Only use this through refreshToken (lib/refresh.jsx)

function parseCookies(cookieHeader) {
	const cookies = {};
	cookieHeader.split(';').forEach(cookie => {
		const parts = cookie.split('=');
		const name = parts[0].trim();
		// decodeURIComponent decodes URL-encoded characters into their normal versions
		// because not every character can be in a cookie (separators, etc)
		// This shouldn't come into play in our project but it's cleaner this way
		const value = parts[1] ? decodeURIComponent(parts[1].trim()) : '';
		cookies[name] = value;
	});
	return cookies;
}

export default async (req, res) => {
	// Only POST allowed
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res.status(405).json({ message: `Method ${req.method} is not allowed` });
	}

	try {
		const cookies = parseCookies(req.headers.cookie || '');
		const refresh = cookies.refresh;
		if (!refresh) {
			throw new Error('No refresh token available');
		}

		// Fetch access token
		const tokRes = await fetch(`https://backend:8000/api/token/refresh/`, {
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
		return res.status(401).json({ message: 'API could not refresh access token'});
	}
}
