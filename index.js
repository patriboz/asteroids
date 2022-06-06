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
  const textureLoader = new THREE.TextureLoader();

  const defaultSpawn = new THREE.Vector3(0, 5, 0);
  let physicsIds = [];
  let asteroids = [
    {position: new THREE.Vector3(0, 0, 0), quat: new THREE.Quaternion(0, 0, 0, 1), scale: new THREE.Vector3(0.04, 0.04, 0.04)},
    {position: new THREE.Vector3(5, 0, 0), quat: new THREE.Quaternion(0, 0, 0, 1), scale: new THREE.Vector3(0.04, 0.04, 0.04)},
    {position: new THREE.Vector3(10, 0, 0), quat: new THREE.Quaternion(0, 0, 0, 1), scale: new THREE.Vector3(0.04, 0.04, 0.04)}
  ];
  

  (async () => {
    const url = `https://patriboz.github.io/asteroids/assets/rock/scene.gltf`; // todo: relative path?
    let gltf = await new Promise((accept, reject) => {
        const {gltfLoader} = useLoaders();
        gltfLoader.load(url, accept, function onprogress() {}, reject);
        
    });

    let mesh = gltf.scene;
//
    // mesh.scale.set(0.04, 0.04, 0.04);

    // let physicsId = physics.addGeometry(mesh);
    // physicsIds.push(physicsId);
    // mesh.physicsId = physicsId;
    

    // let mesh2 = mesh.clone();
    // mesh2.scale.set(0.04, 0.04, 0.04);
    // mesh2.position.set(10, 0, 0);
    // physicsId = physics.addGeometry(mesh2);
    // physicsIds.push(physicsId);
    // mesh2.physicsId = physicsId;


    // app.add(mesh, mesh2);
//
    


    for(const asteroid of asteroids) {
    
      let newMesh = mesh.clone();
      newMesh.position.set(asteroid.position.x, asteroid.position.y, asteroid.position.z);
      
      //newMesh.applyQuaternion(asteroid.quat);
      newMesh.scale.set(asteroid.scale.x, asteroid.scale.y, asteroid.scale.z);
console.log(newMesh);
      app.add(newMesh);
      newMesh.updateMatrixWorld();

      let physicsId = physics.addGeometry(newMesh);
      physicsIds.push(physicsId);
      newMesh.physicsId = physicsId;

      
    }

    
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
    if(localPlayer.position.y < -10) {
      physics.setCharacterControllerPosition(localPlayer.characterController, defaultSpawn);
    }

    
  });



  return app;
};