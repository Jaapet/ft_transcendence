import cookie from 'cookie'

export default async (req, res) => {
	// Only POST allowed
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res.status(405).json({message: `Method ${req.method} is not allowed`});
	}

	const {username, password} = req.body;

	try {
		// Fetch access token
		const tokRes = await fetch(`http://backend:8000/api/token/`, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ username, password })
		});
		if (!tokRes.ok) {
			throw new Error('Could not fetch tokens');
		}
		const tokData = await tokRes.json();
		// console.log(tokData);

		const accessToken = tokData.access;
		if (!accessToken) {
			throw new Error('Could not fetch tokens');
		}

		// TODO: change to https later
		res.setHeader('Set-Cookie', cookie.serialize('refresh', tokData.refresh, {
			httpOnly: true,
			secure: false,
			sameSite: 'strict',
			maxAge: 60 * 60 * 24,
			path: '/'
		}));

		// Fetch user data
		const userRes = await fetch(`http://backend:8000/api/user/`, {
			headers: {
				'Authorization': 'Bearer ' + accessToken
			}
		})
		if (!userRes.ok) {
			throw new Error('Could not fetch user');
		}
		const userData = await userRes.json();

		// Return everything
		// console.log(userData);
		return res.status(200).json({user: userData, access: accessToken});

	} catch (error) {
		console.error('Error during login:', error);
		return res.status(401).json({ message: 'Login failed' });
	}
}
