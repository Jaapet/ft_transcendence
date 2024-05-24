import { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthenticationContext';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
	const { user } = useAuth();
	const [userError, setUserError] = useState(null);
	const [userMsg, setUserMsg] = useState(null);

	const addFriend = async ({ target_id }) => {
		if (!user) {
			return ;
		}

		try {
			const response = await fetch(`/api/add_friend`, {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
//					'Cookie': context.req.headers.cookie
				},
				body: JSON.stringify({ target_id })
			});
			if (!response) {
				throw new Error('Failed to send friend request');
			}
	
			const data = await response.json();
			if (!data) {
				throw new Error('Failed to send friend request');
			}
			if (!response.ok) {
				throw new Error(data.message, 'Failed to send friend request');
			}

			setUserMsg(data.message);
		} catch (error) {
			console.error('ADD FRIEND:', error);
			setUserError(error.message);
		}
	}

	const clearUserError = () => {
		setUserError(null);
	}

	const clearUserMsg = () => {
		setUserMsg(null);
	}

	return (
		<UserContext.Provider value={{
			userError, setUserError, clearUserError,
			userMsg, setUserMsg, clearUserMsg,
			addFriend
		}}>
			{children}
		</UserContext.Provider>
	);
}

export const useUser = () => useContext(UserContext);
