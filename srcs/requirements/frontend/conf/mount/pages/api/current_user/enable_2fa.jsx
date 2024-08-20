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

		const enableRes = await fetch(`https://backend:8000/api/enable_2fa/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${access}`
			}
		});
		if (!enableRes)
			throw new Error('Could not enable 2FA');

		const enableData = await enableRes.json();
		if (!enableData)
			throw new Error('Could not enable 2FA');
		if (!enableRes.ok)
			throw new Error(enableData.detail || 'Could not enable 2FA');

		if (enableRes.status === 201)
			return res.status(201).json({ message: '2FA enabled successfully', secret_key: enableData.secret_key, qr_code_url: enableData.qr_code_url });
		else
			return res.status(200).json({ message: '2FA is already enabled', secret_key: enableData.secret_key, qr_code_url: enableData.qr_code_url });
	} catch (error) {
		//console.error('API ENABLE 2FA:', error);
		return res.status(500).json({ message: error.message });
	}
};
