
import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import {OrbitControls} from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';

function main()
{
  const canvas = document.querySelector('#pong-canvas');

  const fov = 45;
  const aspect = 2;  // la valeur par défaut du canevas
  const near = 0.1;
  const far = 1000;


  const loader = new THREE.TextureLoader();
  const texture = loader.load( 'games/pong/texture/dollar.jpg' );
  texture.colorSpace = THREE.SRGBColorSpace;


  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 150, 20);
  camera.position.z = 50;



  /// FLOOR

  const planeSize = 40;
 
  const loader2 = new THREE.TextureLoader();
  const texture2 = loader2.load('games/pong/texture/dollarrachid.jpg');
  texture2.colorSpace = THREE.SRGBColorSpace;

  const planeGeo = new THREE.PlaneGeometry(planeSize * 2 + 2, planeSize + 3);
  const planeMat = new THREE.MeshPhongMaterial({
    map: texture2,
    side: THREE.DoubleSide

  });
  const mesh = new THREE.Mesh(planeGeo, planeMat);
  mesh.rotation.x = Math.PI * -.5;
  scene.add(mesh);


  /// CONTROLS

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 0, 0);
  controls.update();



  /// LIGHTS

  const skyColor = 0xB1E1FF;  // bleu clair
  const groundColor = 0xB97A20;  // orange brunâtre
  const intensity2 = 0.1;
  const light2 = new THREE.HemisphereLight(skyColor, groundColor, intensity2);
  scene.add(light2);

  const color = 0xFFFFFF;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(0, 10, 0);
  light.target.position.set(-5, 0, 0);
  scene.add(light);
  scene.add(light.target);
    


  /// OBJECTS

  const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
  

  // Créer un matériau avec votre texture pour les côtés du cube
  const sideMaterial = new THREE.MeshBasicMaterial({ map: texture2 });

  // Créer des matériaux pour les autres faces du cube (haut et bas)
  const topBottomMaterial = new THREE.MeshBasicMaterial({ color: 0x003322 });

  // Créer un tableau de matériaux pour chaque face du cube
  const materials = [
      sideMaterial,       // Matériau pour la face droite
      sideMaterial,       // Matériau pour la face gauche
      topBottomMaterial,  // Matériau pour la face supérieure
      topBottomMaterial,  // Matériau pour la face inférieure
      sideMaterial,       // Matériau pour la face avant
      sideMaterial        // Matériau pour la face arriere
  ];

  // Créer un matériau combiné en utilisant le tableau de matériaux
  const cubeMaterial = new THREE.MeshFaceMaterial(materials);


  const cube = new THREE.BoxGeometry(4, 4, 10);

  // suprimer la face du dessus

  
  // BALL
  const radius =  2;  
  const detail = 5;  
  const ball = new THREE.IcosahedronGeometry( radius, detail );
  

  const objects = [];
  const raquettes = [];

  addball(0, 2, 4, makeObj(ball, texture));
  addcube(-42, 2, 0, new THREE.Mesh(cube, cubeMaterial));
  addcube(42, 2, 0, new THREE.Mesh(cube, cubeMaterial));


    // GESTION DES RAQUETTES

  // GESTION DE LA RAQUETTE 1
  // si la touche fleche haut est enfoncée et que la raquette n'est pas au bord
  
  document.addEventListener('keydown', function(event) {
    console.log(event.key);
    switch (event.key) {
        case "w":
        case "W":
            raquettes[0].position.z -= 1;
            break;
        case "s":
        case "S":
            raquettes[0].position.z += 1;
            break;
    }
  });

  renderer.render(scene, camera);




  /// FUNCTIONS

  function makeObj(geometry, map)
  {
    const material = new THREE.MeshBasicMaterial({map : map});
   
    const obj = new THREE.Mesh(geometry, material);
   
    return obj;
  }

  
  function addball(x, y, z, obj)
  {
    obj.position.x = x;
    obj.position.y = y;
    obj.position.z = z;

    const objtab = [obj, 0.99999, 0.00001]
   
    scene.add(obj);
    objects.push(objtab);
  }

  function addcube(x, y, z, obj)
  {
    obj.position.x = x;
    obj.position.y = y;
    obj.position.z = z;



   
    scene.add(obj);
    raquettes.push(obj);
  }


  function resizeRendererToDisplaySize(renderer)
  {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width  = Math.floor( canvas.clientWidth  * pixelRatio );
    const height = Math.floor( canvas.clientHeight * pixelRatio );
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  // Hitbox de la raquette
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
    return (hit)
  }
  

  function render(time)
  {
    time *= 0.001;  // convertit le temps en secondes

    /*if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }*/

    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();

    // GESTION ROTATION ET DEPLACEMENT DE LA BOULE
    
    objects.forEach(objtab => {
      // ce deplace dans une direction et s'arrete au bord et repart dans l'autre sens
      const obj = objtab[0];
      let directionX = objtab[1];
      let directionZ = objtab[2];
      let speed = 0.8 + time * 0.05;
  
      
      if (obj.position.x < 40 && directionX > 0) {
        obj.position.x += speed * directionX;

      }
      else if (obj.position.x > -40 && directionX < 0) {
        obj.position.x -= speed * Math.abs(directionX);
      }
      else
      {
        var hit = raquetteHit(obj, raquettes);
        
        // si la balle touche une raquette
        if (hit !== 0.0)
        {
          if (Math.abs(hit) < 2)
            hit = 0;
          let decalage = hit * 0.18;
          
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
        }
        else
        {
          return; // todo : ennemie win point
        }
      }



      if (obj.position.z < 20 && directionZ > 0) {
        obj.position.z += speed * directionZ;
      }
      else if (obj.position.z > -20 && directionZ < 0) {
        obj.position.z -= speed * Math.abs(directionZ);
      }
      else
      {
        directionZ = -directionZ;
        obj.rotation.z = 0;
        obj.rotation.x = 0;
        obj.rotation.y = 0;
      }

      
      // Calcul de l'angle de direction
      const angle = Math.atan2(directionZ, directionX);

      // Calcul des composantes de la rotation en fonction de l'angle
      const rotationX = Math.cos(angle) * (Math.PI / 4 / 5);
      const rotationZ = Math.sin(angle) * (Math.PI / 4 / 5);

      // Appliquer la rotation
      obj.rotateZ(-rotationX);
      obj.rotateX(rotationZ);

      objtab[1] = directionX;
      objtab[2] = directionZ;

    });
   
    renderer.render(scene, camera);
   
    requestAnimationFrame(render);
  }


  requestAnimationFrame(render);
}
main();