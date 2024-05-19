import cookie from 'cookie'

export default async (req, res) => {
	// Only POST allowed
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res.status(405).json({message: `Method ${req.method} is not allowed`});
	}

	try {
		// TODO: change to https later
		res.setHeader('Set-Cookie', cookie.serialize('refresh', '', {
			httpOnly: true,
			secure: false,
			expires: new Date(0),
			sameSite: 'strict',
			path: '/'
		}));

		return res.status(200).json({message: 'User has been logged out'});

	} catch (error) {
		console.error('API LOGOUT:', error);
		return res.status(401).json({ message: error.message });
	}
}
