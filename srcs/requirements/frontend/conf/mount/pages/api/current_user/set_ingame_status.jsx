import refreshToken from '../../../lib/refresh';

export default async (req, res) => {
	// Only POST allowed
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res.status(405).json({ message: `Method ${req.method} is not allowed` });
	}

	try {
		const access = await refreshToken(
			req,
			() => {res.setHeader('Set-Cookie', 'refresh=; HttpOnly; Secure; Max-Age=0; SameSite=Strict; Path=/');}
		);
		if (!access) {
			throw new Error('Not logged in');
		}

		const { value } = req.body;
		if (value !== true && value !== false) {
			throw new Error('Invalid value for ingame status');
		}

		const reqRes = await fetch(`https://backend:8000/api/edit_ingame_status`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${access}`
			},
			body: JSON.stringify({ is_ingame: value })
		});
		if (!reqRes) {
			throw new Error(`Could not set ingame status to ${value}`);
		}

		const reqData = await reqRes.json();
		if (!reqData) {
			throw new Error(`Could not set ingame status to ${value}`);
		}
		if (!reqRes.ok) {
			throw new Error(reqData.detail || `Could not set ingame status to ${value}`);
		}

		return res.status(200).json({ message: reqData.detail });
	} catch (error) {
		console.error('API INGAME STATUS:', error);
		return res.status(401).json({ message: error.message });
	}
}
