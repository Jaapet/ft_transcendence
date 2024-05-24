import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthenticationContext';
import { useUser } from '../context/UserContext';

const AddFriendButton = ({ target_id, setShowError, setErrorMsg, setMsg, setShowMsg }) => {
	const { addFriend, userError, clearUserError, userMsg, clearUserMsg } = useUser();

	useEffect(() => {
		if (userError) {
			console.error(userError);
			setErrorMsg(userError);
			setShowError(true);
			clearUserError();
		}
		if (userMsg) {
			console.log(userMsg);
			setMsg(userMsg);
			setShowMsg(true);
			clearUserMsg();
		}
	}, [userError, userMsg]);

	const handleClick = async (event) => {
		event.preventDefault();
		addFriend({target_id});
	}

	return (
		<button type="button" className="btn btn-primary" style={{fontSize: '25px'}} onClick={handleClick}>
			Add as friend
		</button>
	);
}

const FriendButton = ({ target_id }) => {
	const [showError, setShowError] = useState(false);
	const [errorMsg, setErrorMsg] = useState('');
	const [showMsg, setShowMsg] = useState(false);
	const [msg, setMsg] = useState('');

	const { user } = useAuth();

	if (!user || !user.id || !target_id || user.id === target_id) {
		return ;
	}

	//	TODO: Check if already friends, and propose removing from friends list instead
	//	return (<ProfileMemberCardFriendRemove user={user} target_user={target_user} />);

	//	TODO: Check if request already exists (no matter which way)
	//	return (<ProfileMemberCardFriendRemove user={user} target_user={target_user} />);

		return (
			<AddFriendButton
				target_id={target_id}
				setShowError={setShowError} setErrorMsg={setErrorMsg}
				setMsg={setMsg} setShowMsg={setShowMsg}
			/>
		);
}

export default FriendButton;