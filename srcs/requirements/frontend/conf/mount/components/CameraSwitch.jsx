import Form from 'react-bootstrap/Form';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import { useGame } from '../context/GameContext';

function CameraSwitch() {
	const { cameraMode, setCameraMode, setPerformanceMode } = useGame();

	const tooltip = (
		<Tooltip
			id='camera-switch-tooltip'
			style={{
				position: 'fixed',
				zIndex: 1000,
				pointerEvents: 'none'
			}}
		>
			Activating the Free Camera might slow the game down.<br/>It can also distract you from playing.
		</Tooltip>
	);

	return (
		<OverlayTrigger
			placement="right"
			overlay={tooltip}
		>
			<Form style={{
				backgroundColor: 'rgba(0, 0, 0, 0.5)',
				padding: '5px',
				borderRadius: '10px',
				color: 'white',
				marginTop: '2vh',
				userSelect: 'none'
			}}>
				<Form.Check
					type="switch"
					id="camera-switch"
					label="Free Camera"
					checked={cameraMode}
					onChange={(e) => {
						setCameraMode(e.target.checked);
						if (e.target.checked)
							setPerformanceMode(false);
					}}
				/>
			</Form>
		</OverlayTrigger>
	);
}

export default CameraSwitch;