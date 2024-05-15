import { createContext, useState } from 'react';
import { useRouter } from 'next/router';

const AuthenticationContext = createContext();

export const AuthenticationProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [accessToken, setAccessToken] = useState(null);
	const [error, setError] = useState(null);

	const router = useRouter();

	// Login user
	const login = async ({ username, password }) => {
		try {
			const response = await fetch(`/api/login`, {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ username, password })
			});

			if (!response.ok) {
				throw new Error('Login failed');
			}

			const data = await response.json();

			setAccessToken(data.access);

			// router.push('/index');
		} catch (error) {
			setError(error.message);
		}
	}

	return (
		<AuthenticationContext.Provider value={{ user, accessToken, error, login }}>
			{children}
		</AuthenticationContext.Provider>
	);
}

export default AuthenticationContext;
