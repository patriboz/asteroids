import * as THREE from 'three';

import metaversefile from 'metaversefile';

const { useApp, useFrame, useInternals, useLocalPlayer, useLoaders, usePhysics, useCleanup, useActivate, useCamera } = metaversefile;

const baseUrl = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');

export default () => {
  const app = useApp();
  app.name = 'Asteroid Game';
  const { renderer, camera } = useInternals();
  const localPlayer = useLocalPlayer();
  const physics = usePhysics();

  const defaultSpawn = new THREE.Vector3(0, 5, 0);
  let physicsIds = [];
  let asteroids = [
    {
      position: new THREE.Vector3(0, 0, 0), 
      quat: new THREE.Quaternion(0, 0, 0, 1), 
      scale: new THREE.Vector3(0.04, 0.04, 0.04)
    },
    {
      position: new THREE.Vector3(10, 0, 0), 
      quat: new THREE.Quaternion(0, 0.7071067811865475, 0, 0.7071067811865476), 
      scale: new THREE.Vector3(0.03, 0.03, 0.03)
    },
    {
      position: new THREE.Vector3(20, 0, 0), 
      quat: new THREE.Quaternion(0, 0, 0, 1), 
      scale: new THREE.Vector3(0.02, 0.02, 0.02)
    },
    {
      position: new THREE.Vector3(35, -10, 5), 
      quat: new THREE.Quaternion(0, 1, 0, 0), 
      scale: new THREE.Vector3(0.05, 0.03, 0.05)
    },
    {
      position: new THREE.Vector3(50, -30, 0), 
      quat: new THREE.Quaternion(0, 0, 0, 1), 
      scale: new THREE.Vector3(0.04, 0.04, 0.04)
    }
  ];

  const localMatrix = new THREE.Matrix4();
  const q1 = new THREE.Quaternion(0.0087262, 0.0087262, 0.0000762, 0.9999238);
  const v1 = new THREE.Vector3(1, 0, 0);

  (async () => {
    const url = `https://patriboz.github.io/asteroids/assets/rock/scene.gltf`; // todo: relative path?
    let gltf = await new Promise((accept, reject) => {
        const {gltfLoader} = useLoaders();
        gltfLoader.load(url, accept, function onprogress() {}, reject);
        
    });

    let mesh = gltf.scene;

    for(const asteroid of asteroids) {
    
      let newMesh = mesh.clone();

      newMesh.applyMatrix4(localMatrix.compose(asteroid.position, asteroid.quat, asteroid.scale));

      app.add(newMesh);
      newMesh.updateMatrixWorld();

      let physicsId = physics.addGeometry(newMesh);
      physicsIds.push(physicsId);
      newMesh.physicsId = physicsId;

      asteroid.mesh = newMesh;
      asteroid.physicsObject = physicsId;
    }
    createAsteroidField(mesh);
    app.updateMatrixWorld();
  })();


  useCleanup(() => {
    for (const physicsId of physicsIds) {
      physics.removeGeometry(physicsId);
    }
  });




  let delta = 0;  

  useFrame(({ timeDiff, timestamp }) => {

    // if(asteroids[1].physicsObject) {
      
    //   delta = 0.1 * Math.sin(timestamp / 500);

    //   // asteroids[1].physicsObject.quaternion.premultiply(q1);
    //   asteroids[1].physicsObject.position.setX(asteroids[1].physicsObject.position.x + delta);
    //   asteroids[1].physicsObject.updateMatrixWorld();
    //   asteroids[1].physicsObject.needsUpdate = true;

    //   asteroids[1].mesh.position.copy(asteroids[1].physicsObject.position);

    //   console.log(delta);
    // }

    // Resets character position to spawn position
    if(localPlayer.position.y < -50) {
      physics.setCharacterControllerPosition(localPlayer.characterController, defaultSpawn);
    }

    app.updateMatrixWorld();
  });

  const createAsteroidField = (mesh) => {
    
    const rndPos = (min, max) => {

      const p = (Math.random() - 0.5) * max;
      if(p < 0) {
        p -= min;
      } else {
        p += min;
      }
      return p;
      // let invalid = true;
      // while(invalid) {
      //   const n = (Math.random() - 0.5) * max;
      //   if(n > 0 && n > min || n < 0 && n < min) {
      //     invalid = false;
      //     return n;
      //   }
      // }
    };

    for(let i = 0; i < 50; i++) {
      let newMesh = mesh.clone();
      newMesh.applyMatrix4(localMatrix.compose(
        new THREE.Vector3(rndPos(30, 200), rndPos(30, 200), rndPos(30, 200)), 
        new THREE.Quaternion().random(),
        new THREE.Vector3(Math.random() / 10, Math.random() / 10, Math.random() / 10)
      ));
      app.add(newMesh);
      newMesh.updateMatrixWorld();
    }
  };

  return app;
};