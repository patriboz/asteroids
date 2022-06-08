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
  let physicsIds = [];

  const localVector = new THREE.Vector3();
  const localVector2 = new THREE.Vector3();
  const localQuaternion = new THREE.Quaternion();
  const localMatrix = new THREE.Matrix4();

  class Asteroid {
    constructor(app, mesh, localMatrix) {
      this.app = app;
      this.mesh = mesh.clone();
      this.mesh.applyMatrix4(localMatrix);
      this.app.add(this.mesh);
      this.mesh.updateMatrixWorld();
    }
  }

  class PhysicalAsteroid extends Asteroid {
    constructor(app, mesh, localMatrix, physics, physicsIds) {
      super(app, mesh, localMatrix);

      this.physicsId = physics.addGeometry(this.mesh);
      physicsIds.push(this.physicsId);
    }
  }

  const defaultSpawn = new THREE.Vector3(0, 5, 0);
  

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
    const url = `https://patriboz.github.io/asteroids/assets/rock/scene.gltf`;
    let gltf = await new Promise((accept, reject) => {
        const {gltfLoader} = useLoaders();
        gltfLoader.load(url, accept, function onprogress() {}, reject);
        
    });

    let mesh = gltf.scene;

    for(const asteroid of asteroids) {
    
      // let newMesh = mesh.clone();

      // newMesh.applyMatrix4(localMatrix.compose(asteroid.position, asteroid.quat, asteroid.scale));

      // app.add(newMesh);
      // newMesh.updateMatrixWorld();

      // let physicsId = physics.addGeometry(newMesh);
      // physicsIds.push(physicsId);
      // newMesh.physicsId = physicsId;

      // asteroid.mesh = newMesh;
      // asteroid.physicsObject = physicsId;

      localMatrix.compose(asteroid.position, asteroid.quat, asteroid.scale);
      new PhysicalAsteroid(app, mesh, localMatrix, physics, physicsIds);
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



console.log(app);
console.log(metaversefile);


  const createAsteroidField = (mesh) => {
    for(let i = 0; i < 50; i++) {
      localMatrix.compose(
        localVector.randomDirection().multiplyScalar(100).addScalar(30),
        localQuaternion.random(),
        localVector2.random().divideScalar(10)
      );
      new Asteroid(app, mesh, localMatrix);
    }
  };

  return app;
};