import React from 'react';
import styles from '../../../styles/base.module.css';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useUser } from '../../../context/UserContext';
import { useAuth } from '../../../context/AuthenticationContext';
import Link from 'next/link';
import ToastList from '../../../components/toasts/ToastList';
import ErrorToast from '../../../components/toasts/ErrorToast';
import SuccessToast from '../../../components/toasts/SuccessToast';


const EditFormUsernameField = ({ username, setUsername }) => {
	return (
		<div className="d-flex flex-row align-items-center mb-4">
			<i className="fas fa-user fa-lg me-3 fa-fw"></i>
			<div data-mdb-input-init className="form-outline flex-fill mb-0">
				<label className="form-label" htmlFor="username">New username</label>
				<input
					type="text"
					id="username"
					autoComplete="username"
					className="form-control"
					onChange={e => setUsername(e.target.value)}
					value={username}
					style={{
						backgroundColor: '#909099',
						color: '#000000',
						border: '1px solid #666686',
						borderRadius: '5px',
						padding: '10px'
					}}
				/>
			</div>
		</div>
	);
}

const EditFormEmailField = ({ email, setEmail }) => {
	return (
		<div className="d-flex flex-row align-items-center mb-4">
			<i className="fas fa-envelope fa-lg me-3 fa-fw"></i>
			<div data-mdb-input-init className="form-outline flex-fill mb-0">
				<label className="form-label" htmlFor="email">New email</label>
				<input
					type="email"
					id="email"
					autoComplete="email"
					className="form-control"
					onChange={e => setEmail(e.target.value)}
					value={email}
					style={{
						backgroundColor: '#909099',
						color: '#000000',
						border: '1px solid #666686',
						borderRadius: '5px',
						padding: '10px'
					}}
				/>
			</div>
		</div>
	);
}

const EditFormPasswordField = ({ password, setPassword }) => {
	return (
		<div className="d-flex flex-row align-items-center mb-4">
			<i className="fas fa-lock fa-lg me-3 fa-fw"></i>
			<div data-mdb-input-init className="form-outline flex-fill mb-0">
				<label className="form-label" htmlFor="new-password">New password</label>
				<input
					type="password"
					id="new-password"
					autoComplete="new-password"
					className="form-control"
					onChange={e => setPassword(e.target.value)}
					value={password}
					style={{
						backgroundColor: '#909099',
						color: '#000000',
						border: '1px solid #666686',
						borderRadius: '5px',
						padding: '10px'
					}}
				/>
			</div>
		</div>
	);
}

const EditFormPasswordRepeatField = ({ password, setPassword }) => {
	return (
		<div className="d-flex flex-row align-items-center mb-4">
			<i className="fas fa-key fa-lg me-3 fa-fw"></i>
			<div data-mdb-input-init className="form-outline flex-fill mb-0">
				<label className="form-label" htmlFor="new-passwordR">Repeat new password</label>
				<input
					type="password"
					id="new-passwordR"
					autoComplete="new-password"
					className="form-control"
					onChange={e => setPassword(e.target.value)}
					value={password}
					style={{
						backgroundColor: '#909099',
						color: '#000000',
						border: '1px solid #666686',
						borderRadius: '5px',
						padding: '10px'
					}}
				/>
			</div>
		</div>
	);
}

const EditFormAvatarField = ({ avatar, setAvatar, setUserError }) => {
	const megabytes = 10; // 10MB
	const maxFileSize = megabytes * 1024 * 1024;

	const handleFileUpload = (e) => {
		const file = e.target.files[0];
		if (file && file.size > maxFileSize) {
			setUserError(`File size must be under ${megabytes} MB`);
			e.target.value = null;
			setAvatar(null);
		} else {
			setAvatar(file);
		}
	}

	return (
		<div className="d-flex flex-row align-items-center mb-4">
			<i className="fas fa-image fa-lg me-3 fa-fw"></i>
			<div data-mdb-input-init className="form-outline flex-fill mb-0">
				<label className="form-label" htmlFor="avatar">New avatar <small>(under 10MB, jpeg, png or bmp)</small></label>
				<input
					type="file"
					id="avatar"
					className="form-control"
					onChange={handleFileUpload}
				/>
				<p defaultValue={avatar}></p>
			</div>
		</div>
	);
}

const EditFormFields = ({
	username, setUsername,
	email, setEmail,
	password, setPassword,
	passwordR, setPasswordR,
	avatar, setAvatar,
	submitHandler,
	setUserError
	
}) => {
	return (
		<form className="mx-1 mx-md-4" onSubmit={submitHandler}>

			<EditFormUsernameField username={username} setUsername={setUsername} />
			<EditFormEmailField email={email} setEmail={setEmail} />
			<EditFormPasswordField password={password} setPassword={setPassword} />
			<EditFormPasswordRepeatField password={passwordR} setPassword={setPasswordR} />
			<EditFormAvatarField avatar={avatar} setAvatar={setAvatar} setUserError={setUserError} />

			<div className="d-flex justify-content-center mx-4 mb-2 mb-lg-2">
				<button type="submit" data-mdb-button-init data-mdb-ripple-init className="btn btn-primary btn-lg">Edit</button>
			</div>

		</form>
	);
}

const EditToasts = ({ showError, setShowError, errorMsg, setErrorMsg, showMsg, setShowMsg, msg, setMsg }) => {
	return (
		<ToastList position="top-left">
			<ErrorToast
				name="Edit failed"
				show={showError}
				setShow={setShowError}
				errorMessage={errorMsg}
				setErrorMessage={setErrorMsg}
			/>
			<SuccessToast
				name="Success"
				show={showMsg}
				setShow={setShowMsg}
				message={msg}
				setMessage={setMsg}
			/>
		</ToastList>
	);
}

export default function EditPage({ status, detail, current_user }) {
	const { user, logout } = useAuth();
	const { edit, userError, setUserError, clearUserError, userMsg, clearUserMsg } = useUser();

	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [passwordR, setPasswordR] = useState('');
	const [avatar, setAvatar] = useState(null);
	const [showError, setShowError] = useState(false);
	const [errorMsg, setErrorMsg] = useState('');
	const [showMsg, setShowMsg] = useState(false);
	const [msg, setMsg] = useState('');

	const handleLogout = async () => {
		await logout();
	}

	useEffect(() => {
		if (user)
			setUsername(user.username);
	}, [user]);

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

	if (errorMsg === 'Not logged in' || (status === 401 && detail === 'Not logged in')) {
		handleLogout();
	}

	if (status !== 200 || !current_user || !current_user.id || !user || !user.id) {
		return (
			<div className={styles.container}>
				<p className="bg-light text-black">Something went wrong...</p>
				<p className="bg-light text-black">Please reload the page.</p>
			</div>
		);
	}

	if (current_user.id !== user.id) {
		return (
			<div>
				<p className="bg-light text-black">Forbidden</p>
			</div>
		);
	}

	const submitHandler = async (event) => {
		event.preventDefault();
		if (password !== passwordR) {
			setUserError("Passwords do not match");
			return ;
		}
		if (username === '' && email === '' && password === '' && passwordR === '' && avatar === null) {
			setUserError("No change detected");
			return ;
		}
		edit({ username, email, password, avatar });
	}

	return (
		<section className="vh-100" style={{backgroundColor: '#38255f'}}>
			<Head>
				<title>Edit profile</title>
			</Head>
			<EditToasts
				showError={showError}
				setShowError={setShowError}
				errorMsg={errorMsg}
				setErrorMsg={setErrorMsg}
				showMsg={showMsg}
				setShowMsg={setShowMsg}
				msg={msg}
				setMsg={setMsg}
			/>
			<div className="container h-100">
				<div className="row d-flex justify-content-center align-items-center h-100">
					<div className="col-lg-12 col-xl-11">
						<div className="card text-black" style={{borderRadius: '25px', backgroundColor: '#506080'}}>
							<div className="card-body p-md-5">
								<div className="row justify-content-center">
									<div className="col-md-10 col-lg-6 col-xl-5 order-2 order-lg-1">

										<p className="text-center h1 fw-bold mb-1 mx-1 mx-md-4 mt-5">Edit your profile</p>
										<p className="text-center fw-bold mb-3 mx-1 mx-md-4 mt-2">You can leave fields blank if you don't want to edit them</p>
										<EditFormFields 
											username={username} setUsername={setUsername}
											email={email} setEmail={setEmail}
											password={password} setPassword={setPassword}
											passwordR={passwordR} setPasswordR={setPasswordR}
											avatar={avatar} setAvatar={setAvatar}
											submitHandler={submitHandler}
											setUserError={setUserError}
										/>

										<p className="text-center text-muted mt-0 mb-0" >
											<Link href={`/users/${user.id}/edit_2fa`} className="fw-bold text-body">
												<u>To 2FA settings page</u>
											</Link>
										</p>
										<p className="text-center text-muted mt-0 mb-0" >
											<Link href={`/users/${user.id}`} className="fw-bold text-body">
												<u>Back to profile</u>
											</Link>
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

export async function getServerSideProps(context) {
	const { id } = context.params;

	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/current_user/user_info`, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Cookie': context.req.headers.cookie
			},
			body: JSON.stringify({ id })
		});
		if (!response) {
			throw new Error('User info fetch failed');
		}
		if (response.status === 404) {
			return {
				props: {
					status: 404,
					detail: 'Resource not found',
					current_user: null
				}
			}
		}

		const data = await response.json();
		if (!data) {
			throw new Error('User info fetch failed');
		}
		if (!response.ok) {
			throw new Error(data.message, 'User info fetch failed');
		}

		return {
			props: {
				status: 200,
				detail: 'Success',
				current_user: data.user
			}
		}
	} catch (error) {
		console.error('USER EDIT:', error);
		return {
			props: {
				status: 401,
				detail: error.message,
				current_user: null
			}
		}
	}
}
