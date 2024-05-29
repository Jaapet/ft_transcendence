import { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthenticationContext';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
	const { user } = useAuth();
	const [userError, setUserError] = useState(null);
	const [userMsg, setUserMsg] = useState(null);

	const isFriends = async ({ target_id }) => {
		if (!user) {
			return ;
		}

		const user_id = user.id;
		try {
			const response = await fetch(`/api/friendship_status/?user_id=${user_id}&target_id=${target_id}`, {
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			});
			if (!response) {
				throw new Error('Failed to fetch friendship status');
			}

			const data = await response.json();
			if (!data) {
				throw new Error('Failed to fetch friendship status');
			}
			if (!response.ok) {
				throw new Error(data.message || 'Failed to fetch friendship status');
			}

			return data;
		} catch (error) {
			console.error('CHECK FRIENDSHIP:', error);
			return null;
		}
};

	const addFriend = async ({ target_id }) => {
		if (!user) {
			return ;
		}

		try {
			const response = await fetch(`/api/add_friend`, {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
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
				throw new Error(data.message || 'Failed to send friend request');
			}

			setUserMsg(data.message);
		} catch (error) {
			console.error('ADD FRIEND:', error);
			setUserError(error.message);
		}
	}

	const removeFriend = async ({ target_id }) => {
		if (!user) {
			return ;
		}

		try {
			const response = await fetch(`/api/remove_friend`, {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ target_id })
			});
			if (!response) {
				throw new Error('Failed to remove friend');
			}
	
			const data = await response.json();
			if (!data) {
				throw new Error('Failed to remove friend');
			}
			if (!response.ok) {
				throw new Error(data.message || 'Failed to remove friend');
			}

			setUserMsg(data.message);
		} catch (error) {
			console.error('REMOVE FRIEND:', error);
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
			isFriends, addFriend, removeFriend
		}}>
			{children}
		</UserContext.Provider>
	);
}

export const useUser = () => useContext(UserContext);
