export default async (req, res) => {
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res.status(405).json({ message: `Method ${req.method} is not allowed` });
	}

	const { user_id, otp } = req.body;

	try {
		const verifyRes = await fetch(`https://backend:8000/api/verify_2fa/`, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ user_id, otp })
		});
		if (!verifyRes)
			throw new Error('Could not fetch tokens');

		const verifyData = await verifyRes.json();
		if (!verifyData)
			throw new Error('Could not fetch tokens');
		if (!verifyRes.ok)
			throw new Error(verifyData.detail || 'Could not verify OTP');

		res.setHeader(
			'Set-Cookie',
			`refresh=${verifyData.refresh}; HttpOnly; Secure; Max-Age=86400; SameSite=Strict; Path=/`
		);

		// Fetch user data
		const accessToken = verifyData.access;
		const userRes = await fetch(`https://backend:8000/api/user/`, {
			headers: {
				'Authorization': 'Bearer ' + accessToken
			}
		});
		if (!userRes)
			throw new Error('Could not fetch user data');

		const userData = await userRes.json();
		if (!userData)
			throw new Error('Could not fetch user data');
		if (!userRes.ok)
			throw new Error(userData.detail || 'Could not fetch user data');

		return res.status(200).json({ user: userData, access: accessToken });
	} catch (error) {
		console.error('API VERIFY 2FA:', error);
		return res.status(401).json({ message: error.message });
	}
};
