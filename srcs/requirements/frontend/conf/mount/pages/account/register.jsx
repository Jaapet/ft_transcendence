import React from 'react';
import { useState, useContext } from 'react';
import AuthenticationContext from '../../context/AuthenticationContext';
import Link from 'next/link';

const SignupFormUsernameField = ({ username, setUsername }) => {
	return (
		<div className="d-flex flex-row align-items-center mb-4">
			<i className="fas fa-user fa-lg me-3 fa-fw"></i>
			<div data-mdb-input-init className="form-outline flex-fill mb-0">
				<label className="form-label" htmlFor="username">Username</label>
				<input
					type="text"
					id="username"
					autoComplete="username"
					className="form-control"
					onChange={e => setUsername(e.target.value)}
					value={username}
					required
				/>
			</div>
		</div>
	);
}

const SignupFormEmailField = ({ email, setEmail }) => {
	return (
		<div className="d-flex flex-row align-items-center mb-4">
			<i className="fas fa-envelope fa-lg me-3 fa-fw"></i>
			<div data-mdb-input-init className="form-outline flex-fill mb-0">
				<label className="form-label" htmlFor="email">Email</label>
				<input
					type="email"
					id="email"
					autoComplete="email"
					className="form-control"
					onChange={e => setEmail(e.target.value)}
					value={email}
					required
				/>
			</div>
		</div>
	);
}

const SignupFormPasswordField = ({ password, setPassword }) => {
	return (
		<div className="d-flex flex-row align-items-center mb-4">
			<i className="fas fa-lock fa-lg me-3 fa-fw"></i>
			<div data-mdb-input-init className="form-outline flex-fill mb-0">
				<label className="form-label" htmlFor="new-password">Password</label>
				<input
					type="password"
					id="new-password"
					autoComplete="new-password"
					className="form-control"
					onChange={e => setPassword(e.target.value)}
					value={password}
					required
				/>
			</div>
		</div>
	);
}

const SignupFormPasswordRepeatField = ({ password, setPassword }) => {
	return (
		<div className="d-flex flex-row align-items-center mb-4">
			<i className="fas fa-key fa-lg me-3 fa-fw"></i>
			<div data-mdb-input-init className="form-outline flex-fill mb-0">
				<label className="form-label" htmlFor="new-passwordR">Repeat password</label>
				<input
					type="password"
					id="new-passwordR"
					autoComplete="new-password"
					className="form-control"
					onChange={e => setPassword(e.target.value)}
					value={password}
					required
				/>
			</div>
		</div>
	);
}

const SignupFormAvatarField = ({ avatar, setAvatar }) => {
	return (
		<div className="d-flex flex-row align-items-center mb-4">
			<i className="fas fa-image fa-lg me-3 fa-fw"></i>
			<div data-mdb-input-init className="form-outline flex-fill mb-0">
				<label className="form-label" htmlFor="avatar">Avatar</label>
				<input
					type="file"
					id="avatar"
					className="form-control"
					onChange={e => setAvatar(e.target.files[0])}
				/>
				<p defaultValue={avatar}></p>
			</div>
		</div>
	);
}

const SignupFormFields = () => {
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [passwordR, setPasswordR] = useState('');
	const [avatar, setAvatar] = useState(null);

	const {register} = useContext(AuthenticationContext);

	const submitHandler = async (event) => {
		event.preventDefault();
		if (password !== passwordR) {
			console.error("Passwords do not match");
			return ;
		}
		register({ username, email, password, avatar });
	}

	return (
		<form className="mx-1 mx-md-4" onSubmit={submitHandler}>

			<SignupFormUsernameField username={username} setUsername={setUsername} />
			<SignupFormEmailField email={email} setEmail={setEmail} />
			<SignupFormPasswordField password={password} setPassword={setPassword} />
			<SignupFormPasswordRepeatField password={passwordR} setPassword={setPasswordR} />
			<SignupFormAvatarField avatar={avatar} setAvatar={setAvatar} />

			<div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
				<button type="submit" data-mdb-button-init data-mdb-ripple-init className="btn btn-primary btn-lg">Register</button>
			</div>

		</form>
	);
}

const SignupForm = () => {
	return (
		<section className="vh-100" style={{backgroundColor: '#eee'}}>
			<div className="container h-100">
				<div className="row d-flex justify-content-center align-items-center h-100">
					<div className="col-lg-12 col-xl-11">
						<div className="card text-black" style={{borderRadius: '25px'}}>
							<div className="card-body p-md-5">
								<div className="row justify-content-center">
									<div className="col-md-10 col-lg-6 col-xl-5 order-2 order-lg-1">

										<p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4">Sign up</p>
										<SignupFormFields/>
										<p className="text-center text-muted mt-5 mb-0">
											Already have an account?&nbsp;
											<Link href="/account/login">
												<a className="fw-bold text-body"><u>Log in here</u></a>
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

export default function SignupPage () {
	return (
		<div>
			<SignupForm/>
		</div>
	);
}
