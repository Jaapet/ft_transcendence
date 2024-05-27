import ToastContainer from 'react-bootstrap/ToastContainer';

const ToastList = ({ children, position }) => {
	return (
		<ToastContainer className="p-3" position={position}>
			{children}
		</ToastContainer>
	);
}

export default ToastList;