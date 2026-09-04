import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function frameForWidth(width) {
  if (width < 520) {
    return {
      fov: 38,
      camera: new THREE.Vector3(5.6, 3.8, 7.8),
      lookAt: new THREE.Vector3(0.0, 0.95, 0.05),
      modelPosition: new THREE.Vector3(0.30, -0.42, 0.10),
      modelScale: 0.72,
      dpr: 1.2,
      shadowSize: 1024
    };
  }
  if (width < 900) {
    return {
      fov: 35,
      camera: new THREE.Vector3(5.8, 3.9, 7.2),
      lookAt: new THREE.Vector3(0.0, 0.92, 0.02),
      modelPosition: new THREE.Vector3(0.15, -0.34, 0.05),
      modelScale: 0.82,
      dpr: 1.35,
      shadowSize: 1536
    };
  }
  return {
    fov: 31.5,
    camera: new THREE.Vector3(6.15, 4.2, 6.85),
    lookAt: new THREE.Vector3(0.0, 0.92, 0.0),
    modelPosition: new THREE.Vector3(0.08, -0.30, 0.0),
    modelScale: 0.91,
    dpr: 1.5,
    shadowSize: 2048
  };
}

export function initCafeScene(canvas, host) {
  if (!canvas || !host || !('WebGLRenderingContext' in window)) {
    document.documentElement.dataset.v3CafeModel = 'fallback';
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
    console.warn('V3 Cafe WebGL unavailable:', error);
    document.documentElement.dataset.v3CafeModel = 'fallback';
    return null;
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xf3eee4, 11.5, 20.0);

  const camera = new THREE.PerspectiveCamera(31.5, 1, 0.1, 45);
  const modelRoot = new THREE.Group();
  modelRoot.name = 'V3CafeRoot';
  scene.add(modelRoot);

  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 18),
    new THREE.ShadowMaterial({ color: 0x5a493e, opacity: 0.13 })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -0.47;
  shadowPlane.receiveShadow = true;
  scene.add(shadowPlane);

  const key = new THREE.DirectionalLight(0xffe1c6, 4.0);
  key.position.set(-5.2, 8.2, 6.3);
  key.castShadow = true;
  key.shadow.bias = -0.00026;
  key.shadow.normalBias = 0.026;
  key.shadow.radius = 4;
  key.shadow.camera.near = 0.6;
  key.shadow.camera.far = 26;
  key.shadow.camera.left = -6.0;
  key.shadow.camera.right = 6.0;
  key.shadow.camera.top = 6.2;
  key.shadow.camera.bottom = -4.8;
  scene.add(key);

  scene.add(new THREE.HemisphereLight(0xfffaf0, 0x4b423c, 1.02));
  scene.add(new THREE.AmbientLight(0xfff5e7, 0.13));

  let model = null;
  let disposed = false;

  const render = () => {
    if (!disposed) renderer.render(scene, camera);
  };

  const applyFrame = () => {
    const rect = host.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const frame = frameForWidth(width);

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
    modelRoot.rotation.set(0, -0.08, -0.01);
    render();
  };

  const loader = new GLTFLoader();
  loader.load(
    `${import.meta.env.BASE_URL}models/manic-cafe.glb`,
    (gltf) => {
      if (disposed) return;
      model = gltf.scene;
      model.name = 'BlenderCafeModel';
      model.traverse((object) => {
        if (!object.isMesh) return;
        object.castShadow = !object.name.includes('FLOOR') && !object.name.includes('CHALK_STROKE');
        object.receiveShadow = true;
      });
      modelRoot.add(model);
      host.classList.add('cafe-model-ready');
      document.documentElement.dataset.v3CafeModel = 'ready';
      applyFrame();
    },
    undefined,
    (error) => {
      console.warn('V3 Blender Cafe model failed to load:', error);
      host.classList.add('cafe-model-failed');
      document.documentElement.dataset.v3CafeModel = 'fallback';
      render();
    }
  );

  const resizeObserver = new ResizeObserver(applyFrame);
  resizeObserver.observe(host);
  applyFrame();

  return () => {
    disposed = true;
    resizeObserver.disconnect();
    model?.traverse((object) => {
      if (!object.isMesh) return;
      object.geometry?.dispose?.();
      if (Array.isArray(object.material)) object.material.forEach((mat) => mat.dispose?.());
      else object.material?.dispose?.();
    });
    renderer.dispose();
  };
}
