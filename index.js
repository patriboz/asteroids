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

      newMesh.position.copy(asteroid.position);
      newMesh.quaternion.premultiply(asteroid.quat);
      newMesh.scale.copy(asteroid.scale);

      app.add(newMesh);
      newMesh.updateMatrixWorld();

      let physicsId = physics.addGeometry(newMesh);
      physicsIds.push(physicsId);
      newMesh.physicsId = physicsId;

      asteroid.mesh = newMesh;
      asteroid.physicsObject = physicsId;
    }
    console.log(asteroids);
    
    app.updateMatrixWorld();
  })();


  useCleanup(() => {
    for (const physicsId of physicsIds) {
      physics.removeGeometry(physicsId);
    }
  });






  useFrame(({ timeDiff, timestamp }) => {

    if(asteroids[1].physicsObject) {
      //physics.addTorque(asteroids[1].physicsObject, v1, true);

      asteroids[1].physicsObject.quaternion.premultiply(q1);
      asteroids[1].physicsObject.updateMatrixWorld();
      asteroids[1].physicsObject.needsUpdate = true;

      asteroids[1].mesh.quaternion.copy(asteroids[1].physicsObject.quaternion);

      console.log(asteroids[1].physicsObject.quaternion);
    }

    // Resets character position to spawn position
    if(localPlayer.position.y < -50) {
      physics.setCharacterControllerPosition(localPlayer.characterController, defaultSpawn);
    }

    app.updateMatrixWorld();
  });



  return app;
};