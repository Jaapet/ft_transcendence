import cookie from 'cookie'

export default async (req, res) => {
	// Only POST allowed
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res.status(405).json({ message: `Method ${req.method} is not allowed` });
	}

	const { username, password } = req.body;

	try {
		// Fetch tokens
		const tokRes = await fetch(`http://backend:8000/api/token/`, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ username, password })
		});
		if (!tokRes) {
			throw new Error('Could not fetch tokens');
		}

		const tokData = await tokRes.json();
		if (!tokData) {
			throw new Error('Could not fetch tokens');
		}
		if (!tokRes.ok) {
			throw new Error(tokData.detail || 'Could not fetch tokens');
		}

		// TODO: change to https later
		// TODO: Check if using cookie lib is really necessary
		// Store refresh token in a cookie
		res.setHeader('Set-Cookie', [
			cookie.serialize('refresh', tokData.refresh, {
				httpOnly: true,
				secure: false,
				sameSite: 'strict',
				maxAge: 60 * 60 * 24,
				path: '/'
			})
		]);

		// Fetch user data
		const accessToken = tokData.access;
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
		console.error('API LOGIN:', error);
		return res.status(401).json({ message: error.message });
	}
}
