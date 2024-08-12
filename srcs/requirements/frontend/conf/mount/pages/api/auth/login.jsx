export default async (req, res) => {
	// Only POST allowed
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res.status(405).json({ message: `Method ${req.method} is not allowed` });
	}

	const { username, password } = req.body;
	console.log(`Login attempt for username=${username}`); // ELK LOG

	try {
		// Fetch tokens
		const tokRes = await fetch(`https://backend:8000/api/token/`, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ username, password })
		});
		if (!tokRes) {
			console.log(`Login failed for username=${username}`); // ELK LOG
			throw new Error('Could not fetch tokens');
		}

		const tokData = await tokRes.json();
		if (!tokData) {
			console.log(`Login failed for username=${username}`); // ELK LOG
			throw new Error('Could not fetch tokens');
		}
		if (!tokRes.ok) {
			console.log(`Login failed for username=${username}`); // ELK LOG
			throw new Error(tokData.detail || 'Could not fetch tokens');
		}

		if (tokData.requires_2fa && tokData.user_id) {
			console.log(`Prompting user=${username} for 2fa`); // ELK LOG
			return res.status(200).json({ requires_2fa: tokData.requires_2fa, user_id: tokData.user_id });
		}

		console.log(`Login successful for user=${username}`); // ELK LOG

		// Store refresh token in a cookie
		res.setHeader(
			'Set-Cookie',
			`refresh=${tokData.refresh}; HttpOnly; Secure; Max-Age=86400; SameSite=Strict; Path=/`
		);

		// Fetch user data
		const accessToken = tokData.access;
		const userRes = await fetch(`https://backend:8000/api/user/`, {
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

		if (userData.is_admin)
			console.log(`WARNING: Admin logged in user=${username}`); // ELK LOG

		return res.status(200).json({ user: userData, access: accessToken });
	} catch (error) {
		console.error('API LOGIN:', error);
		return res.status(401).json({ message: error.message });
	}
}
