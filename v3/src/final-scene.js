import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const smoothstep = (value) => value * value * (3 - 2 * value);

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
      cameraOut: new THREE.Vector3(0.18, 0.12, 0.34),
      lookShift: new THREE.Vector3(0.10, 0.02, 0.05),
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
      cameraOut: new THREE.Vector3(0.20, 0.14, 0.38),
      lookShift: new THREE.Vector3(0.12, 0.03, 0.06),
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
    cameraOut: new THREE.Vector3(0.23, 0.16, 0.42),
    lookShift: new THREE.Vector3(0.14, 0.04, 0.07),
  };
}

export function initFinalScene(canvas, host) {
  if (!canvas || !host || !('WebGLRenderingContext' in window)) {
    document.documentElement.dataset.v3FinalModel = 'fallback';
    return null;
  }

  const section = host.closest('.final-cta') || host;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  const keyBase = key.position.clone();
  let frame = frameForWidth(host.clientWidth || window.innerWidth);
  let mixer = null;
  let actions = [];
  let disposed = false;
  let visible = false;
  let targetProgress = 0;
  let progress = 0;
  let raf = 0;

  const scrub = (value) => {
    for (const { action, duration } of actions) {
      action.paused = true;
      action.time = reducedMotion ? 0 : duration * value;
    }
    mixer?.update(0);
  };

  const render = () => {
    if (!disposed) renderer.render(scene, camera);
  };

  const applyMotionFrame = (value) => {
    const eased = reducedMotion ? 0 : smoothstep(value);
    camera.position.set(
      frame.camera.x + frame.cameraOut.x * eased,
      frame.camera.y + frame.cameraOut.y * eased,
      frame.camera.z + frame.cameraOut.z * eased,
    );
    const look = frame.lookAt.clone().addScaledVector(frame.lookShift, eased);
    camera.lookAt(look);

    modelRoot.position.set(
      frame.modelPosition.x + eased * 0.02,
      frame.modelPosition.y - eased * 0.018,
      frame.modelPosition.z,
    );
    modelRoot.scale.setScalar(frame.modelScale * (1 - eased * 0.018));
    modelRoot.rotation.set(0, -0.10 + eased * 0.018, -0.008);

    key.position.set(
      keyBase.x + eased * 0.24,
      keyBase.y + eased * 0.12,
      keyBase.z - eased * 0.20,
    );
    shadowPlane.material.opacity = 0.13 - eased * 0.012;
    host.style.setProperty('--final-photo-shift', `${-6 * eased}px`);
    host.style.setProperty('--final-photo-scale', String(1 + 0.018 * eased));

    scrub(eased);
    render();
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
    camera.updateProjectionMatrix();

    if (key.shadow.mapSize.x !== frame.shadowSize) {
      key.shadow.mapSize.set(frame.shadowSize, frame.shadowSize);
      if (key.shadow.map) {
        key.shadow.map.dispose();
        key.shadow.map = null;
      }
    }

    if (reducedMotion) {
      progress = 0;
      targetProgress = 0;
    }
    applyMotionFrame(progress);
  };

  const updateScroll = () => {
    if (reducedMotion) return;
    const rect = section.getBoundingClientRect();
    const viewport = window.innerHeight || 800;
    const start = viewport * 0.88;
    const end = viewport * 0.18;
    targetProgress = clamp((start - rect.top) / Math.max(1, start - end), 0, 1);
    startLoop();
  };

  const tick = () => {
    if (disposed || reducedMotion || !visible || document.hidden) {
      raf = 0;
      return;
    }
    progress += (targetProgress - progress) * 0.09;
    if (Math.abs(targetProgress - progress) < 0.0005) progress = targetProgress;
    applyMotionFrame(progress);
    if (Math.abs(targetProgress - progress) > 0.0001) raf = requestAnimationFrame(tick);
    else raf = 0;
  };

  const startLoop = () => {
    if (!reducedMotion && visible && !raf && !document.hidden) raf = requestAnimationFrame(tick);
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
      updateScroll();
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
    if (visible) {
      updateScroll();
      startLoop();
    }
  }, { threshold: 0.02 });
  observer.observe(section);

  const resizeObserver = new ResizeObserver(() => {
    if (visible) applyFrame();
  });
  resizeObserver.observe(host);

  if (!reducedMotion) window.addEventListener('scroll', updateScroll, { passive: true });

  return () => {
    disposed = true;
    if (raf) cancelAnimationFrame(raf);
    observer.disconnect();
    resizeObserver.disconnect();
    if (!reducedMotion) window.removeEventListener('scroll', updateScroll);
    mixer?.stopAllAction();
    renderer.dispose();
  };
}
