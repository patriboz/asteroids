import * as THREE from 'three';

import metaversefile from 'metaversefile';

const { useApp, useFrame, useInternals, useLocalPlayer, useLoaders, usePhysics, useCleanup, useActivate, useCamera } = metaversefile;

const baseUrl = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');

export default () => {
  const app = useApp();
  const { renderer, camera } = useInternals();
  const localPlayer = useLocalPlayer();
  const physics = usePhysics();
  const textureLoader = new THREE.TextureLoader();

  const defaultSpawn = new THREE.Vector3(0, 100, 0);
  let physicsIds = [];
  

  (async () => {
    const url = `https://patriboz.github.io/landscape/assets/rock/scene.gltf`; // must prefix "/bride-game" when working locally
    let gltf = await new Promise((accept, reject) => {
        const {gltfLoader} = useLoaders();
        gltfLoader.load(url, accept, function onprogress() {}, reject);
        
    });

    const mesh = gltf.scene;

    const physicsId = physics.addGeometry(mesh);
    physicsIds.push(physicsId);
    mesh.physicsId = physicsId;
    app.add(mesh);
    app.updateMatrixWorld();
})();


useCleanup(() => {
  // for (const physicsId of physicsIds) {
  //   physics.removeGeometry(physicsId);
  // }
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