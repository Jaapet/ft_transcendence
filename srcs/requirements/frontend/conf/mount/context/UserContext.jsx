import { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthenticationContext';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
	const { user, isLoggedIn } = useAuth();
	const [userError, setUserError] = useState(null);
	const [userMsg, setUserMsg] = useState(null);

	// Edit profile
	const edit = async ({ username, email, password, avatar }) => {
		if (!user) {
			return ;
		}

		try {
			const formData = new FormData();
			formData.append('username', username);
			formData.append('email', email);
			formData.append('password', password);
			formData.append('avatar', avatar);

			const response = await fetch(`/api/current_user/edit`, {
				method: 'PUT',
				body: formData
			});
			if (!response) {
				throw new Error('Edit failed');
			}

			const data = await response.json();
			if (!data)
				throw new Error('Edit failed');
			if (!response.ok)
				throw new Error(data.message || 'Edit failed');

			setUserMsg(data.message || 'Edit failed');
			isLoggedIn();
		} catch (error) {
			//console.error('CONTEXT EDIT:', error);
			setUserError(error.message);
		}
	}

	// Enable 2FA
	const enable2FA = async () => {
		try {
			const response = await fetch(`/api/current_user/enable_2fa`, {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			});
			if (!response) {
				throw new Error('Enabling 2FA failed');
			}

			const data = await response.json();
			if (!data) {
				throw new Error('Enabling 2FA failed');
			}
			if (!response.ok) {
				throw new Error(data.message || 'Enabling 2FA failed');
			}

			setUserMsg(data.message || '2FA is now enabled');
			return data;
		} catch (error) {
			//console.error('CONTEXT ENABLE 2FA:', error);
			setUserError(error.message);
			return null;
		}
	}

	// Disable 2FA
	const disable2FA = async () => {
		try {
			const response = await fetch(`/api/current_user/disable_2fa`, {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			});
			if (!response) {
				throw new Error('Disabling 2FA failed');
			}

			const data = await response.json();
			if (!data) {
				throw new Error('Disabling 2FA failed');
			}
			if (!response.ok) {
				throw new Error(data.message || 'Disabling 2FA failed');
			}

			setUserMsg(data.message || '2FA is now disabled');
			return data;
		} catch (error) {
			//console.error('CONTEXT DISABLE 2FA:', error);
			setUserError(error.message);
			return null;
		}
	}

	const isFriends = async ({ target_id }) => {
		if (!user) {
			return ;
		}

		const user_id = user.id;
		try {
			const response = await fetch(`/api/users/friendship_status/?user_id=${user_id}&target_id=${target_id}`, {
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
			//console.error('CHECK FRIENDSHIP:', error);
			return null;
		}
};

	const addFriend = async ({ target_id }) => {
		if (!user) {
			return ;
		}

		try {
			const response = await fetch(`/api/current_user/add_friend`, {
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

			setUserMsg(data.message || 'Failed to send friend request');
		} catch (error) {
			//console.error('ADD FRIEND:', error);
			setUserError(error.message);
		}
	}

	const removeFriend = async ({ target_id }) => {
		if (!user) {
			return ;
		}

		try {
			const response = await fetch(`/api/current_user/remove_friend`, {
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

			setUserMsg(data.message || 'Failed to remove friend');
			return true;
		} catch (error) {
			//console.error('REMOVE FRIEND:', error);
			setUserError(error.message);
			return false;
		}
	}

	const acceptFriendRequest = async ({ request_id }) => {
		if (!user) {
			return ;
		}

		try {
			const response = await fetch(`/api/current_user/accept_friend_request`, {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ request_id })
			});
			if (!response) {
				throw new Error(`Failed to accept friend request`);
			}

			const data = await response.json();
			if (!data) {
				throw new Error(`Failed to accept friend request`);
			}
			if (!response.ok) {
				throw new Error(data.message || `Failed to accept friend request`);
			}

			setUserMsg(data.message || `Failed to accept friend request`);
			return true;
		} catch (error) {
			//console.error('ACCEPT FRIEND REQUEST:', error);
			setUserError(error.message);
			return false;
		}
	}

	const declineFriendRequest = async ({ request_id }) => {
		if (!user) {
			return ;
		}

		try {
			const response = await fetch(`/api/current_user/decline_friend_request`, {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ request_id })
			});
			if (!response) {
				throw new Error(`Failed to decline friend request`);
			}

			const data = await response.json();
			if (!data) {
				throw new Error(`Failed to decline friend request`);
			}
			if (!response.ok) {
				throw new Error(data.message || `Failed to decline friend request`);
			}

			setUserMsg(data.message || `Failed to decline friend request`);
			return true;
		} catch (error) {
			//console.error('DECLINE FRIEND REQUEST:', error);
			setUserError(error.message);
			return false;
		}
	}

	const deleteFriendRequest = async ({ request_id }) => {
		if (!user) {
			return ;
		}

		try {
			const response = await fetch(`/api/current_user/delete_friend_request`, {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ request_id })
			});
			if (!response) {
				throw new Error(`Failed to delete friend request`);
			}

			const data = await response.json();
			if (!data) {
				throw new Error(`Failed to delete friend request`);
			}
			if (!response.ok) {
				throw new Error(data.message || `Failed to delete friend request`);
			}

			setUserMsg(data.message || `Failed to delete friend request`);
			return true;
		} catch (error) {
			//console.error('DELETE FRIEND REQUEST:', error);
			setUserError(error.message);
			return false;
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
			edit, enable2FA, disable2FA,
			isFriends, addFriend, removeFriend,
			acceptFriendRequest, declineFriendRequest, deleteFriendRequest
		}}>
			{children}
		</UserContext.Provider>
	);
}

export const useUser = () => useContext(UserContext);
