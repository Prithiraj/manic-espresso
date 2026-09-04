import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function frameForWidth(width) {
  if (width < 520) {
    return {
      fov: 37,
      camera: new THREE.Vector3(4.3, 3.0, 7.9),
      lookAt: new THREE.Vector3(0.35, 0.05, 0.15),
      modelPosition: new THREE.Vector3(0.95, -0.36, 0.05),
      modelScale: 0.86,
      dpr: 1.25,
      shadowSize: 1024
    };
  }
  if (width < 900) {
    return {
      fov: 34,
      camera: new THREE.Vector3(4.25, 2.85, 7.2),
      lookAt: new THREE.Vector3(0.35, 0.02, 0.08),
      modelPosition: new THREE.Vector3(0.75, -0.28, 0.0),
      modelScale: 0.93,
      dpr: 1.4,
      shadowSize: 1536
    };
  }
  return {
    fov: 31.5,
    camera: new THREE.Vector3(4.35, 2.75, 6.7),
    lookAt: new THREE.Vector3(0.28, -0.02, 0.02),
    modelPosition: new THREE.Vector3(0.72, -0.22, 0.0),
    modelScale: 1.02,
    dpr: 1.6,
    shadowSize: 2048
  };
}

export function initHeroScene(canvas, host) {
  if (!canvas || !host || !('WebGLRenderingContext' in window)) {
    document.documentElement.dataset.v3Model = 'fallback';
    return null;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      premultipliedAlpha: true
    });
  } catch (error) {
    console.warn('V3 WebGL unavailable:', error);
    document.documentElement.dataset.v3Model = 'fallback';
    return null;
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.04;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xf3eee4, 9.8, 17.2);

  const camera = new THREE.PerspectiveCamera(31.5, 1, 0.1, 40);
  const modelRoot = new THREE.Group();
  modelRoot.name = 'V3HeroRoot';
  scene.add(modelRoot);

  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 18),
    new THREE.ShadowMaterial({ color: 0x514237, opacity: 0.14 })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -0.55;
  shadowPlane.receiveShadow = true;
  scene.add(shadowPlane);

  const key = new THREE.DirectionalLight(0xffe5c9, 4.1);
  key.position.set(-4.8, 7.6, 5.7);
  key.castShadow = true;
  key.shadow.bias = -0.00024;
  key.shadow.normalBias = 0.026;
  key.shadow.radius = 4;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 24;
  key.shadow.camera.left = -5.4;
  key.shadow.camera.right = 5.4;
  key.shadow.camera.top = 5.5;
  key.shadow.camera.bottom = -4.2;
  scene.add(key);

  const fill = new THREE.HemisphereLight(0xfffbf1, 0x5c514a, 1.08);
  scene.add(fill);

  const ambient = new THREE.AmbientLight(0xfff7e9, 0.17);
  scene.add(ambient);

  let model = null;
  let mixer = null;
  let frame = frameForWidth(host.clientWidth || window.innerWidth);
  let disposed = false;

  const render = () => {
    if (disposed) return;
    renderer.render(scene, camera);
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

    if (key.shadow.mapSize.x !== frame.shadowSize) {
      key.shadow.mapSize.set(frame.shadowSize, frame.shadowSize);
      if (key.shadow.map) {
        key.shadow.map.dispose();
        key.shadow.map = null;
      }
    }

    modelRoot.position.copy(frame.modelPosition);
    modelRoot.scale.setScalar(frame.modelScale);
    modelRoot.rotation.set(0, -0.19, -0.015);
    render();
  };

  const loader = new GLTFLoader();
  const modelUrl = `${import.meta.env.BASE_URL}models/manic-hero.glb`;

  loader.load(
    modelUrl,
    (gltf) => {
      if (disposed) return;
      model = gltf.scene;
      model.name = 'BlenderHeroModel';
      model.traverse((object) => {
        if (!object.isMesh) return;
        object.castShadow = object.name !== 'GEO_COFFEE' && object.name !== 'GEO_CREMA';
        object.receiveShadow = true;
      });
      modelRoot.add(model);

      if (gltf.animations?.length) {
        mixer = new THREE.AnimationMixer(model);
        for (const clip of gltf.animations) {
          const action = mixer.clipAction(clip);
          action.play();
          action.paused = true;
          action.time = 0;
        }
        mixer.update(0);
      }

      host.classList.add('model-ready');
      document.documentElement.dataset.v3Model = 'ready';
      applyFrame();
    },
    undefined,
    (error) => {
      console.warn('V3 Blender hero failed to load:', error);
      host.classList.add('model-failed');
      document.documentElement.dataset.v3Model = 'fallback';
      render();
    }
  );

  const resizeObserver = new ResizeObserver(applyFrame);
  resizeObserver.observe(host);
  applyFrame();

  return () => {
    disposed = true;
    resizeObserver.disconnect();
    mixer?.stopAllAction();
    model?.traverse((object) => {
      if (!object.isMesh) return;
      object.geometry?.dispose?.();
      if (Array.isArray(object.material)) object.material.forEach((mat) => mat.dispose?.());
      else object.material?.dispose?.();
    });
    renderer.dispose();
  };
}
