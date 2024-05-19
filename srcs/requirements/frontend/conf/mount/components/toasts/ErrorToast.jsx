import Toast from 'react-bootstrap/Toast';

const ErrorToast = ({ name, show, setShow, errorMessage }) => {
	const toggle = () => {
		setShow(!show);
	}

	return (
		<Toast show={show} onClose={toggle} bg="danger">
			<Toast.Header>
				<strong className="me-auto">{name}</strong>
			</Toast.Header>
			<Toast.Body className="text-white">
				{errorMessage}
			</Toast.Body>
		</Toast>
	);
}

export default ErrorToast;