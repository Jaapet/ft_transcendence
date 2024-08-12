import React from 'react';
import Image from 'next/image';
import { Button } from 'react-bootstrap';
import styles from '../../../styles/base.module.css';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useUser } from '../../../context/UserContext';
import { useAuth } from '../../../context/AuthenticationContext';
import Link from 'next/link';
import ToastList from '../../../components/toasts/ToastList';
import ErrorToast from '../../../components/toasts/ErrorToast';
import SuccessToast from '../../../components/toasts/SuccessToast';

const Enable2FAButton =
({
	target_user,
	setShowError, setErrorMsg,
	setShowMsg, setMsg,
	secretKey, setSecretKey,
	qrUrl, setQrUrl
}) => {
	const { user } = useAuth();
	const { enable2FA } = useUser();
	const [hasErr, setHasErr] = useState(false);

	if (!user || !target_user || !user.id || !target_user.id || user.id !== target_user.id) {
		return ;
	}

	const handleClick = async (event) => {
		event.preventDefault();
		const data = await enable2FA();
		if (data) {
			setSecretKey(data.secret_key);
			setQrUrl('https://backend:8000' + data.qr_code_url);
		}
	}

	if (secretKey !== '' && qrUrl !== '') {
		return (
			<>
			{hasErr ?
				<>
					<p style={{ fontSize: '20px' }}>
						Open an authenticator app (like <i>Google Authenticator</i>) and enter your secret key manually<br/>
						as well as your username and the key type "Based on time".
					</p>
					<p style={{ fontSize: '25px' }}>{`Your secret Key is `}<b>{`${secretKey}`}</b></p>
				</>
			:
				<>
					<p style={{ fontSize: '20px' }}>
						Open an authenticator app (like Google Authenticator) and scan this QR code.
					</p>
					<Image
						src={qrUrl}
						alt={`2FA QR Code`}
						width={200}
						height={200}
						style={{ width: '200px', height: '200px' , objectFit: 'cover', display: 'block', margin: '0 auto', marginTop: '15px'}}
						priority={true}
						onError={() => setHasErr(true)}
					/>
				</>
			}
			</>
		);
	}

	return (
		<div className={`card ${styles.customCard}`} style={{marginTop: '10px'}}>
			<Button
				type="button"
				variant="danger"
				style={{fontSize: '25px'}}
				onClick={handleClick}
			>
				<strong>Enable 2FA</strong>
			</Button>
		</div>
	);
}

const Disable2FAButton =
({
	target_user,
	setShowError, setErrorMsg,
	setShowMsg, setMsg,
	secretKey, setSecretKey,
	qrUrl, setQrUrl
}) => {
	const { user } = useAuth();
	const { disable2FA } = useUser();

	if (!user || !target_user || !user.id || !target_user.id || user.id !== target_user.id) {
		return ;
	}

	const handleClick = async (event) => {
		event.preventDefault();
		const data = await disable2FA();
		if (data) {
			setSecretKey('');
			setQrUrl('');
		}
	}

	if (secretKey !== '' && qrUrl !== '') {
		return (
			<div className={`card ${styles.customCard}`} style={{marginTop: '10px'}}>
				<Button
					type="button"
					variant="danger"
					style={{fontSize: '25px'}}
					onClick={handleClick}
				>
					<strong>Disable 2FA</strong>
				</Button>
			</div>
		);
	}
}

const Edit2FAFields = ({ target_user, setShowError, setErrorMsg, setShowMsg, setMsg }) => {
	const [secretKey, setSecretKey] = useState('');
	const [qrUrl, setQrUrl] = useState('');

	return (
			<div className="d-flex justify-content-center flex-column mx-4 mb-2 mb-lg-2">
				<Enable2FAButton
					target_user={target_user}
					setShowError={setShowError}
					setErrorMsg={setErrorMsg}
					setShowMsg={setShowMsg}
					setMsg={setMsg}
					secretKey={secretKey}
					setSecretKey={setSecretKey}
					qrUrl={qrUrl}
					setQrUrl={setQrUrl}
				/>
				<Disable2FAButton
					target_user={target_user}
					setShowError={setShowError}
					setErrorMsg={setErrorMsg}
					setShowMsg={setShowMsg}
					setMsg={setMsg}
					secretKey={secretKey}
					setSecretKey={setSecretKey}
					qrUrl={qrUrl}
					setQrUrl={setQrUrl}
				/>
			</div>
	);
}

const Edit2FAToasts = ({ showError, setShowError, errorMsg, setErrorMsg, showMsg, setShowMsg, msg, setMsg }) => {
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

export default function Edit2FAPage({ status, detail, current_user }) {
	const { user, logout } = useAuth();
	const {
		userError, setUserError, clearUserError,
		userMsg, clearUserMsg
	} = useUser();

	const [showError, setShowError] = useState(false);
	const [errorMsg, setErrorMsg] = useState('');
	const [showMsg, setShowMsg] = useState(false);
	const [msg, setMsg] = useState('');

	const handleLogout = async () => {
		await logout();
	}

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

	return (
		<div className={styles.container}>

		<section className={styles.backCard} style={{top: '5vh', paddingTop: '100px', paddingBottom: '100px', paddingRight: '140px'}}>
			<Head>
				<title>Edit 2FA Settings</title>
			</Head>
			<Edit2FAToasts
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
						<div className={styles.customCard} style={{minWidth: '60vw'}}>
							<div className="row justify-content-center">
								<div className="col-md-10 col-lg-6 col-xl-11 order-2 order-lg-1">

									<p className="text-center h1 fw-bold mb-1 mx-1 mx-md-4 mt-5">2FA settings</p>
									<Edit2FAFields
										target_user={current_user}
										setShowError={setShowError}
										setErrorMsg={setErrorMsg}
										setShowMsg={setShowMsg}
										setMsg={setMsg}
									/>

									<p className="text-center text-muted mt-0 mb-0" >
										<Link href={`/users/${user.id}/edit`} className={styles.cardInfo}>
											<u>To profile edit page</u>
										</Link>
									</p>
									<p className="text-center text-muted mt-0 mb-0" >
										<Link href={`/users/${user.id}`}className={styles.cardInfo}>
											<u>Back to profile</u>
										</Link>
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
		</div>

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
		console.error('USER EDIT 2FA:', error);
		return {
			props: {
				status: 401,
				detail: error.message,
				current_user: null
			}
		}
	}
}
