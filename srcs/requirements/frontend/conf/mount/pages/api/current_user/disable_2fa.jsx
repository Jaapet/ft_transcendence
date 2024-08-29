import refreshToken from '../../../lib/refresh';

export default async (req, res) => {
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

		const enableRes = await fetch(`https://backend:8000/api/disable_2fa/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${access}`
			}
		});
		if (!enableRes)
			throw new Error('Could not disable 2FA');

		const enableData = await enableRes.json();
		if (!enableData)
			throw new Error('Could not disable 2FA');
		if (!enableRes.ok)
			throw new Error(enableData.detail || 'Could not disable 2FA');

		return res.status(200).json({ message: '2FA is disabled' });
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};
