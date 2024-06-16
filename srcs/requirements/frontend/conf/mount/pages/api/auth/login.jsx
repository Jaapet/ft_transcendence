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

		if (tokData.requires_2fa && tokData.user_id) {
			return res.status(200).json({ requires_2fa: tokData.requires_2fa, user_id: tokData.user_id });
		}

		// Store refresh token in a cookie
		res.setHeader(
			'Set-Cookie',
			`refresh=${tokData.refresh}; HttpOnly; Secure; Max-Age=86400; SameSite=Strict; Path=/`
		);

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
