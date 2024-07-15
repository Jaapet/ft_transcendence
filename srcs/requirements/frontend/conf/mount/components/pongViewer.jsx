import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import io from 'socket.io-client';
import WaitList from './WaitList';
import styles from '../styles/game.module.css';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { useAuth } from '../context/AuthenticationContext';
import { useGame } from '../context/GameContext';
import { useRouter } from 'next/router';

const PongViewer = ({ scoreL, setScoreL, scoreR, setScoreR }) => {
	const router = useRouter();
	const { user } = useAuth();
	const {
		inQueue,
		inGame,
		gameStarted,
		gameEnded,
		gameType,
		room,
		players,
		setGameStarted,
		setGameEnded,
		updateRoom,
		updatePlayers,
		resetAll
	} = useGame();
	const canvasRef = useRef(null);

	useEffect(() => {
		if (!user || !gameType || gameType !== 'pong2' || !setGameStarted || !updateRoom || !updatePlayers || !resetAll)
			return ;

		const socket = io(`https://${process.env.NEXT_PUBLIC_FQDN}:${process.env.NEXT_PUBLIC_WEBSOCKET_PORT}`);

		// TODO : 
		socket.emit('join', { gameType: 'pong2', roomid: roomid});
		
		// Gérer les événements de connexion et d'erreur
		socket.on('connect', () => {
			console.log('Connected to websocket server');
		});
		socket.on('connect_error', (error) => {
			console.error('Connection error for websocket server:', error);
		});
		socket.on('disconnect', () => {
			console.log('Disconnected from websocket server');
		});

		socket.on('updateRoom', ({ room, players }) => {
			updateRoom(room, players);
		});

		socket.on('updatePlayers', ({ players }) => {
			updatePlayers(players);
		});



		/// SCENE
		let scene = new THREE.Scene();
		scene.background = new THREE.Color(0x111111);

		const canvas = canvasRef.current;

		/// RENDERER
		const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

		/// CANVAS

		/// CAMERA SETTINGS
		const fov = 42;
		const aspect = 1.5;
		const near = 0.1;
		const far = 100000;

		/// TEXTURE SKYBOX AND SPHERE
		const loader = new THREE.TextureLoader();
		const texture = loader.load('games/pong/texture/test.jpg');
		texture.colorSpace = THREE.SRGBColorSpace;
		const texturesphere = loader.load('games/pong/texture/eye2.jpg');
		texture.colorSpace = THREE.SRGBColorSpace;

		/// CAMERA
		let camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
		camera.position.set(0, 100, 10);
		camera.position.z = 10;

		/// MODEL 3D
		const totalmodel = 0;
		let actualmodel = 0;
		let modelsLoaded = false;

		// Fonction pour vérifier si tous les modèles sont chargés
		function checkModelsLoaded()
		{
			if (actualmodel === totalmodel)
				modelsLoaded = true;
		}
		checkModelsLoaded();


		const loadermodel = new GLTFLoader();

		loadermodel.load(
			'games/pong/models/Building.glb',
			function (gltf)
			{ 
				gltf.scene.position.z = -45;
				gltf.scene.position.x = -2;
				gltf.scene.position.y = 0.5;
				gltf.scene.scale.set(0.339, 0.25, 0.25);
				scene.add( gltf.scene );
				actualmodel += 1;
				checkModelsLoaded(); // Vérifier si tous les modèles sont chargés
			},
			undefined,
			function (error) { console.error(error); } 
		);

		loadermodel.load(
			'games/pong/models/city.glb',
			function (gltf)
			{ 
				gltf.scene.position.z = 490;
				gltf.scene.position.x = 1330;
				gltf.scene.position.y = -1063;
				gltf.scene.rotation.y = 2.17;
				gltf.scene.scale.set(100, 100, 100);
				scene.add( gltf.scene );
				actualmodel++;
				checkModelsLoaded(); // Vérifier si tous les modèles sont chargés
			},
			undefined,
			function (error) { console.error(error); } 
		);

		loadermodel.load(
			'games/pong/models/Parrot.glb',
			function (gltf)
			{ 
				gltf.scene.position.z = -52;
				gltf.scene.position.x = -20;
				gltf.scene.position.y = 3;
				gltf.scene.rotation.y = 1.5;
				gltf.scene.scale.set(0.1, 0.1, 0.1);
				scene.add( gltf.scene );
				actualmodel++;
				checkModelsLoaded(); // Vérifier si tous les modèles sont chargés
			},
			undefined,
			function (error) { console.error(error); } 
		);

		loadermodel.load(
			'games/pong/models/palm/palmtree.gltf',
			function (gltf)
			{ 
				gltf.scene.position.z = 26.5;
				gltf.scene.position.x = 48.5;
				gltf.scene.position.y = 1;
				gltf.scene.rotation.y = 1;
				gltf.scene.scale.set(5, 5, 5);
				scene.add(gltf.scene);
				actualmodel++;
				checkModelsLoaded(); // Vérifier si tous les modèles sont chargés
			},
			undefined,
			function (error) { console.error(error); } 
		);

		loadermodel.load(
			'games/pong/models/palm/palmtree.gltf',
			function (gltf)
			{ 
				gltf.scene.position.z = 26.5;
				gltf.scene.position.x = -48.5;
				gltf.scene.position.y = 1;
				gltf.scene.rotation.y = -1;
				gltf.scene.scale.set(5, 5, 5);
				scene.add(gltf.scene);
				actualmodel++;
				checkModelsLoaded(); // Vérifier si tous les modèles sont chargés
			},
			undefined,
			function (error) { console.error(error); } 
		);

		loadermodel.load(
			'games/pong/models/bush/scene.gltf',
			function (gltf)
			{ 
				gltf.scene.position.z = 27;
				gltf.scene.position.x = -49;
				gltf.scene.position.y = -2;
				gltf.scene.rotation.y = -1;
				gltf.scene.scale.set(0.05, 0.05, 0.05);
				scene.add(gltf.scene);
				actualmodel++;
				checkModelsLoaded(); // Vérifier si tous les modèles sont chargés
			},
			undefined,
			function (error) { console.error(error); } 
		);

		loadermodel.load(
			'games/pong/models/bush/scene.gltf',
			function (gltf)
			{ 
				gltf.scene.position.z = 27;
				gltf.scene.position.x = 49;
				gltf.scene.position.y = -2;
				gltf.scene.rotation.y = -1;
				gltf.scene.scale.set(0.05, 0.05, 0.05);
				scene.add(gltf.scene);
				actualmodel++;
				checkModelsLoaded(); // Vérifier si tous les modèles sont chargés
			},
			undefined,
			function (error) { console.error(error); } 
		);

		loadermodel.load(
			'games/pong/models/palm2/scene.gltf',
			function (gltf)
			{ 
				gltf.scene.position.z = -71;
				gltf.scene.position.x = -50;
				gltf.scene.position.y = 1;
				gltf.scene.rotation.y = -1.4;
				gltf.scene.scale.set(9, 9, 9);
				scene.add(gltf.scene);
				actualmodel++;
				checkModelsLoaded(); // Vérifier si tous les modèles sont chargés
			},
			undefined,
			function (error) { console.error(error); } 
		);

		loadermodel.load(
			'games/pong/models/bush/scene.gltf',
			function (gltf)
			{ 
				gltf.scene.position.z = -71;
				gltf.scene.position.x = -50;
				gltf.scene.position.y = -2;
				gltf.scene.rotation.y = -1;
				gltf.scene.scale.set(0.05, 0.05, 0.05);
				scene.add(gltf.scene);
				actualmodel++;
				checkModelsLoaded(); // Vérifier si tous les modèles sont chargés
			},
			undefined,
			function (error) { console.error(error); } 
		);

		loadermodel.load(
			'games/pong/models/palm2/scene.gltf',
			function (gltf)
			{ 
				gltf.scene.position.z = -71;
				gltf.scene.position.x = 50;
				gltf.scene.position.y = 1;
				gltf.scene.rotation.y = -1.5;
				gltf.scene.scale.set(9, 9, 9);
				scene.add(gltf.scene);
				actualmodel++;
				checkModelsLoaded(); // Vérifier si tous les modèles sont chargés
			},
			undefined,
			function (error) { console.error(error); } 
		);

		loadermodel.load(
			'games/pong/models/bush/scene.gltf',
			function (gltf)
			{ 
				gltf.scene.position.z = -71;
				gltf.scene.position.x = 50;
				gltf.scene.position.y = -2;
				gltf.scene.rotation.y = -1;
				gltf.scene.scale.set(0.05, 0.05, 0.05);
				scene.add(gltf.scene);
				actualmodel++;
				checkModelsLoaded(); // Vérifier si tous les modèles sont chargés
			},
			undefined,
			function (error) { console.error(error); } 
		);


		/// FLOOR DE LA PISCINE (PONG)
		const planeSize = 42;
		const texture2 = loader.load('games/pong/texture/dollarrachid.jpg');
		texture2.colorSpace = THREE.SRGBColorSpace;
		const planeGeo = new THREE.PlaneGeometry(planeSize * 2 + 6, planeSize + 3);
		const planeMat = new THREE.MeshPhongMaterial({ map: texture2, side: THREE.DoubleSide });
		const mesh = new THREE.Mesh(planeGeo, planeMat);
		mesh.rotation.x = Math.PI * -.5;
		scene.add(mesh);

		/// floor toit immeuble
		const Size = 104;
		const plane_Geo = new THREE.PlaneGeometry(Size + 20, Size -11);
		const plane_Mat = new THREE.MeshPhongMaterial({ color: 0x331313, side: THREE.DoubleSide });
		const planmesh = new THREE.Mesh(plane_Geo, plane_Mat);
		planmesh.rotation.x = Math.PI * -.5;
		planmesh.position.y = -1.1;
		planmesh.position.z = -22;
		scene.add(planmesh);

		/// floor toit immeuble
		const Size2 = 104;
		const plane_Geo2 = new THREE.PlaneGeometry(Size2 -11, Size2 +18);
		const plane_Mat2 = new THREE.MeshPhongMaterial({ color: 0x331313, side: THREE.DoubleSide });
		const planmesh2 = new THREE.Mesh(plane_Geo2, plane_Mat2);
		planmesh2.rotation.x = Math.PI * -.5;
		planmesh2.position.y = -1.1;
		planmesh2.position.z = -22;
		scene.add(planmesh2);

		/// floor toit immeuble
		const Size3 = 12;
		const plane_Geo3 = new THREE.PlaneGeometry(Size3, Size3);
		const plane_Mat3 = new THREE.MeshPhongMaterial({ color: 0x000005, side: THREE.DoubleSide });
		const planmesh3 = new THREE.Mesh(plane_Geo3, plane_Mat3);
		planmesh3.rotation.x = Math.PI * -.5;
		planmesh3.position.y = -2.2;
		planmesh3.position.z = -70;
		planmesh3.position.x = 49;
		scene.add(planmesh3);

		/// ORBITAL CONTROL
		const controls = new OrbitControls(camera, canvas);
		controls.unableDamping = true;
		controls.target.set(0, 0, 0);
		//controls.maxDistance = 300;
		controls.update();

		/// LUMIERES
		// lumiere ambiante
		const skyColor = 0xFFFFFF;
		const groundColor = 0xFFFFFF;
		const intensity2 = 5;
		const light2 = new THREE.HemisphereLight(skyColor, groundColor, intensity2);
		scene.add(light2);

		/// OBJETS
		// chargement des textures
		const texturewater = loader.load('games/pong/texture/water.jpg');
		const textureraquette = loader.load('games/pong/texture/bouee.png');
		const textureraquette2 = loader.load('games/pong/texture/bouee2.png');
		const textureraquette3 = loader.load('games/pong/texture/boueeSide.png');
		const texturevitre = loader.load('games/pong/texture/vitre.jpg');
		texturevitre.colorSpace = THREE.SRGBColorSpace;

		const texturetoit = loader.load('games/pong/texture/rock.jpg');
		texturetoit.wrapS = THREE.RepeatWrapping;
		texturetoit.wrapT = THREE.RepeatWrapping;
		texturetoit.magFilter = THREE.NearestFilter;
		texturetoit.colorSpace = THREE.SRGBColorSpace;
		texturetoit.repeat.set(30, 30);

		// creation des materiaux
		const wallmaterials = new THREE.MeshBasicMaterial({ map: texturevitre, side: THREE.DoubleSide, transparent: true, opacity: 0.2});
		const wallmaterials2 = new THREE.MeshBasicMaterial({ map: texturevitre, side: THREE.DoubleSide, transparent: true, opacity: 0.2, wireframe: true, });
		const water = new THREE.MeshBasicMaterial({ map: texturewater, transparent: true, opacity: 0.25, side: THREE.DoubleSide});

		// creation materiaux avec des textures differentes sur chaque face
		const sideMaterial = new THREE.MeshBasicMaterial({ map: textureraquette });
		const sideMaterial2 = new THREE.MeshBasicMaterial({ map: textureraquette2 });
		const sideMaterial3 = new THREE.MeshBasicMaterial({ map: textureraquette3 });
		const raquettematerials = [
			sideMaterial2,
			sideMaterial,
			sideMaterial3,
			sideMaterial3,
			sideMaterial3,
			sideMaterial3
		];

		// creation des differents cubes
		const cube = new THREE.BoxGeometry(2, 4, 10);
		const wall = new THREE.BoxGeometry(89, 6, 0.5);
		const wall2 = new THREE.BoxGeometry(0.5, 6, 45);
		const watercube = new THREE.BoxGeometry(89, 4, 44);

		// creation de la balle
		const radius = 2;
		const detail = 5;
		const ball = new THREE.IcosahedronGeometry(radius, detail);

		// creation des tableaux pour les paddles et les mouvements des paddles
		var ballObj;
		const ballDir = [ 0.99999, 0.00001 ]
		const paddles = [];


		// ajout des objets dans la scene et placement des objets
		addball(0, 2, 0, makeObj(ball, texturesphere));
		addraquette(-43, 2, 0, new THREE.Mesh(cube, raquettematerials));
		addraquette(43, 2, 0, new THREE.Mesh(cube, raquettematerials));
		addwall(0, 3, 22.25, new THREE.Mesh(wall, wallmaterials));
		addwall(0, 3, -22.25, new THREE.Mesh(wall, wallmaterials));
		addwall(-44.75, 3, 0, new THREE.Mesh(wall2, wallmaterials));
		addwall(44.75, 3, 0, new THREE.Mesh(wall2, wallmaterials));

		addwall(0, 3, 22.25, new THREE.Mesh(wall, wallmaterials2));
		addwall(0, 3, -22.25, new THREE.Mesh(wall, wallmaterials2));
		addwall(-44.75, 3, 0, new THREE.Mesh(wall2, wallmaterials2));
		addwall(44.75, 3, 0, new THREE.Mesh(wall2, wallmaterials2));
		addwall(0, 2.1, 0, new THREE.Mesh(watercube, water));

		/// SKYBOX
		// creation d'une sphere pour le ciel
		const skybox = new THREE.IcosahedronGeometry(4200,50);
		const skyboxMaterial = new THREE.MeshBasicMaterial({map: texture, side: THREE.BackSide });
		const skyboxMesh = new THREE.Mesh(skybox, skyboxMaterial);
		// positionnement de l'objet ciel
		skyboxMesh.rotation.y = -2.5;
		skyboxMesh.position.z = 20 - 45;
		scene.add(skyboxMesh);

		let gameEnd = false;

		/// RENDER
		var frame = 0;
		if (totalmodel == actualmodel)
			console.log(actualmodel, totalmodel);;
		renderer.render(scene, camera);

		/// FUNCTIONS
		function makeObj(geometry, map)
		{
			const material = new THREE.MeshBasicMaterial({ map: map });
			const obj = new THREE.Mesh(geometry, material);
			return obj;
		}

		function addball(x, y, z, obj)
		{
			obj.position.x = x;
			obj.position.y = y;
			obj.position.z = z;
			ballObj = obj;
			scene.add(obj);
		}

		function addraquette(x, y, z, obj)
		{
			obj.position.x = x;
			obj.position.y = y;
			obj.position.z = z;
			scene.add(obj);
			paddles.push(obj);
		}

		function addwall(x, y, z, obj)
		{
			obj.position.x = x;
			obj.position.y = y;
			obj.position.z = z;
			scene.add(obj);
		}

		socket.on('gameEnd', () => {
			gameEnd = true;
			setGameEnded(true);
		});

		socket.on('gameStatus', ({
			leftScore, rightScore,
			ballX, ballZ, newBallSpeed,
			ballDirX, ballDirZ, resetRotation,
			leftPaddleZ, rightPaddleZ
		}) => {
			// Score
			if (leftScore !== scoreL)
				setScoreL(leftScore);
			if (rightScore !== scoreR)
				setScoreR(rightScore);

			// Ball
			/// Speed
			ballSpeed = newBallSpeed;
			/// X Pos
			ballObj.position.x = ballX;
			/// Z Pos
			ballObj.position.z = ballZ;
			/// X Dir
			ballDir[0] = ballDirX;
			/// Z Dir
			ballDir[1] = ballDirZ;
			/// Rotation
			if (resetRotation) {
				ballObj.rotation.z = 0;
				ballObj.rotation.x = 0;
				ballObj.rotation.y = 0;
			}

			// Paddles
			paddles[0].position.z = leftPaddleZ;
			paddles[1].position.z = rightPaddleZ;
		});

		// Gameplay constants
		const BASE_BALL_SPEED = 60;						// units per second
		const BALL_MAX_X = 42.5;
		const BALL_MAX_Z = 20;
		const BALL_MAX_Z_DIR = 0.6;
		let ballSpeed = BASE_BALL_SPEED;

		
		function render(time)
		{
			if (!modelsLoaded)
			{
				requestAnimationFrame(render);
				return;
			}

			time *= 0.0001;
			frame += 0.1;

			const displaceX = (ballSpeed * timeSinceLastLoop) * Math.abs(ballDir[0]);
			if (ballDir[0] > 0)
				ballObj.position.x += displaceX;
			else if (ballDir[0] < 0)
				ballObj.position.x -= displaceX;
			ballObj.position.x = Math.min(Math.max(ballObj.position.x, -BALL_MAX_X), BALL_MAX_X);
			/// Z
			const displaceZ = (ballSpeed * timeSinceLastLoop) * Math.abs(ballDir[1]);
			if (ballDir[1] > 0) {
				ballObj.position.z += displaceZ;
			} else if (ballDir[1] < 0) {
				ballObj.position.z -= displaceZ;
			}
			/// Bounce on top and bottom walls
			if (ballObj.position.z > BALL_MAX_Z || ballObj.position.z < -BALL_MAX_Z) {
				ballDir[1] *= -1;
				ballObj.rotation.x = 0;
				ballObj.rotation.y = 0;
				ballObj.rotation.z = 0;
			}
			ballObj.position.z = Math.min(Math.max(ballObj.position.z, -BALL_MAX_Z), BALL_MAX_Z);

			// Clamp Ball Z Direction
			ballDir[1] = Math.min(Math.max(ballDir[1], -BALL_MAX_Z_DIR), BALL_MAX_Z_DIR);

			const absSum = Math.abs(ballDir[0]) + Math.abs(ballDir[1]);
			if (absSum !== 1)
			{
				const ratio = 1 / absSum;
				ballDir[0] *= ratio;
				ballDir[1] *= ratio;
			}

			// Ball Rotation
			const angle = Math.atan2(ballDir[1], ballDir[0]);
			const rotationX = Math.cos(angle) * (Math.PI / 4 / 5);
			const rotationZ = Math.sin(angle) * (Math.PI / 4 / 5);
			ballObj.rotateX(-rotationX);
			ballObj.rotateZ(rotationZ);

		}
		if (!gameEnd)
		{
			renderer.render(scene, camera);
			requestAnimationFrame(render);
		}
		return () =>
		{
			socket.disconnect();
			// Dispose of Three.js objects
			scene.traverse((object) =>
			{
				if (!object.isMesh)
					return;

				object.geometry.dispose();

				if (object.material.isMaterial)
				{
					cleanMaterial(object.material);
				}
				else
				{
					for (const material of object.material)
						cleanMaterial(material);
				}
			});
			function cleanMaterial(material)
			{
				material.dispose();
				// Dispose textures if any
				for (const key in material)
				{
					const value = material[key];
					if (value && typeof value === 'object' && 'minFilter' in value) {
						value.dispose();
					}
				}
			}
			scene = null;
			camera = null;
			renderer && renderer.renderLists.dispose();
			renderer.dispose();
			cancelAnimationFrame(render);
		};
	}, [user, gameType]);

	useEffect(() => {
		if (gameEnded) {
			setGameEnded(false);
			router.push('/');
		}
	}, [gameEnded]);

	let testmessage = <></>;
	let hidden = '';
	if (!room) {
		hidden = 'hidden';
		testmessage = (
			<div className="card">
				<p>Connecting...</p>
			</div>
		);
	}
	else if (inQueue) {
		hidden = 'hidden';
		testmessage = (
			<div className="card">
				<p>In {gameType} waitlist</p>
				<WaitList players={players} />
			</div>
		);
	}
	else if (!gameStarted) {
		hidden = 'hidden';
		testmessage = (
			<div className="card">
				<p>In room {room?.id}, waiting for an opponent</p>
			</div>
		);
	} else {
		hidden = '';
	}

	return (
		<div>
			{testmessage}
			<div className={styles.canvasWrapper}>
				<canvas hidden={hidden} ref={canvasRef} id="pong-canvas" className={styles.canvas} width="1080" height="720"></canvas>
			</div>
		</div>
	);
};

export default PongViewer;
