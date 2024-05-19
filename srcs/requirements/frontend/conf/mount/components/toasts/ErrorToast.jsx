import Toast from 'react-bootstrap/Toast';

const ErrorToast = ({ name, show, setShow, error, setError }) => {
	const toggle = () => {
		setShow(!show);
		setError(null);
	}

	return (
		<Toast show={show} onClose={toggle} bg="danger">
			<Toast.Header>
				<strong className="me-auto">{name}</strong>
			</Toast.Header>
			<Toast.Body className="text-white">
				{error}
			</Toast.Body>
		</Toast>
	);
}

export default ErrorToast;