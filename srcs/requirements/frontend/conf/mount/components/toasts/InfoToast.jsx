import Toast from 'react-bootstrap/Toast';

const InfoToast = ({ name, show, setShow, message, setMessage }) => {
	const toggle = () => {
		setShow(!show);
		setMessage('');
	}

	return (
		<Toast show={show} onClose={toggle} bg="secondary">
			<Toast.Header>
				<strong className="me-auto">{name}</strong>
			</Toast.Header>
			<Toast.Body className="text-white">
				{message}
			</Toast.Body>
		</Toast>
	);
}

export default InfoToast;