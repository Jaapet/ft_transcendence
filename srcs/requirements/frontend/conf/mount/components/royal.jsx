import { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import styles from '../styles/game.module.css';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


const Royal = () => {
  useEffect(() => {


  function main()
  {
    const canvas = document.querySelector('#royal-canvas');

    const fov = 45;
    const aspect = 2;  // la valeur par défaut du canevas
    const near = 0.1;
    const far = 10000;


    const loader = new THREE.TextureLoader();
    const texture = loader.load( 'games/royal/texture/cityfutur.jpg' );
    texture.colorSpace = THREE.SRGBColorSpace;

    const texture4 = loader.load( 'games/royal/texture/wall.png' );
    texture4.colorSpace = THREE.SRGBColorSpace;
    texture4.wrapS = THREE.RepeatWrapping;
    texture4.wrapT = THREE.RepeatWrapping;
    texture4.repeat.set( 1, 8 );


    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    /// possibiliter de tourner chaque user de son coter
    camera.position.set(0, 150, 10);
    camera.position.z = 150;


    /// MODEL 3D
    const loadermodel = new GLTFLoader();

    loadermodel.load(
      'games/pong/models/building.glb',
      function (gltf) { scene.add( gltf.scene ); },
      undefined,
      function (error) { console.error(error); } 
    );
    


    /// FLOOR

    const planeSize = 80;
  
    const texture2 = loader.load('games/royal/texture/toit.jpg');
    texture2.colorSpace = THREE.SRGBColorSpace;

    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({
      map: texture2,
      side: THREE.DoubleSide,
      fog: true,
      shininess: 100,
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -.5;
    scene.add(mesh);


      /// FLOOR 2

      const floorSize = 950;
  
      const texture3 = loader.load('games/royal/texture/floor.png');
      texture3.colorSpace = THREE.SRGBColorSpace;
    
      const floorGeo = new THREE.PlaneGeometry(floorSize, floorSize);
      const floorMat = new THREE.MeshPhongMaterial({
        map: texture3,
        side: THREE.DoubleSide,
        fog: true,
        shininess: 1000,
        
      });
      const mesh2 = new THREE.Mesh(floorGeo, floorMat);
      mesh2.rotation.x = Math.PI * -.5;
      mesh2.position.y = -600;
      mesh2.position.z = 29.5;
      scene.add(mesh2);


    /// ORBITAL CONTROLS

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0, 0);
    controls.update();



    /// LIGHTS

    const skyColor = 0xFFFFFF;  // bleu clair
    const groundColor = 0xFFFFFF;  // orange brunâtre
    const intensity2 = 1.8;
    const light2 = new THREE.HemisphereLight(skyColor, groundColor, intensity2);
    scene.add(light2);

    const color = 0xFFFFFF;
    const intensity = 8.8;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-5, 4, -5);
    light.target.position.set(10, -5, 10);
    scene.add(light);
    scene.add(light.target);
      

    const light3 = new THREE.DirectionalLight(color, intensity);
    light3.position.set(5, 4, -5);
    light3.target.position.set(-10, -5, 10);
    scene.add(light3);
    scene.add(light3.target);

    const light4 = new THREE.DirectionalLight(color, intensity);
    light4.position.set(0, 4, 10);
    light4.target.position.set(0, -5, -10);
    scene.add(light4);
    scene.add(light4.target);

    /// OBJECTS

    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
    
    
    const radius =  2;  
    const detail = 5;  
    const ball = new THREE.IcosahedronGeometry( radius, detail );
    const wall = new THREE.BoxGeometry(80, 600, 80);

    

    var objects = [];
    var ballmove = [];
    var ballspeed = [];
    ballmove[0] = 0;
    ballmove[1] = 0;
    ballspeed[0] = 0;
    ballspeed[1] = 0;
    var space = 0;


    ballmove[2] = 0;
    ballmove[3] = 0;

    addball(0, 2, 4, makeObj(ball, texture));
    addball(10, 2, 4, makeObj(ball, texture));
    addball(-10, 2, 4, makeObj(ball, texture));
    addwall(0, -300.5, 0, makeObj(wall, texture4));


    /// SKYBOX

    /// SKYBOX

    const skybox = new THREE.IcosahedronGeometry(800,50);

    const skyboxMaterial = new THREE.MeshBasicMaterial({map: texture, side: THREE.BackSide});

    const skyboxMesh = new THREE.Mesh(skybox, skyboxMaterial);
    skyboxMesh.position.z = 29.5;

    scene.add(skyboxMesh);



      
    document.addEventListener('keydown', function(event) {
      console.log(event.key);
      switch (event.key) {
          case "w":
          case "W":
              
              ballmove[0] = -0.1;
              break;
          case "s":
          case "S":
              
              ballmove[0] = 0.1;
              break;
          case "a":
            case "A":
                
                ballmove[1] = -0.1;
                break;
            case "d":
            case "D":
                
                ballmove[1] = 0.1;
                break;
      }
    });

    document.addEventListener('keyup', function(event) {
      switch (event.key) {
          case "w":
          case "W":
              ballmove[0] = 0;
              break;
          case "s":
          case "S":
              ballmove[0] = 0;
              break;
          case "a":
            case "A":
                
                ballmove[1] = 0;
                break;
            case "d":
            case "D":
                
                ballmove[1] = 0;
                break;
      }
    });

    renderer.render(scene, camera);




    /// FUNCTIONS

    function makeObj(geometry, map)
    {
      const material = new THREE.MeshPhongMaterial({map: map});
    
      const obj = new THREE.Mesh(geometry, material);
    
      return obj;
    }

    
    function addball(x, y, z, obj)
    {
      obj.position.x = x;
      obj.position.y = y;
      obj.position.z = z;

      var objtab = [obj, 0, 0, 0]
    
      scene.add(obj);
      objects.push(objtab);
    }

    function addwall(x, y, z, obj)
    {
      obj.position.x = x;
      obj.position.y = y;
      obj.position.z = z;

      scene.add(obj);
    }


    // Hitbox de la Ball
    function BallHit(ball, Balls) {
      const ballBox = new THREE.Box3().setFromObject(ball);
      var hit = [0, 0];
      Balls.forEach(Ball => {
          if (Ball[0] == ball)
              return;
          const BallBox = new THREE.Box3().setFromObject(Ball[0]);
          if (ballBox.intersectsBox(BallBox)) {
              const ballCenter = ballBox.getCenter(new THREE.Vector3());
              const BallCenter = BallBox.getCenter(new THREE.Vector3());
              const hitVector = ballCenter.clone().sub(BallCenter);
              hit[0] = hitVector.z;
              hit[1] = hitVector.x;
          }
      });
      return (hit)
    }
    

    function render(time)
    {
      time *= 0.001; 
      
      if (!modelsLoaded)
      {
        requestAnimationFrame(render);
        return;
      }
      
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    
      
      
      // GESTION ROTATION ET DEPLACEMENT DE LA BOULE
      
      objects.forEach(objtab => {
        // ce deplace dans une direction et s'arrete au bord et repart dans l'autre sens
        const obj = objtab[0];

        
        ballspeed[0] = objtab[1];
        ballspeed[1] = objtab[2];
        
        // si la balle est en chute libre
        if (objtab[3] == 1)
        {
          if (obj.position.y > -600)
            obj.position.y = obj.position.y - 1.2;
        }
        else
        {
          // sinon 
          ballspeed[0] += ballmove[0]/3;
          ballspeed[1] += ballmove[1]/3;
        }
        
        // friction de la balle (ralentissement au fil du temps)
        ballspeed[0] *= 0.96;
        ballspeed[1] *= 0.96;

        // normalisation du vecteur de deplacement a 0.8 (vitesse max)
        if (Math.abs(ballspeed[0]) > 0.8)
          ballspeed[0] = 0.8 * Math.sign(ballspeed[0]);
        if (Math.abs(ballspeed[1]) > 0.8)
          ballspeed[1] = 0.8 * Math.sign(ballspeed[1]);

        // assignation des valeurs de deplacement
        let directionZ = ballspeed[0];
        let directionX = ballspeed[1];
        let speed = 0.8;
        
        // deplacement de la balle
        if (directionX > 0)
          obj.position.x += speed * (directionX);
        else if (directionX < 0)
          obj.position.x -= speed * (Math.abs(directionX));

        if (directionZ > 0)
          obj.position.z += speed * (Math.abs(directionZ));
        else if (directionZ < 0)
          obj.position.z -= speed * (Math.abs(directionZ));

        // en cas de sortie de la balle du terrain
        // activer le mode de chute
        if (obj.position.z < -41)
          objtab[3] = 1;
        else if (obj.position.z > 41)
          objtab[3] = 1;
        else if (obj.position.x < -41)
          objtab[3] = 1;
        else if (obj.position.x > 41)
          objtab[3] = 1;

        // GESTION COLLISION AVEC LES AUTRES BALLES
        var hit = BallHit(obj, objects);
        // si la balle touche une autre balle elle rebondit
        if (hit[0] != 0 || hit[1] != 0)
        {
          ballspeed[0] = hit[0]/4;
          ballspeed[1] = hit[1]/4;
        }
        // sauvegarde du vecteur de deplacement
        objtab[1] = ballspeed[0];
        objtab[2] = ballspeed[1];
      });
    
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }
  main();

      }, []);

  return (
    <>
      <div>
      <div className={styles.canvasWrapper}>
        <canvas id="royal-canvas" className={styles.canvas} width="1000" height="700"></canvas>
      </div>
 
      </div>
    </>
  );
};

export default Royal;