import Toast from 'react-bootstrap/Toast';

const SuccessToast = ({ name, show, setShow, message }) => {
	const toggle = () => setShow(!show);

	return (
		<Toast show={show} onClose={toggle} bg="success">
			<Toast.Header>
				<strong className="me-auto">{name}</strong>
			</Toast.Header>
			<Toast.Body className="text-white">
				{message}
			</Toast.Body>
		</Toast>
	);
}

export default SuccessToast;