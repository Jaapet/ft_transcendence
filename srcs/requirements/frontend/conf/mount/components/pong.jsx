import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import io from 'socket.io-client';
import styles from '../styles/game.module.css';

const Pong = () => {
  const socketRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
	const socket = io('http://localhost:3000');
	socketRef.current = socket;

    function main() {
      const canvas = canvasRef.current;

      const fov = 42;
      const aspect = 1.5;
      const near = 0.1;
      const far = 10000;

      const loader = new THREE.TextureLoader();
      const texture = loader.load('games/pong/texture/city.jpg');
      texture.colorSpace = THREE.SRGBColorSpace;
      const texturesphere = loader.load('games/pong/texture/eye2.jpg');
      texture.colorSpace = THREE.SRGBColorSpace;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x111111);
      const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
      camera.position.set(0, 100, 10);
      camera.position.z = 10;

      const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });



      /// text
        let text3, text3r, text2, text2r, text1, text1r, text0, text0r;
        let textMesh1, font;
        let textGeo;
        const loadertext = new FontLoader();
        loadertext.load( 'games/pong/fonts/helvetiker_regular.typeface.json', function (loadedFont)
        {
          font = loadedFont;

          let BLACK = [
            new THREE.MeshPhongMaterial( { color: 0x000000, flatShading: true } ), // front
            new THREE.MeshPhongMaterial( { color: 0x000000 } ) // side
          ];
          let RED = [
            new THREE.MeshPhongMaterial( { color: 0xFF0000, flatShading: true } ), // front
            new THREE.MeshPhongMaterial( { color: 0xFF0000 } ) // side
          ];

          text3 = createText("3", BLACK, 31, 5, 5, 2, 0, 5);
          text3r = createText("3", RED, 30, 5, 6, 1, -1, 5.5);
          text2 = createText("2", BLACK, 31, 5, 5, 2, 0, 5);
          text2r = createText("2", RED, 30, 5, 6, 1, -1, 5.5);
          text1 = createText("1", BLACK, 31, 5, 5, 2, -7, 5);
          text1r = createText("1", RED, 30, 5, 6, 1, -8, 5.5);
          text0 = createText("0", BLACK, 31, 5, 5, 2, 0, 5);
          text0r = createText("0", RED, 30, 5, 6, 1, -1, 5.5);
        });

        function createText(text, materials, size, z, y, epaisseur, x, profondeur)
        {

          textGeo = new TextGeometry( text,
          {
            font: font,

            size: size,
            depth: 1,
            curveSegments: 10,

            bevelThickness: profondeur,
            bevelSize: epaisseur,
            bevelEnabled: y

          } );

          textGeo.computeBoundingBox();

          const centerOffset = - 0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );

          textMesh1 = new THREE.Mesh( textGeo, materials );

          textMesh1.position.x = centerOffset + x;
          textMesh1.position.y = y + 10;
          textMesh1.position.z = z;

          textMesh1.rotation.x = -1.4;
          textMesh1.rotation.y = Math.PI * 2;
          textMesh1.rotation.z = 0;

          
          return (textMesh1);
        }


      /// FLOOR

      const planeSize = 42;
      const texture2 = loader.load('games/pong/texture/dollarrachid.jpg');
      texture2.colorSpace = THREE.SRGBColorSpace;

      const planeGeo = new THREE.PlaneGeometry(planeSize * 2 + 6, planeSize + 3);
      const planeMat = new THREE.MeshPhongMaterial({
        map: texture2,
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(planeGeo, planeMat);
      mesh.rotation.x = Math.PI * -.5;
      scene.add(mesh);

      /// ORBITAL CONTROL

      const controls = new OrbitControls(camera, canvas);
      controls.target.set(0, 0, 0);
      controls.update();

      // LUMIERES

      const skyColor = 0xEEEEEE;
      const groundColor = 0xFFFFFF;
      const intensity2 = 0.4;
      const light2 = new THREE.HemisphereLight(skyColor, groundColor, intensity2);
      scene.add(light2);

      const color = 0xFFFFFF;
      const intensity = 6.5;
      const light = new THREE.DirectionalLight(color, intensity);
      light.position.set(10, 2, -10);
      light.target.position.set(0, 0, 5);
      scene.add(light);
      scene.add(light.target);

      const light3 = new THREE.DirectionalLight(color, intensity);
      light3.position.set(-10, 2, -10);
      light3.target.position.set(0, 0, 5);
      scene.add(light3);
      scene.add(light3.target);

      const light4 = new THREE.DirectionalLight(color, intensity);
      light4.position.set(0, 2, -10);
      light4.target.position.set(0, 0, 5);
      scene.add(light4);
      scene.add(light4.target);


      /// OBJETS

      const texturewater = loader.load('games/pong/texture/water.jpg');
      const texturevitre = loader.load('games/pong/texture/vitre.jpg');
      texturevitre.wrapS = THREE.RepeatWrapping;
      texturevitre.wrapT = THREE.RepeatWrapping;
      texturevitre.magFilter = THREE.NearestFilter;
      texturevitre.colorSpace = THREE.SRGBColorSpace;
      texturevitre.repeat.set(1, 1);
      const textureraquette = loader.load('games/pong/texture/bouee.png');
      const textureraquette2 = loader.load('games/pong/texture/bouee2.png');
      const textureraquette3 = loader.load('games/pong/texture/boueeSide.png');



      
      const wallmaterials = new THREE.MeshBasicMaterial({ map: texturevitre, side: THREE.DoubleSide, transparent: true, opacity: 0.2});
      const wallmaterials2 = new THREE.MeshBasicMaterial({ map: texturevitre, side: THREE.DoubleSide, transparent: true, opacity: 0.2, wireframe: true, });
      const water = new THREE.MeshBasicMaterial({ map: texturewater, transparent: true, opacity: 0.25, side: THREE.DoubleSide});
      
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
      
      const textureImmeuble = loader.load('games/pong/texture/imeuble.jpg');
      textureImmeuble.wrapS = THREE.RepeatWrapping;
      textureImmeuble.wrapT = THREE.RepeatWrapping;
      textureImmeuble.magFilter = THREE.NearestFilter;
      textureImmeuble.colorSpace = THREE.SRGBColorSpace;
      textureImmeuble.repeat.set(2, 4);

      const texturetoit = loader.load('games/pong/texture/rock.jpg');
      texturetoit.wrapS = THREE.RepeatWrapping;
      texturetoit.wrapT = THREE.RepeatWrapping;
      texturetoit.magFilter = THREE.NearestFilter;
      texturetoit.colorSpace = THREE.SRGBColorSpace;
      texturetoit.repeat.set(30, 30);

      const side = new THREE.MeshBasicMaterial({ map: textureImmeuble });
      const side2 = new THREE.MeshBasicMaterial({ map: texturetoit });
      const immeublematerials = [
        side,
        side,
        side2,
        side2,
        side,
        side
      ];
      
      const cube = new THREE.BoxGeometry(2, 4, 10);
      const wall = new THREE.BoxGeometry(89, 6, 0.5);
      const wall2 = new THREE.BoxGeometry(0.5, 6, 45);
      const watercube = new THREE.BoxGeometry(89, 4, 44);
      const skyscrapper = new THREE.BoxGeometry(90, 400, 90);
      
      const radius = 2;
      const detail = 5;
      const ball = new THREE.IcosahedronGeometry(radius, detail);
      
      var frame = 0;
      const objects = [];
      const raquettes = [];
      const raquettesmove = [0, 0, 0, 0];
      
      addball(0, 2, 4, makeObj(ball, texturesphere));
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
      addwall(0, -200.1,  22.5, new THREE.Mesh(skyscrapper, immeublematerials));
      addwall(0, 2.1, 0, new THREE.Mesh(watercube, water));

      /// SKYBOX

      const skybox = new THREE.IcosahedronGeometry(400,50);

      const skyboxMaterial = new THREE.MeshBasicMaterial({map: texture, side: THREE.BackSide });

      const skyboxMesh = new THREE.Mesh(skybox, skyboxMaterial);
      skyboxMesh.rotation.y = 0.5;
      skyboxMesh.position.z = 20;

      scene.add(skyboxMesh);

      /// CONTROLS

      document.addEventListener('keydown', function(event)
      {
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

      document.addEventListener('keyup', function(event)
      {
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

      let compteur = 0;

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
        const objtab = [obj, 0.99999, 0.00001];
        scene.add(obj);
        objects.push(objtab);
      }

      function addraquette(x, y, z, obj)
      {
        obj.position.x = x;
        obj.position.y = y;
        obj.position.z = z;
        scene.add(obj);
        raquettes.push(obj);
      }

      function addwall(x, y, z, obj)
      {
        obj.position.x = x;
        obj.position.y = y;
        obj.position.z = z;
        scene.add(obj);
      }

      function resizeRendererToDisplaySize(renderer)
      {
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

      function raquetteHit(ball, raquettes)
      {
        const ballBox = new THREE.Box3().setFromObject(ball);
        var hit = 0.0;
        raquettes.forEach(raquette => {
          const raquetteBox = new THREE.Box3().setFromObject(raquette);
          if (ballBox.intersectsBox(raquetteBox))
          {
            const ballCenter = ballBox.getCenter(new THREE.Vector3());
            const raquetteCenter = raquetteBox.getCenter(new THREE.Vector3());
            const hitVector = ballCenter.clone().sub(raquetteCenter);
            hit = hitVector.z;
          }
        });
        return hit;
      }

      function render(time)
      {
        time *= 0.001;
        frame += 0.005;
        
        if (time > 7)
        {
          scene.remove(text0);
          scene.remove(text0r);
          scene.remove(text1);
          scene.remove(text1r);
          scene.remove(text2);
          scene.remove(text2r);
          scene.remove(text3);
          scene.remove(text3r);
        }
        else if (time > 6)
        {
          scene.remove(text1);
          scene.remove(text1r);
          scene.add(text0);
          scene.add(text0r);
        }
        else if (time > 5)
        {
          scene.remove(text2);
          scene.remove(text2r);
          scene.add(text1);
          scene.add(text1r);
        }
        else if (time > 4)
        {
          scene.remove(text3);
          scene.remove(text3r);
          scene.add(text2);
          scene.add(text2r);
        }
        else
        {
          scene.add(text3);
          scene.add(text3r);
        }

      
        if (time > 7.5)
        {
          if (resizeRendererToDisplaySize(renderer))
          {
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

            if (obj.position.x < 41 && directionX > 0)
            {
              obj.position.x += speed * directionX;
            }
            else if (obj.position.x > -41 && directionX < 0)
            {
              obj.position.x -= speed * Math.abs(directionX);
            }
            else
            {
              var hit = raquetteHit(obj, raquettes);
              if (hit !== 0.0)
              {
                let decalage = hit * 0.1;
                directionX = -directionX;
                directionZ += decalage;
                directionX -= decalage;
                const absSum = Math.abs(directionX) + Math.abs(directionZ);
                if (absSum !== 1)
                {
                  const ratio = 1 / absSum;
                  directionX *= ratio;
                  directionZ *= ratio;
                }
                obj.rotation.z = 0;
                obj.rotation.x = 0;
                obj.rotation.y = 0;
              }
              else
              {
                return;
              }
            }

            if (obj.position.z < 20 && directionZ > 0)
              obj.position.z += speed * directionZ;
            else if (obj.position.z > -20 && directionZ < 0)
              obj.position.z -= speed * Math.abs(directionZ);
            else
            {
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
            if (absSum !== 1)
            {
              const ratio = 1 / absSum;
              directionX *= ratio;
              directionZ *= ratio;
            }

            objtab[1] = directionX;
            objtab[2] = directionZ;
          });
        }
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
