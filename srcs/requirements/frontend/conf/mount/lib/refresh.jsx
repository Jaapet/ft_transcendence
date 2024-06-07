/* HOW TO USE
// Note: This function will either return the new access token or throw

	import refreshToken from '/path/to/lib/refresh';
	import cookie from 'cookie';

	function() {
		try {
			const access = await refreshToken(
				req,
				() => {
					// TODO: change to https later
					res.setHeader('Set-Cookie', [
						cookie.serialize('refresh', '', {
							httpOnly: true,
							secure: false,
							expires: new Date(0),
							sameSite: 'strict',
							path: '/'
						})
					]);
				}
			);
			if (!access) {
				throw new Error('Not logged in');
			}
			// Rest of function
		} catch (error) {
			// handle error
		}
	}

*/

const refreshToken = async (req, removeRefreshCookie) => {
	try {
		const accessRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/refresh`, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Cookie': req.headers.cookie || ''
			}
		});
		if (!accessRes) {
			throw new Error(`Could not refresh access token`);
		}
		const accessData = await accessRes.json();
		if (!accessData || !accessData.access) {
			throw new Error(`Could not refresh access token`);
		}
		if (!accessRes.ok) {
			throw new Error(accessData.message || `Could not refresh access token`);
		}
		return accessData.access;
	} catch (error) {
		console.error('LIB REFRESH:', error);
		removeRefreshCookie();
		return null;
	}
}

export default refreshToken;