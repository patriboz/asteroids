import * as THREE from 'three';

import metaversefile from 'metaversefile';

const { useApp, useFrame, useInternals, useLocalPlayer, useLoaders, usePhysics, useCleanup, useActivate, useCamera } = metaversefile;

export default () => {
  const app = useApp();
  const { renderer, camera } = useInternals();
  const localPlayer = useLocalPlayer();
  const physics = usePhysics();
  const textureLoader = new THREE.TextureLoader();

  const defaultSpawn = new THREE.Vector3(0, 0, 0);
  let physicsIds = [];
  

  (async () => {
    const url = `./assets/rock/scene.gltf`; // must prefix "/bride-game" when working locally
    let gltf = await new Promise((accept, reject) => {
        const {gltfLoader} = useLoaders();
        gltfLoader.load(url, accept, function onprogress() {}, reject);
        
    });
    app.add(gltf.scene);
    app.updateMatrixWorld();
})();


useCleanup(() => {
  // for (const physicsId of physicsIds) {
  //   physics.removeGeometry(physicsId);
  // }
});






useFrame(({ timeDiff, timestamp }) => {

  if(localPlayer.avatar) {

    
            
  //   const downQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI*0.5);
  //   const resultDown = physics.raycast(localPlayer.position, downQuat);

  //   if(resultDown && localPlayer.characterPhysics.lastGroundedTime === timestamp) {
  //     let foundObj = metaversefile.getPhysicsObjectByPhysicsId(resultDown.objectId);
  //     if(foundObj) {
  //       if(foundObj.glassObj) {
  //         if(foundObj.glassObj.breakable) {
  //           if(foundObj.glassObj.audio) {
  //             foundObj.glassObj.audio.play();
  //             foundObj.glassObj.visible = false;
  //             physics.disableGeometry(foundObj);
  //             physics.disableGeometryQueries(foundObj);
  //           }

            
  //         }
  //       }
  //     }

  //   }
  // }

  // Resets character position to spawn position
  if(localPlayer.position.y < -25) {
    physics.setCharacterControllerPosition(localPlayer.characterController, defaultSpawn);
  }

  
});



  return app;
};