import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function frameForWidth(width) {
  if (width < 520) {
    return {
      fov: 40,
      camera: new THREE.Vector3(4.9, 4.25, 7.9),
      lookAt: new THREE.Vector3(0.05, 0.05, 0.0),
      modelPosition: new THREE.Vector3(0.0, -0.16, 0.0),
      modelScale: 0.78,
      dpr: 1.2,
      shadowSize: 1024,
    };
  }
  if (width < 900) {
    return {
      fov: 36,
      camera: new THREE.Vector3(5.2, 4.35, 7.5),
      lookAt: new THREE.Vector3(0.0, 0.06, 0.0),
      modelPosition: new THREE.Vector3(0.0, -0.13, 0.0),
      modelScale: 0.88,
      dpr: 1.35,
      shadowSize: 1536,
    };
  }
  return {
    fov: 32.5,
    camera: new THREE.Vector3(5.45, 4.55, 7.25),
    lookAt: new THREE.Vector3(0.02, 0.08, 0.0),
    modelPosition: new THREE.Vector3(0.0, -0.12, 0.0),
    modelScale: 0.98,
    dpr: 1.5,
    shadowSize: 2048,
  };
}

export function initVisitScene(canvas, host) {
  if (!canvas || !host || !('WebGLRenderingContext' in window)) {
    document.documentElement.dataset.v3VisitModel = 'fallback';
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
    console.warn('V3 Visit WebGL unavailable:', error);
    document.documentElement.dataset.v3VisitModel = 'fallback';
    return null;
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.04;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xf3eee4, 11.5, 19.5);
  const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 40);
  const modelRoot = new THREE.Group();
  scene.add(modelRoot);

  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 18),
    new THREE.ShadowMaterial({ color: 0x5d4a3d, opacity: 0.14 }),
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -0.37;
  shadowPlane.receiveShadow = true;
  scene.add(shadowPlane);

  const key = new THREE.DirectionalLight(0xffdfbf, 4.1);
  key.position.set(-5.4, 8.4, 5.5);
  key.castShadow = true;
  key.shadow.bias = -0.00025;
  key.shadow.normalBias = 0.025;
  key.shadow.radius = 4;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 27;
  key.shadow.camera.left = -6;
  key.shadow.camera.right = 6;
  key.shadow.camera.top = 6;
  key.shadow.camera.bottom = -5;
  scene.add(key);

  scene.add(new THREE.HemisphereLight(0xfffaf0, 0x51483f, 1.02));
  scene.add(new THREE.AmbientLight(0xfff3e2, 0.12));

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
    modelRoot.rotation.set(-0.01, -0.10, -0.012);

    if (key.shadow.mapSize.x !== frame.shadowSize) {
      key.shadow.mapSize.set(frame.shadowSize, frame.shadowSize);
      if (key.shadow.map) {
        key.shadow.map.dispose();
        key.shadow.map = null;
      }
    }
    render();
  };

  const loader = new GLTFLoader();
  loader.load(
    `${import.meta.env.BASE_URL}models/manic-visit.glb`,
    (gltf) => {
      if (disposed) return;
      gltf.scene.name = 'BlenderVisitModel';
      gltf.scene.traverse((object) => {
        if (!object.isMesh) return;
        object.castShadow = !object.name.includes('RELIEF_LINE');
        object.receiveShadow = true;
      });
      modelRoot.add(gltf.scene);
      host.classList.add('visit-model-ready');
      document.documentElement.dataset.v3VisitModel = 'ready';
      applyFrame();
    },
    undefined,
    (error) => {
      console.warn('V3 Visit GLB failed:', error);
      host.classList.add('visit-model-failed');
      document.documentElement.dataset.v3VisitModel = 'fallback';
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
