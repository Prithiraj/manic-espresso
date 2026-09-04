import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function frameForWidth(width) {
  if (width < 520) {
    return {
      fov: 43,
      camera: new THREE.Vector3(5.2, 5.8, 8.8),
      lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
      modelPosition: new THREE.Vector3(0.0, -0.10, 0.0),
      modelScale: 0.72,
      dpr: 1.15,
      shadowSize: 1024,
    };
  }
  if (width < 900) {
    return {
      fov: 38,
      camera: new THREE.Vector3(5.4, 5.55, 8.25),
      lookAt: new THREE.Vector3(0.0, 0.03, 0.0),
      modelPosition: new THREE.Vector3(0.0, -0.08, 0.0),
      modelScale: 0.86,
      dpr: 1.3,
      shadowSize: 1536,
    };
  }
  return {
    fov: 34,
    camera: new THREE.Vector3(5.65, 5.25, 7.75),
    lookAt: new THREE.Vector3(0.0, 0.05, 0.0),
    modelPosition: new THREE.Vector3(0.0, -0.05, 0.0),
    modelScale: 0.98,
    dpr: 1.5,
    shadowSize: 2048,
  };
}

export function initGalleryScene(canvas, host) {
  if (!canvas || !host || !('WebGLRenderingContext' in window)) {
    document.documentElement.dataset.v3GalleryModel = 'fallback';
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
    console.warn('V3 Gallery WebGL unavailable:', error);
    document.documentElement.dataset.v3GalleryModel = 'fallback';
    return null;
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.03;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xf3eee4, 11.5, 20.5);
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 42);
  const modelRoot = new THREE.Group();
  scene.add(modelRoot);

  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 18),
    new THREE.ShadowMaterial({ color: 0x44352a, opacity: 0.16 }),
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -0.38;
  shadowPlane.receiveShadow = true;
  scene.add(shadowPlane);

  const key = new THREE.DirectionalLight(0xffdfc2, 4.0);
  key.position.set(-5.0, 8.3, 6.2);
  key.castShadow = true;
  key.shadow.bias = -0.00026;
  key.shadow.normalBias = 0.026;
  key.shadow.radius = 4;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 27;
  key.shadow.camera.left = -6;
  key.shadow.camera.right = 6;
  key.shadow.camera.top = 6;
  key.shadow.camera.bottom = -5;
  scene.add(key);

  scene.add(new THREE.HemisphereLight(0xfffaf0, 0x42382f, 0.98));
  scene.add(new THREE.AmbientLight(0xfff2e0, 0.11));

  let frame = frameForWidth(host.clientWidth || window.innerWidth);
  let disposed = false;
  let visible = false;

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
    modelRoot.rotation.set(-0.015, -0.10, -0.012);

    if (key.shadow.mapSize.x !== frame.shadowSize) {
      key.shadow.mapSize.set(frame.shadowSize, frame.shadowSize);
      if (key.shadow.map) {
        key.shadow.map.dispose();
        key.shadow.map = null;
      }
    }
    render();
  };

  new GLTFLoader().load(
    `${import.meta.env.BASE_URL}models/manic-gallery.glb`,
    (gltf) => {
      if (disposed) return;
      gltf.scene.name = 'BlenderGalleryModel';
      gltf.scene.traverse((object) => {
        if (!object.isMesh) return;
        object.castShadow = !object.name.includes('TABLETOP') && !object.name.includes('COFFEE_RING');
        object.receiveShadow = true;
      });
      modelRoot.add(gltf.scene);
      host.classList.add('gallery-model-ready');
      document.documentElement.dataset.v3GalleryModel = 'ready';
      applyFrame();
    },
    undefined,
    (error) => {
      console.warn('V3 Gallery GLB failed:', error);
      host.classList.add('gallery-model-failed');
      document.documentElement.dataset.v3GalleryModel = 'fallback';
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
    renderer.dispose();
  };
}
