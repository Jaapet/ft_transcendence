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

		const { target_id } = req.body;
		if (!target_id) {
			throw new Error('No user id provided');
		}

		const reqRes = await fetch(`https://backend:8000/api/friends/remove`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${access}`
			},
			body: JSON.stringify({ target_id })
		});
		if (!reqRes) {
			throw new Error(`Could not remove user ${target_id} from friends list`);
		}

		const reqData = await reqRes.json();
		if (!reqData) {
			throw new Error(`Could not remove user ${target_id} from friends list`);
		}
		if (!reqRes.ok) {
			throw new Error(reqData.detail || `Could not remove user ${target_id} from friends list`);
		}

		return res.status(200).json({ message: reqData.detail });
	} catch (error) {
		return res.status(401).json({ message: error.message });
	}
}
