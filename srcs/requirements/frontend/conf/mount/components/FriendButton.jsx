import { useEffect } from 'react';
import { useAuth } from '../context/AuthenticationContext';
import { useUser } from '../context/UserContext';

const AddFriendButton = ({ target_id, setShowError, setErrorMsg, setShowMsg, setMsg }) => {
	const { addFriend, userError, clearUserError, userMsg, clearUserMsg } = useUser();

	useEffect(() => {
		if (userError) {
			setErrorMsg(userError);
			setShowError(true);
			clearUserError();
		}
		if (userMsg) {
			setMsg(userMsg);
			setShowMsg(true);
			clearUserMsg();
		}
	}, [userError, userMsg, setErrorMsg, setShowError, setMsg, setShowMsg, clearUserError, clearUserMsg]);

	const handleClick = async (event) => {
		event.preventDefault();
		addFriend({target_id});
	}

	// TODO: Make this a bootstrap button!
	return (
		<button
			type="button"
			className="btn btn-primary"
			style={{fontSize: '25px'}}
			onClick={handleClick}
		>
			Add as friend
		</button>
	);
}

/*
Use these in order to display error and info toasts
	const [showError, setShowError] = useState(false);
	const [errorMsg, setErrorMsg] = useState('');
	const [showMsg, setShowMsg] = useState(false);
	const [msg, setMsg] = useState('');
*/
const FriendButton = ({ target_id, setShowError, setErrorMsg, setShowMsg, setMsg }) => {
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
			setShowMsg={setShowMsg} setMsg={setMsg}
		/>
	);
}

export default FriendButton;