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

			if (data) {
				if (data.user) {
					setUser(data.user);
				}
				if (data.access) {
					setAccessToken(data.access);
				}
			}

			 router.push('/');
		} catch (error) {
			setError(error.message);
		}
	}

	// TODO: Add avatar later
	// Register and login new user
	const register = async ({ username, email, password, avatar }) => {
		try {
			const formData = new FormData();
			formData.append('username', username);
			formData.append('email', email);
			formData.append('password', password);
			if (avatar) {
				formData.append('avatar', avatar);
			}

			const response = await fetch(`/api/register`, {
				method: 'POST',
//				headers: {
//					'Accept': 'application/json',
//					'Content-Type': 'multipart/form-data'
//				},
				body: formData
			});

			if (response.ok) {
				await login({ username, password });
			}
		} catch (error) {
			setError(error.message);
		}
	}

	return (
		<AuthenticationContext.Provider value={{ user, accessToken, error, login, register }}>
			{children}
		</AuthenticationContext.Provider>
	);
}

export default AuthenticationContext;
