import Toast from 'react-bootstrap/Toast';

const SuccessToast = ({ show, setShow, message }) => {
	const toggle = () => setShow(!show);

	return (
		<Toast show={show} onClose={toggle} bg="success">
			<Toast.Header>
				<strong className="me-auto">Success</strong>
			</Toast.Header>
			<Toast.Body className="text-white">
				{message}
			</Toast.Body>
		</Toast>
	);
}

export default SuccessToast;