import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import io from 'socket.io-client';
import styles from '../styles/game.module.css';

const Pong = () => {
  const socketRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
	const socket = io('http://localhost:3000');
	// Gérer les événements de connexion et d'erreur
	socket.on('connect', () => {
		console.log('Connecté au serveur Socket.IO');
	});
	socket.on('connect_error', (error) => {
		console.error('Erreur de connexion au serveur Socket.IO:', error);
	});
	socketRef.current = socket;

    function main() {
      const canvas = canvasRef.current;

      const fov = 45;
      const aspect = 2;
      const near = 0.1;
      const far = 1000;

      const loader = new THREE.TextureLoader();
      const texture = loader.load('games/pong/texture/dollar.jpg');
      texture.colorSpace = THREE.SRGBColorSpace;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x111111);
      const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
      camera.position.set(0, 100, 10);
      camera.position.z = 10;

      const planeSize = 40;
      const texture2 = loader.load('games/pong/texture/dollarrachid.jpg');
      texture2.colorSpace = THREE.SRGBColorSpace;

      const planeGeo = new THREE.PlaneGeometry(planeSize * 2 + 2, planeSize + 3);
      const planeMat = new THREE.MeshPhongMaterial({
        map: texture2,
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(planeGeo, planeMat);
      mesh.rotation.x = Math.PI * -.5;
      scene.add(mesh);

      const controls = new OrbitControls(camera, canvas);
      controls.target.set(0, 0, 0);
      controls.update();

      const skyColor = 0xEEEEEE;
      const groundColor = 0xAA5656;
      const intensity2 = 0.4;
      const light2 = new THREE.HemisphereLight(skyColor, groundColor, intensity2);
      scene.add(light2);

      const color = 0xFFFFFF;
      const intensity = 1.5;
      const light = new THREE.DirectionalLight(color, intensity);
      light.position.set(10, 2, 0);
      light.target.position.set(0, 0, 0);
      scene.add(light);
      scene.add(light.target);

      const light3 = new THREE.DirectionalLight(color, intensity);
      light3.position.set(-10, 2, 0);
      light3.target.position.set(0, 0, 0);
      scene.add(light3);
      scene.add(light3.target);

      const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
      const texture3 = loader.load('games/pong/texture/dollarrachid.jpg');
      texture3.wrapS = THREE.RepeatWrapping;
      texture3.wrapT = THREE.RepeatWrapping;
      texture3.magFilter = THREE.NearestFilter;
      texture3.colorSpace = THREE.SRGBColorSpace;
      const repeats = 2;
      texture3.repeat.set(repeats * 8, repeats);

      const wallsideMaterial = new THREE.MeshBasicMaterial({ map: texture3 });
      const topBottomMaterial = new THREE.MeshBasicMaterial({ color: 0x003322 });

      const wallmaterials = [
        wallsideMaterial,
        wallsideMaterial,
        topBottomMaterial,
        topBottomMaterial,
        wallsideMaterial,
        wallsideMaterial
      ];

      const sideMaterial = new THREE.MeshBasicMaterial({ map: texture2 });
      const raquettematerials = [
        sideMaterial,
        sideMaterial,
        topBottomMaterial,
        topBottomMaterial,
        sideMaterial,
        sideMaterial
      ];

      const cube = new THREE.BoxGeometry(4, 4, 10);
      const wall = new THREE.BoxGeometry(90, 4, 2);

      const radius = 2;
      const detail = 5;
      const ball = new THREE.IcosahedronGeometry(radius, detail);

      const objects = [];
      const raquettes = [];
      const raquettesmove = [0, 0, 0, 0];

      addball(0, 2, 4, makeObj(ball, texture));
      addraquette(-43, 2, 0, new THREE.Mesh(cube, raquettematerials));
      addraquette(43, 2, 0, new THREE.Mesh(cube, raquettematerials));
      addwall(0, 2, 22, new THREE.Mesh(wall, wallmaterials));
      addwall(0, 2, -22, new THREE.Mesh(wall, wallmaterials));

      var frame = 0;

      document.addEventListener('keydown', function(event) {
        switch (event.key) {
          case "w":
          case "W":
            raquettesmove[0] = -1.2;
            break;
          case "s":
          case "S":
            raquettesmove[1] = 1.2;
            break;
          case "ArrowUp":
            raquettesmove[2] = -1.2;
            break;
          case "ArrowDown":
            raquettesmove[3] = 1.2;
            break;
        }
      });

      document.addEventListener('keyup', function(event) {
        console.log(event.key);
        switch (event.key) {
          case "w":
          case "W":
            raquettesmove[0] = 0;
            break;
          case "s":
          case "S":
            raquettesmove[1] = 0;
            break;
          case "ArrowUp":
            raquettesmove[2] = 0;
            break;
          case "ArrowDown":
            raquettesmove[3] = 0;
            break;
        }
      });

      renderer.render(scene, camera);

      function makeObj(geometry, map) {
        const material = new THREE.MeshBasicMaterial({ map: map });
        const obj = new THREE.Mesh(geometry, material);
        return obj;
      }

      function addball(x, y, z, obj) {
        obj.position.x = x;
        obj.position.y = y;
        obj.position.z = z;
        const objtab = [obj, 0.99999, 0.00001];
        scene.add(obj);
        objects.push(objtab);
      }

      function addraquette(x, y, z, obj) {
        obj.position.x = x;
        obj.position.y = y;
        obj.position.z = z;
        scene.add(obj);
        raquettes.push(obj);
      }

      function addwall(x, y, z, obj) {
        obj.position.x = x;
        obj.position.y = y;
        obj.position.z = z;
        scene.add(obj);
      }

      function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const pixelRatio = window.devicePixelRatio;
        const width = Math.floor(canvas.clientWidth * pixelRatio);
        const height = Math.floor(canvas.clientHeight * pixelRatio);
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
          renderer.setSize(width, height, false);
        }
        return needResize;
      }

      function raquetteHit(ball, raquettes) {
        const ballBox = new THREE.Box3().setFromObject(ball);
        var hit = 0.0;
        raquettes.forEach(raquette => {
          const raquetteBox = new THREE.Box3().setFromObject(raquette);
          if (ballBox.intersectsBox(raquetteBox)) {
            const ballCenter = ballBox.getCenter(new THREE.Vector3());
            const raquetteCenter = raquetteBox.getCenter(new THREE.Vector3());
            const hitVector = ballCenter.clone().sub(raquetteCenter);
            hit = hitVector.z;
          }
        });
        return hit;
      }

      function render(time) {
        time *= 0.001;
        frame += 0.005;

        if (resizeRendererToDisplaySize(renderer)) {
          const canvas = renderer.domElement;
          camera.aspect = canvas.clientWidth / canvas.clientHeight;
          camera.updateProjectionMatrix();
        }

        if (raquettes[0].position.z > -16)
          raquettes[0].position.z += raquettesmove[0];
        if (raquettes[0].position.z < 16)
          raquettes[0].position.z += raquettesmove[1];

        if (raquettes[1].position.z > -16)
          raquettes[1].position.z += raquettesmove[2];
        if (raquettes[1].position.z < 16)
          raquettes[1].position.z += raquettesmove[3];

        objects.forEach(objtab => {
          const obj = objtab[0];
          let directionX = objtab[1];
          let directionZ = objtab[2];
          let speed = 1 + frame * 0.05;

          if (obj.position.x < 40 && directionX > 0) {
            obj.position.x += speed * directionX;
          } else if (obj.position.x > -40 && directionX < 0) {
            obj.position.x -= speed * Math.abs(directionX);
          } else {
            var hit = raquetteHit(obj, raquettes);
            if (hit !== 0.0) {
              let decalage = hit * 0.1;
              directionX = -directionX;
              directionZ += decalage;
              directionX -= decalage;
              const absSum = Math.abs(directionX) + Math.abs(directionZ);
              if (absSum !== 1) {
                const ratio = 1 / absSum;
                directionX *= ratio;
                directionZ *= ratio;
              }
              obj.rotation.z = 0;
              obj.rotation.x = 0;
              obj.rotation.y = 0;
            } else {
              return;
            }
          }

          if (obj.position.z < 20 && directionZ > 0) {
            obj.position.z += speed * directionZ;
          } else if (obj.position.z > -20 && directionZ < 0) {
            obj.position.z -= speed * Math.abs(directionZ);
          } else {
            directionZ = -directionZ;
            obj.rotation.z = 0;
            obj.rotation.x = 0;
            obj.rotation.y = 0;
          }

          const angle = Math.atan2(directionZ, directionX);
          const rotationX = Math.cos(angle) * (Math.PI / 4 / 5);
          const rotationZ = Math.sin(angle) * (Math.PI / 4 / 5);
          obj.rotateZ(-rotationX);
          obj.rotateX(rotationZ);

          if (directionZ > 0.6)
            directionZ = 0.6;
          if (directionZ < -0.6)
            directionZ = -0.6;

          const absSum = Math.abs(directionX) + Math.abs(directionZ);
          if (absSum !== 1) {
            const ratio = 1 / absSum;
            directionX *= ratio;
            directionZ *= ratio;
          }

          objtab[1] = directionX;
          objtab[2] = directionZ;
        });

        renderer.render(scene, camera);
        requestAnimationFrame(render);
      }
      requestAnimationFrame(render);
    }
    main();

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  return (
    <div>
      <div className={styles.canvasWrapper}>
        <canvas ref={canvasRef} id="pong-canvas" className={styles.canvas} width="1000" height="700"></canvas>
      </div>
    </div>
  );
};

export default Pong;
