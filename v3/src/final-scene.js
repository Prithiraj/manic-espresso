import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function frameForWidth(width) {
  if (width < 520) {
    return {
      fov: 38,
      camera: new THREE.Vector3(4.7, 3.55, 7.8),
      lookAt: new THREE.Vector3(-0.25, 0.05, 0.0),
      modelPosition: new THREE.Vector3(0.15, -0.22, 0.0),
      modelScale: 0.86,
      dpr: 1.2,
      shadowSize: 1024,
    };
  }
  if (width < 900) {
    return {
      fov: 35,
      camera: new THREE.Vector3(4.9, 3.65, 7.4),
      lookAt: new THREE.Vector3(-0.18, 0.06, 0.0),
      modelPosition: new THREE.Vector3(0.06, -0.20, 0.0),
      modelScale: 0.91,
      dpr: 1.35,
      shadowSize: 1536,
    };
  }
  return {
    fov: 32,
    camera: new THREE.Vector3(5.15, 3.75, 7.15),
    lookAt: new THREE.Vector3(-0.12, 0.04, 0.0),
    modelPosition: new THREE.Vector3(-0.08, -0.17, 0.0),
    modelScale: 1.0,
    dpr: 1.5,
    shadowSize: 2048,
  };
}

export function initFinalScene(canvas, host) {
  if (!canvas || !host || !('WebGLRenderingContext' in window)) {
    document.documentElement.dataset.v3FinalModel = 'fallback';
    return null;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      premultipliedAlpha: true,
    });
  } catch (error) {
    console.warn('V3 final WebGL unavailable:', error);
    document.documentElement.dataset.v3FinalModel = 'fallback';
    return null;
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xf3eee4, 10.5, 18.5);

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 35);
  const modelRoot = new THREE.Group();
  scene.add(modelRoot);

  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 16),
    new THREE.ShadowMaterial({ color: 0x58483c, opacity: 0.13 }),
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -0.40;
  shadowPlane.receiveShadow = true;
  scene.add(shadowPlane);

  const key = new THREE.DirectionalLight(0xffe3c8, 3.9);
  key.position.set(-4.8, 7.7, 5.9);
  key.castShadow = true;
  key.shadow.bias = -0.00025;
  key.shadow.normalBias = 0.026;
  key.shadow.radius = 4;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 24;
  key.shadow.camera.left = -5.5;
  key.shadow.camera.right = 5.5;
  key.shadow.camera.top = 5.5;
  key.shadow.camera.bottom = -4.5;
  scene.add(key);

  scene.add(new THREE.HemisphereLight(0xfffaf1, 0x51483f, 1.02));
  scene.add(new THREE.AmbientLight(0xfff4e5, 0.12));

  let frame = frameForWidth(host.clientWidth || window.innerWidth);
  let mixer = null;
  let actions = [];
  let disposed = false;
  let visible = false;

  const scrubStatic = () => {
    for (const { action } of actions) {
      action.paused = true;
      action.time = 0;
    }
    mixer?.update(0);
  };

  const render = () => {
    if (!disposed) renderer.render(scene, camera);
  };

  const applyFrame = () => {
    const rect = host.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    frame = frameForWidth(width);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, frame.dpr));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = frame.fov;
    camera.position.copy(frame.camera);
    camera.lookAt(frame.lookAt);
    camera.updateProjectionMatrix();

    modelRoot.position.copy(frame.modelPosition);
    modelRoot.scale.setScalar(frame.modelScale);
    modelRoot.rotation.set(0, -0.10, -0.008);

    if (key.shadow.mapSize.x !== frame.shadowSize) {
      key.shadow.mapSize.set(frame.shadowSize, frame.shadowSize);
      if (key.shadow.map) {
        key.shadow.map.dispose();
        key.shadow.map = null;
      }
    }

    scrubStatic();
    render();
  };

  const loader = new GLTFLoader();
  loader.load(
    `${import.meta.env.BASE_URL}models/manic-final.glb`,
    (gltf) => {
      if (disposed) return;
      const model = gltf.scene;
      model.name = 'BlenderFinalModel';
      model.traverse((object) => {
        if (!object.isMesh) return;
        object.castShadow = !object.name.includes('SLAB');
        object.receiveShadow = true;
      });
      modelRoot.add(model);

      if (gltf.animations?.length) {
        mixer = new THREE.AnimationMixer(model);
        actions = gltf.animations
          .filter((clip) => clip.name.startsWith('ACT_FINAL_'))
          .map((clip) => {
            const action = mixer.clipAction(clip);
            action.play();
            action.paused = true;
            action.time = 0;
            return { action, duration: clip.duration, name: clip.name };
          });
        document.documentElement.dataset.v3FinalClips = actions.map(({ name }) => name).sort().join(',');
      }

      host.classList.add('final-model-ready');
      document.documentElement.dataset.v3FinalModel = 'ready';
      applyFrame();
    },
    undefined,
    (error) => {
      console.warn('V3 final GLB failed:', error);
      host.classList.add('final-model-failed');
      document.documentElement.dataset.v3FinalModel = 'fallback';
    },
  );

  const observer = new IntersectionObserver((entries) => {
    visible = Boolean(entries[0]?.isIntersecting);
    if (visible) render();
  }, { threshold: 0.02 });
  observer.observe(host);

  const resizeObserver = new ResizeObserver(() => {
    if (visible) applyFrame();
  });
  resizeObserver.observe(host);

  return () => {
    disposed = true;
    observer.disconnect();
    resizeObserver.disconnect();
    mixer?.stopAllAction();
    renderer.dispose();
  };
}
