import { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import styles from '../styles/game.module.css';

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
    const texture = loader.load( 'games/royal/texture/dollar.jpg' );
    texture.colorSpace = THREE.SRGBColorSpace;


    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    /// possibiliter de tourner chaque user de son coter
    camera.position.set(0, 50, 10);
    camera.position.z = 50;



    /// FLOOR

    const planeSize = 50;
  
    const loader2 = new THREE.TextureLoader();
    const texture2 = loader2.load('games/royal/texture/dollar.jpg');
    texture2.colorSpace = THREE.SRGBColorSpace;

    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({
      map: texture2,
      side: THREE.DoubleSide

    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -.5;
    scene.add(mesh);


      /// FLOOR 2

      const floorSize = 400;
  
      const loader3 = new THREE.TextureLoader();
      const texture3 = loader3.load('games/royal/texture/dollar.jpg');
      texture3.colorSpace = THREE.SRGBColorSpace;
    
      const floorGeo = new THREE.PlaneGeometry(floorSize, floorSize);
      const floorMat = new THREE.MeshPhongMaterial({
        map: texture3,
        side: THREE.DoubleSide
    
      });
      const mesh2 = new THREE.Mesh(floorGeo, floorMat);
      mesh2.rotation.x = Math.PI * -.5;
      mesh2.position.y = -150;
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
    light.position.set(-15, 10, -15);
    light.target.position.set(15, 0, 15);
    scene.add(light);
    scene.add(light.target);
      

    const light3 = new THREE.DirectionalLight(color, intensity);
    light3.position.set(15, 10, -15);
    light3.target.position.set(-15, 0, 15);
    scene.add(light3);
    scene.add(light3.target);

    /// OBJECTS

    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
    
    

    
    // BALL
    const radius =  2;  
    const detail = 5;  
    const ball = new THREE.IcosahedronGeometry( radius, detail );
    const wall = new THREE.BoxGeometry(50, 150, 50);

    

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
    addwall(0, -75.1, 0, makeObj(wall, texture));


      
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
            case " ":
                space = 1;
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
            case " ":
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
      
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    
      
      
      // GESTION ROTATION ET DEPLACEMENT DE LA BOULE
      
      objects.forEach(objtab => {
        // ce deplace dans une direction et s'arrete au bord et repart dans l'autre sens
        const obj = objtab[0];

        if (space == 1 && obj.position.y < 10)
          obj.position.y = obj.position.y * 1.1;
        else if (obj.position.y > 2)
          {
          obj.position.y = obj.position.y - 1;
          space = 0;
          }


        
        ballspeed[0] = objtab[1];
        ballspeed[1] = objtab[2];
        
        // si la balle est en chute libre
        if (objtab[3] == 1)
        {
          if (obj.position.y > -148)
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
        if (obj.position.z < -26)
          objtab[3] = 1;
        else if (obj.position.z > 26)
          objtab[3] = 1;
        else if (obj.position.x < -26)
          objtab[3] = 1;
        else if (obj.position.x > 26)
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