import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthenticationContext';
import { useUser } from '../context/UserContext';

const RemoveFriendButton = ({ target_id, setShowError, setErrorMsg, setShowMsg, setMsg }) => {
	const { removeFriend, userError, clearUserError, userMsg, clearUserMsg } = useUser();

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
		removeFriend({target_id});
	}

	// TODO: Make this a bootstrap button!
	return (
		<button
			type="button"
			className="btn btn-danger"
			style={{fontSize: '25px', textAlign: 'center', minWidth: '200px'}}
			onClick={handleClick}
		>
			Remove friend
		</button>
	);
}

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

	const { isFriends } = useUser();
	const [show, setShow] = useState(true);
	const [isFriend, setIsFriend] = useState(null);

	useEffect(() => {
		const checkFriendship = async () => {
			const status = await isFriends({ target_id });
			if (status === null) {
				setShow(false);
			}
			else {
				setIsFriend(status.message);
				setShow(true);
			}
		}

		checkFriendship();
	}, [user, target_id, isFriends]);

	if (show === false || isFriend === null) {
		return ;
	}

	if (isFriend === true) {
		return (
			<RemoveFriendButton
				target_id={target_id}
				setShowError={setShowError} setErrorMsg={setErrorMsg}
				setShowMsg={setShowMsg} setMsg={setMsg}
			/>
		);
	}

	return (
		<AddFriendButton
			target_id={target_id}
			setShowError={setShowError} setErrorMsg={setErrorMsg}
			setShowMsg={setShowMsg} setMsg={setMsg}
		/>
	);
}

export default FriendButton;