import cookie from 'cookie';

// This function is used for Login Refresh

export default async (req, res) => {
	// Only POST allowed
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res.status(405).json({ message: `Method ${req.method} is not allowed` });
	}

	let accessToken = '';

	try {
		if (!req.headers.cookie) {
			throw new Error('Unauthorized');
		}

		// Get refresh token
		const { refresh } = cookie.parse(req.headers.cookie);
		if (!refresh) {
			throw new Error('Could not get refresh token from cookie');
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
		accessToken = tokData.access;

		// TODO: change to https later
		// Update access token cookie
		res.setHeader('Set-Cookie', cookie.serialize('access', tokData.access, {
			httpOnly: true,
			secure: false,
			sameSite: 'strict',
			maxAge: 60 * 5,
			path: '/'
		}));
	} catch (error) {
		console.error('API USER:', error);
		// TODO: change to https later
		res.setHeader('Set-Cookie', [
			cookie.serialize('refresh', '', {
				httpOnly: true,
				secure: false,
				expires: new Date(0),
				sameSite: 'strict',
				path: '/'
			}),
			cookie.serialize('access', '', {
				httpOnly: true,
				secure: false,
				expires: new Date(0),
				sameSite: 'strict',
				path: '/'
			})
		]);
		return res.status(401).json({ message: error.message });
	}

	try {
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
