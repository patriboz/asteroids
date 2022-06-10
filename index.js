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
  const localEuler = new THREE.Euler();
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

  class MovingAsteroid extends Asteroid {
    constructor(app, mesh, localMatrix, localEuler, movingAsteroids) {
      super(app, mesh, localMatrix);

      this.velocityX = Math.random() ** 2;
      localEuler.set(Math.random() / 100, Math.random() / 100, Math.random() / 100, 'XYZ');
      this.rotation = new THREE.Quaternion().setFromEuler(localEuler);
      movingAsteroids.push(this);
    }
    move() {
      if(this.mesh.position.x > 300) {
        this.mesh.position.setX(-300);
      }
      this.mesh.position.setX(this.mesh.position.x + this.velocityX);
      this.mesh.quaternion.premultiply(this.rotation);
    }
  }

  class MovingSoundAsteroid extends Asteroid {
    constructor(app, mesh, localMatrix, localEuler, movingAsteroids, soundBuffer) {
      super(app, mesh, localMatrix);

      this.sound = new THREE.PositionalAudio(audioListener);
      this.sound.setBuffer(soundBuffer);
      this.sound.setLoop(true);
      this.sound.setRefDistance( 10 );
      //this.sound.setMaxDistance( 1 );
      // this.sound.setDistanceModel('exponential');
      this.sound.play();
      this.mesh.children[0].children[0].children[0].add(this.sound);

      this.velocityX = Math.random() ** 2;
      localEuler.set(Math.random() / 100, Math.random() / 100, Math.random() / 100, 'XYZ');
      this.rotation = new THREE.Quaternion().setFromEuler(localEuler);
      movingAsteroids.push(this);
    }
    move() {
      if(this.mesh.position.x > 300) {
        this.mesh.position.setX(-300);
      }
      this.mesh.position.setX(this.mesh.position.x + this.velocityX);
      this.mesh.quaternion.premultiply(this.rotation);
    }
  }

  const defaultSpawn = new THREE.Vector3(0, 5, 0);
  const movingAsteroids = [];

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

  
  const audioListener = new THREE.AudioListener();
  localPlayer.add(audioListener);

  




  (async () => {
    const url = `https://patriboz.github.io/asteroids/assets/rock/scene.gltf`;
    let gltf = await new Promise((accept, reject) => {
        const {gltfLoader} = useLoaders();
        gltfLoader.load(url, accept, function onprogress() {}, reject);
        
    });

    let mesh = gltf.scene;
console.log(mesh);
    let soundBuffer;
    let test = 1;

    await new Promise((accept, reject) => {
      const audioLoader = new THREE.AudioLoader();
      audioLoader.load( 'https://patriboz.github.io/asteroids/assets/audio/white-noise.mp3', function( buffer ) {
        soundBuffer = buffer;
        console.log(test);
        accept();
      });
    })
    
    
    console.log(soundBuffer);
    console.log(useLoaders());

    for(const asteroid of asteroids) {
      localMatrix.compose(asteroid.position, asteroid.quat, asteroid.scale);
      new PhysicalAsteroid(app, mesh, localMatrix, physics, physicsIds);
    }

    createAsteroidField(mesh, soundBuffer);
    app.updateMatrixWorld();
  })();


  useCleanup(() => {
    for (const physicsId of physicsIds) {
      physics.removeGeometry(physicsId);
    }
  });  

  useFrame(({ timeDiff, timestamp }) => {

    moveAsteroids();

    // Resets character position to spawn position
    if(localPlayer.position.y < -50) {
      physics.setCharacterControllerPosition(localPlayer.characterController, defaultSpawn);
    }

    app.updateMatrixWorld();
  });



  const moveAsteroids = () => {
    for (const asteroid of movingAsteroids) {
      asteroid.move();
    }
  };

  const createAsteroidField = (mesh, soundBuffer) => {
    for(let i = 0; i < 100; i++) {
      localMatrix.compose(
        localVector.randomDirection().multiplyScalar(100).addScalar(30),
        localQuaternion.random(),
        localVector2.random().divideScalar(10)
      );
      new Asteroid(app, mesh, localMatrix);
    }

    for(let i = 0; i < 80; i++) {
      localMatrix.compose(
        localVector.randomDirection().multiplyScalar(100).addScalar(30),
        localQuaternion.random(),
        localVector2.random().divideScalar(10)
      );
      new MovingAsteroid(app, mesh, localMatrix, localEuler, movingAsteroids);
    }

    for(let i = 0; i < 20; i++) {
      localMatrix.compose(
        localVector.randomDirection().multiplyScalar(10).addScalar(10),
        localQuaternion.random(),
        localVector2.random().divideScalar(10)
      );
      new MovingSoundAsteroid(app, mesh, localMatrix, localEuler, movingAsteroids, soundBuffer);
    }
  };

  return app;
};