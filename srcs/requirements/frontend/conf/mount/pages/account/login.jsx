import React from 'react';
import { useState, useContext } from 'react';
import AuthenticationContext from '../../context/AuthenticationContext';
import Link from 'next/link';

const LoginFormUsernameField = ({ username, setUsername }) => {
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
					required />
			</div>
		</div>
	);
}

const LoginFormPasswordField = ({ password, setPassword }) => {
	return (
		<div className="d-flex flex-row align-items-center mb-4">
			<i className="fas fa-lock fa-lg me-3 fa-fw"></i>
			<div data-mdb-input-init className="form-outline flex-fill mb-0">
				<label className="form-label" htmlFor="current-password">Password</label>
				<input
					type="password"
					id="current-password"
					autoComplete="current-password"
					className="form-control"
					onChange={e => setPassword(e.target.value)}
					value={password}
					required />
			</div>
		</div>
	);
}

const LoginFormFields = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	const {login} = useContext(AuthenticationContext);

	const submitHandler = async (event) => {
		event.preventDefault();
		login({username, password});
	}

	return (
		<form className="mx-1 mx-md-4" onSubmit={submitHandler}>

			<LoginFormUsernameField username={username} setUsername={setUsername} />
			<LoginFormPasswordField password={password} setPassword={setPassword} />

			<div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
				<button type="submit" data-mdb-button-init data-mdb-ripple-init className="btn btn-primary btn-lg">Login</button>
			</div>

		</form>
	);
}

const LoginForm = () => {
	return (
		<section className="vh-100" style={{backgroundColor: '#eee'}}>
			<div className="container h-100">
				<div className="row d-flex justify-content-center align-items-center h-100">
					<div className="col-lg-12 col-xl-11">
						<div className="card text-black" style={{borderRadius: '25px'}}>
							<div className="card-body p-md-5">
								<div className="row justify-content-center">
									<div className="col-md-10 col-lg-6 col-xl-5 order-2 order-lg-1">

										<p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4">Login</p>
										<LoginFormFields />
										<p className="text-center text-muted mt-5 mb-0">
											Don't have an account?&nbsp;
											<Link href="/account/register">
												<a className="fw-bold text-body"><u>Sign up here</u></a>
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

export default function LoginPage () {
	return (
		<div>
			<LoginForm/>
		</div>
	);
}