import { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const AuthenticationContext = createContext();

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
			const response = await fetch(`/api/login`, {
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

			setUser(data.user);
			setAccessToken(data.access);

			router.push('/');
		} catch (error) {
			console.error('CONTEXT LOGIN:', error);
			setError(error.message);
		}
	}

	// Logout user
	const logout = async () => {
		try {
			const response = await fetch(`/api/logout`, {
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

			const response = await fetch(`/api/register`, {
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
			const response = await fetch(`/api/user`, {
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
			// We don't set user error here cause it's fine if you're not logged in
		}
	}

	const clearError = () => {
		setError(null);
	}

	return (
		<AuthenticationContext.Provider value={{ user, accessToken, error, setError, clearError, login, logout, register }}>
			{children}
		</AuthenticationContext.Provider>
	);
}

export default AuthenticationContext;
