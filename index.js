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
  

  (async () => {
    const url = `https://patriboz.github.io/asteroids/assets/rock/scene.gltf`; // todo: relative path?
    let gltf = await new Promise((accept, reject) => {
        const {gltfLoader} = useLoaders();
        gltfLoader.load(url, accept, function onprogress() {}, reject);
        
    });

    let mesh = gltf.scene;

    for(const asteroid of asteroids) {
    
      let newMesh = mesh.clone();

      newMesh.position.set(asteroid.position.x, asteroid.position.y, asteroid.position.z);
      newMesh.quaternion.premultiply(asteroid.quat);
      newMesh.scale.set(asteroid.scale.x, asteroid.scale.y, asteroid.scale.z);

      app.add(newMesh);
      newMesh.updateMatrixWorld();

      let physicsId = physics.addGeometry(newMesh);
      physicsIds.push(physicsId);
      newMesh.physicsId = physicsId;

      asteroid.physicsObject = physicsId;
      //physics.setVelocity(physicsId, new THREE.Vector3(20, 0, 0), true);
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

    
    if(localPlayer.avatar) {

      
              
      
    }

    // Resets character position to spawn position
    if(localPlayer.position.y < -50) {
      physics.setCharacterControllerPosition(localPlayer.characterController, defaultSpawn);
    }

    
  });



  return app;
};