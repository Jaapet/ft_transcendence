import Toast from 'react-bootstrap/Toast';

const ErrorToast = ({ show, setShow, message }) => {
	const toggle = () => setShow(!show);

	return (
		<Toast show={show} onClose={toggle} bg="danger">
			<Toast.Header>
				<strong className="me-auto">Error</strong>
			</Toast.Header>
			<Toast.Body className="text-white">
				{message}
			</Toast.Body>
		</Toast>
	);
}

export default ErrorToast;