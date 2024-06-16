import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const AuthenticationContext = createContext();
/*
Member objects contain:
- username		(CharField)
- email			(EmailField)
- avatar		(ImageField)
- join_date	(DateField)
- is_admin		(booleanField)

From Match objects:
- pong2_matches_lost
- pong2_matches_won

Indexed on:
- username
- join_date + username
- DESC join_date + username
*/

export const AuthenticationProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [accessToken, setAccessToken] = useState(null);
	const [error, setError] = useState(null);

	const router = useRouter();

	// When page loads, will check if user is logged in
	useEffect(() => {
		const loginRefresh = async () => {
			await isLoggedIn();
		}
		loginRefresh();
	}, []);

	// Login user
	const login = async ({ username, password }) => {
		try {
			const response = await fetch(`/api/auth/login`, {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ username, password })
			});
			if (!response) {
				throw new Error('Login failed');
			}

			const data = await response.json();
			if (!data) {
				throw new Error('Login failed');
			}
			if (!response.ok) {
				throw new Error(data.message, 'Login failed');
			}

			if (data.requires_2fa)
				return data;

			setUser(data.user);
			setAccessToken(data.access);

			router.push('/');
			return null;
		} catch (error) {
			console.error('CONTEXT LOGIN:', error);
			setError(error.message);
			return null;
		}
	}

	// Login user with 2FA
	const login2FA = async ({ user_id, otp }) => {
		try {
			const response = await fetch(`/api/auth/verify_2fa`, {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ user_id, otp })
			});
			if (!response) {
				throw new Error('Login with 2FA failed');
			}

			const data = await response.json();
			if (!data) {
				throw new Error('Login with 2FA failed');
			}
			if (!response.ok) {
				throw new Error(data.message, 'Login with 2FA failed');
			}

			setUser(data.user);
			setAccessToken(data.access);

			router.push('/');
		} catch (error) {
			console.error('CONTEXT LOGIN 2FA:', error);
			setError(error.message);
		}
	}

	// Logout user
	const logout = async () => {
		try {
			const response = await fetch(`/api/auth/logout`, {
				method: 'POST'
			});
			if (!response) {
				throw new Error('Logout failed');
			}

			const data = await response.json();
			if (!data) {
				throw new Error('Logout failed');
			}
			if (!response.ok) {
				throw new Error(data.message, 'Logout failed');
			}

			await router.push('/');

			setAccessToken(null);
			setUser(null);
		} catch (error) {
			console.error('CONTEXT LOGOUT:', error);
			setError(error.message);
		}
	}

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

			const response = await fetch(`/api/auth/register`, {
				method: 'POST',
				body: formData
			});
			if (!response) {
				throw new Error('Registration failed');
			}

			const data = await response.json();
			if (!data)
				throw new Error('Registration failed');
			if (!response.ok)
				throw new Error(data.message || 'Registration failed');

			await login({ username, password });
		} catch (error) {
			console.error('CONTEXT REGISTER:', error);
			setError(error.message);
		}
	}

	// Login refresh => Check if refresh token is in cookies and
	// refresh data fetches to backend if that's the case
	const isLoggedIn = async () => {
		try {
			const response = await fetch(`/api/auth/user`, {
				method: 'POST'
			});
			if (!response) {
				throw new Error('Login refresh failed');
			}

			const data = await response.json();
			if (!data)
				throw new Error('Login refresh failed');
			if (!response.ok)
				throw new Error(data.message || 'Login refresh failed');

			setUser(data.user);
			setAccessToken(data.access);
		} catch (error) {
			console.error('CONTEXT LOGIN REFRESH:', error);
			// We don't set user error here cause not being logged in is not an error
			router.push('/account/login');
		}
	}

	const clearError = () => {
		setError(null);
	}

	return (
		<AuthenticationContext.Provider value={{
			user,
			accessToken,
			error, setError, clearError,
			login, login2FA, logout, register
		}}>
			{children}
		</AuthenticationContext.Provider>
	);
}

export const useAuth = () => useContext(AuthenticationContext);
