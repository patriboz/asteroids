import * as THREE from 'three';
import {Vector3,Vector4,TextureLoader,Group,AdditiveBlending,Object3D} from 'three';
// import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  Bezier, ColorOverLife, ColorRange,
  ConeEmitter,DonutEmitter, ConstantColor, ConstantValue, FrameOverLife,
  IntervalValue,
  PiecewiseBezier, PointEmitter, RandomColor,
  RenderMode, RotationOverLife,
  SizeOverLife, ParticleSystem, ParticleEmitter, BatchedParticleRenderer
} from "https://patriboz.github.io/asteroids/three.quarks.esm.js";

import metaversefile from 'metaversefile';

const { useApp, useFrame, useInternals, useLocalPlayer, useLoaders, usePhysics, useCleanup, useActivate, useCamera } = metaversefile;

const baseUrl = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');


class DustParticles {

  batchRenderer = null;
  groups = [];
  totalTime = 0;
  refreshIndex = 0;
  texture = null;
  isPlaying = true;

  render(delta) {

      this.groups.forEach(group =>
          group.traverse(object => {
              if (object instanceof ParticleEmitter) {
                  object.system.update(delta);
              }
          })
      );

      this.totalTime += delta;
      if (this.totalTime > 1) {
          this.totalTime = 0;
          this.refreshIndex = 0;
      }

      if (this.batchRenderer)
          this.batchRenderer.update();
  }

  rgbToVec(rgb) {
      return new Vector4(rgb.x / 255, rgb.y / 255, rgb.z / 255, 0.2);
  }

  initMuzzleEffect(index) {
      const group = new Group();
  
  const scaleFactor = 10;

      const flash = new ParticleSystem(this.batchRenderer, {
          duration: 1,
          looping: true,
          startLife: new IntervalValue(2.0, 50.0),
          startSpeed: new IntervalValue(0.1, 0.35),
          startSize: new IntervalValue(scaleFactor, scaleFactor),
          startColor: new ConstantColor(this.rgbToVec(new THREE.Vector3(84, 84, 84))),
          worldSpace: false,
          maxParticle: 5,
          //emissionOverTime: new ConstantValue(10),
          emissionOverTime: new IntervalValue(0.0,20.0),
          shape: new ConeEmitter({radius:3*scaleFactor,arc:6.283,thickness:1,angle:0.8}),
          texture: this.texture,
          blending: AdditiveBlending,
          renderMode: RenderMode.BillBoard,
          renderOrder: 2,
      });
      //flash.addBehavior(new ColorOverLife(new ColorRange(new Vector4(0.0, 0.0, 0.0, 1), new Vector4(0.0, 0.0, 0.0, 0))));
      flash.addBehavior(new ColorOverLife(new ColorRange(this.rgbToVec(new THREE.Vector3(84, 84, 84)), this.rgbToVec(new THREE.Vector3(166, 86, 0)))));
      //flash.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.95, 0.75, 0.5), 0]])));
      flash.emitter.name = 'flash';
    flash.emitter.rotation.set(1.5707963267948966, 0, 0);
    //flash.emitter.position.set(0,0,0);
      //flash.emitter.system.endEmit();
      //flash.emitter.system.restart();
      group.add(flash.emitter);

      group.visible = false;
  //group.scale.set(0.01,0.01,0.01);
      this.scene.add(group);
      this.groups.push(group);
      group.updateMatrixWorld();
  

  }

  loadingFinished()
  {
      this.batchRenderer = new BatchedParticleRenderer();
      this.scene.add(this.batchRenderer);

      for (let i = 0; i < 100; i++) {
          this.initMuzzleEffect(i);
      }
  }

  initScene(tmpScene) {
      this.scene = tmpScene;

      this.texture = new TextureLoader().load("https://patriboz.github.io/asteroids/assets/textures/dust.png", (texture) => {
          this.texture.name = "smoke.png";
          this.loadingFinished();
      })   
      return this.scene;
  }

  setPosition(pos) {
    if (this.batchRenderer)
    {
      this.batchRenderer.position.copy(pos);
            this.batchRenderer.updateMatrixWorld();
    }
  }

}





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

  


  var dust = new DustParticles();
  dust.initScene(app);

  //console.log(itemPos);

  //demo.setPosition(new Vector3(0,0,0));

  dust.setPosition(0, 1, 0);







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
      this.sound.setRefDistance( 5 );
      this.sound.setMaxDistance( 5 );
      this.sound.setDistanceModel('exponential');
      this.sound.play();
      this.mesh.children[0].children[0].children[0].add(this.sound);

      this.velocityX = Math.random() * 0.5 + 0.5;
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
    let gltf = await new Promise((accept, reject) => {
        const {gltfLoader} = useLoaders();
        const url = 'https://patriboz.github.io/asteroids/assets/rock/scene.gltf';
        gltfLoader.load(url, accept, function onprogress() {}, reject);
    });

    let mesh = gltf.scene;

    let soundBuffer = await new Promise((accept, reject) => {
      const audioLoader = new THREE.AudioLoader();
      const url = 'https://patriboz.github.io/asteroids/assets/audio/white-noise.mp3';
      audioLoader.load(url, accept, function onprogress() {}, reject);
    });

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

  const startTime = Date.now();
  let lastTimestamp = startTime;
  let lastFoundObj;
  useFrame(({ timeDiff, timestamp }) => {

    if(localPlayer.avatar) {
      moveAsteroids();

//
      const now = Date.now();
    const timeDiff = (now - lastTimestamp) / 1000.0;
    lastTimestamp = now;
    demo.render(timeDiff);
//

      // https://github.com/webaverse/bridge-section/blob/main/index.js
      const downQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI*0.5);
        const resultDown = physics.raycast(localPlayer.position, downQuat);
        if(resultDown && localPlayer.characterPhysics.lastGroundedTime === timestamp) {
          let foundObj = metaversefile.getPhysicsObjectByPhysicsId(resultDown.objectId);
          if(foundObj && !(lastFoundObj === foundObj)) {
            lastFoundObj = foundObj;
            console.log(localPlayer.position);
          }
        }

      // Resets character position to spawn position
      if(localPlayer.position.y < -50) {
        physics.setCharacterControllerPosition(localPlayer.characterController, defaultSpawn);
      }
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

    for(let i = 0; i < 10; i++) {
      localMatrix.compose(
        localVector.randomDirection().multiplyScalar(10).addScalar(7),
        localQuaternion.random(),
        localVector2.random().divideScalar(12)
      );
      new MovingSoundAsteroid(app, mesh, localMatrix, localEuler, movingAsteroids, soundBuffer);
    }
  };

  return app;
};

/*,
    {
      "position": [0, 0, 0],
      "quaternion": [0, 0, 0, 1],
      "start_url": "https://webaverse.github.io/dust-particles/"
    } */