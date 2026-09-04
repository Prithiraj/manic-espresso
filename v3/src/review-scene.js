import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const smoothstep = (value) => value * value * (3 - 2 * value);

function frameForWidth(width) {
  if (width < 520) {
    return {
      fov: 40,
      camera: new THREE.Vector3(4.25, 4.15, 7.8),
      lookAt: new THREE.Vector3(0.15, 0.02, 0.0),
      modelPosition: new THREE.Vector3(0.12, -0.12, 0.0),
      modelScale: 0.80,
      dpr: 1.15,
      shadowSize: 1024,
      cameraMove: new THREE.Vector3(-0.12, 0.14, -0.16),
    };
  }
  if (width < 900) {
    return {
      fov: 36,
      camera: new THREE.Vector3(4.45, 4.05, 7.35),
      lookAt: new THREE.Vector3(0.12, 0.04, 0.0),
      modelPosition: new THREE.Vector3(0.06, -0.10, 0.0),
      modelScale: 0.90,
      dpr: 1.3,
      shadowSize: 1536,
      cameraMove: new THREE.Vector3(-0.18, 0.20, -0.22),
    };
  }
  return {
    fov: 32.5,
    camera: new THREE.Vector3(4.75, 3.95, 7.05),
    lookAt: new THREE.Vector3(0.08, 0.03, 0.0),
    modelPosition: new THREE.Vector3(0.0, -0.08, 0.0),
    modelScale: 1.0,
    dpr: 1.5,
    shadowSize: 2048,
    cameraMove: new THREE.Vector3(-0.28, 0.28, -0.32),
  };
}

export function initReviewScene(canvas, host) {
  if (!canvas || !host || !('WebGLRenderingContext' in window)) {
    document.documentElement.dataset.v3ReviewModel = 'fallback';
    return null;
  }

  const section = host.closest('.review-band') || host;
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
    console.warn('V3 Review WebGL unavailable:', error);
    document.documentElement.dataset.v3ReviewModel = 'fallback';
    return null;
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.04;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x242321, 9.8, 17.5);

  const camera = new THREE.PerspectiveCamera(32.5, 1, 0.1, 34);
  const modelRoot = new THREE.Group();
  scene.add(modelRoot);

  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 14),
    new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.30 }),
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -0.33;
  shadowPlane.receiveShadow = true;
  scene.add(shadowPlane);

  const key = new THREE.DirectionalLight(0xffddbd, 4.3);
  key.position.set(-4.8, 7.5, 5.8);
  key.castShadow = true;
  key.shadow.bias = -0.00025;
  key.shadow.normalBias = 0.026;
  key.shadow.radius = 4;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 23;
  key.shadow.camera.left = -5.5;
  key.shadow.camera.right = 5.5;
  key.shadow.camera.top = 5.5;
  key.shadow.camera.bottom = -4.5;
  scene.add(key);

  scene.add(new THREE.HemisphereLight(0xfff6e8, 0x1d1b19, 0.92));
  scene.add(new THREE.AmbientLight(0xffead6, 0.10));

  const keyBase = key.position.clone();
  let frame = frameForWidth(host.clientWidth || window.innerWidth);
  let mixer = null;
  let action = null;
  let actionDuration = 1;
  let disposed = false;
  let visible = false;
  let targetProgress = reducedMotion ? 1 : 0;
  let progress = reducedMotion ? 1 : 0;
  let raf = 0;

  const scrub = (value) => {
    if (!action) return;
    action.paused = true;
    action.time = actionDuration * value;
    mixer?.update(0);
  };

  const render = () => {
    if (!disposed) renderer.render(scene, camera);
  };

  const applyMotionFrame = (value) => {
    const eased = reducedMotion ? 1 : smoothstep(value);
    camera.position.set(
      frame.camera.x + frame.cameraMove.x * eased,
      frame.camera.y + frame.cameraMove.y * eased,
      frame.camera.z + frame.cameraMove.z * eased,
    );
    const look = frame.lookAt.clone();
    look.y += eased * 0.04;
    camera.lookAt(look);

    modelRoot.position.set(
      frame.modelPosition.x,
      frame.modelPosition.y + eased * 0.01,
      frame.modelPosition.z,
    );
    modelRoot.scale.setScalar(frame.modelScale);
    modelRoot.rotation.set(0, -0.045 + eased * 0.02, -0.006);

    key.position.set(
      keyBase.x + eased * 0.20,
      keyBase.y + eased * 0.10,
      keyBase.z - eased * 0.18,
    );
    shadowPlane.material.opacity = 0.22 + eased * 0.08;
    host.style.setProperty('--review-copy-y', `${10 * (1 - eased)}px`);
    host.style.setProperty('--review-support-opacity', String(0.78 + eased * 0.22));
    host.dataset.reviewProgress = eased.toFixed(3);

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

    applyMotionFrame(progress);
  };

  const updateScroll = () => {
    if (reducedMotion) return;
    const rect = section.getBoundingClientRect();
    const viewport = window.innerHeight || 800;
    const start = viewport * 0.86;
    const end = viewport * 0.22;
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

  new GLTFLoader().load(
    `${import.meta.env.BASE_URL}models/manic-review.glb`,
    (gltf) => {
      if (disposed) return;
      const model = gltf.scene;
      model.name = 'BlenderReviewModel';
      model.traverse((object) => {
        if (!object.isMesh) return;
        object.castShadow = !object.name.includes('SURFACE');
        object.receiveShadow = true;
      });
      modelRoot.add(model);

      const clip = gltf.animations?.find((item) => item.name === 'ACT_REVIEW_PAPER_TURN');
      if (clip) {
        mixer = new THREE.AnimationMixer(model);
        action = mixer.clipAction(clip);
        action.play();
        action.paused = true;
        actionDuration = clip.duration;
        document.documentElement.dataset.v3ReviewClips = clip.name;
      }

      host.classList.add('review-model-ready');
      document.documentElement.dataset.v3ReviewModel = 'ready';
      applyFrame();
      updateScroll();
    },
    undefined,
    (error) => {
      console.warn('V3 Review GLB failed:', error);
      host.classList.add('review-model-failed');
      document.documentElement.dataset.v3ReviewModel = 'fallback';
    },
  );

  const observer = new IntersectionObserver((entries) => {
    visible = Boolean(entries[0]?.isIntersecting);
    if (visible) {
      updateScroll();
      startLoop();
      render();
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
