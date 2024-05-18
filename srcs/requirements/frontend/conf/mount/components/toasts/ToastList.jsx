import ToastContainer from 'react-bootstrap/ToastContainer';

const ToastList = ({ children }) => {
	return (
		<ToastContainer className="p-3" position="top-left">
			{children}
		</ToastContainer>
	);
}

export default ToastList;