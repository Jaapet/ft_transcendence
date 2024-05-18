import Toast from 'react-bootstrap/Toast';

const InfoToast = ({ show, setShow, message }) => {
	const toggle = () => setShow(!show);

	return (
		<Toast show={show} onClose={toggle} bg="secondary">
			<Toast.Header>
				<strong className="me-auto">Info</strong>
			</Toast.Header>
			<Toast.Body className="text-white">
				{message}
			</Toast.Body>
		</Toast>
	);
}

export default InfoToast;