import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const smoothstep = (value) => value * value * (3 - 2 * value);

function frameForWidth(width) {
  if (width < 520) {
    return {
      fov: 39,
      camera: new THREE.Vector3(4.4, 4.45, 7.6),
      lookAt: new THREE.Vector3(0.15, 0.02, 0.05),
      modelPosition: new THREE.Vector3(0.28, -0.28, 0.0),
      modelScale: 0.78,
      dpr: 1.2,
      shadowSize: 1024,
      cameraRise: 0.28,
      dolly: 0.20
    };
  }
  if (width < 900) {
    return {
      fov: 36,
      camera: new THREE.Vector3(4.3, 4.15, 7.0),
      lookAt: new THREE.Vector3(0.12, 0.00, 0.04),
      modelPosition: new THREE.Vector3(0.18, -0.22, 0.0),
      modelScale: 0.88,
      dpr: 1.35,
      shadowSize: 1536,
      cameraRise: 0.34,
      dolly: 0.24
    };
  }
  return {
    fov: 32.5,
    camera: new THREE.Vector3(4.15, 4.15, 6.35),
    lookAt: new THREE.Vector3(0.05, -0.03, 0.02),
    modelPosition: new THREE.Vector3(0.10, -0.18, 0.0),
    modelScale: 0.96,
    dpr: 1.5,
    shadowSize: 2048,
    cameraRise: 0.40,
    dolly: 0.30
  };
}

export function initMenuScene(canvas, host) {
  if (!canvas || !host || !('WebGLRenderingContext' in window)) {
    document.documentElement.dataset.v3MenuModel = 'fallback';
    return null;
  }

  const section = host.closest('.menu') || host;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    console.warn('V3 Menu WebGL unavailable:', error);
    document.documentElement.dataset.v3MenuModel = 'fallback';
    return null;
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.03;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x242321, 9.4, 17.2);

  const camera = new THREE.PerspectiveCamera(32.5, 1, 0.1, 40);
  const modelRoot = new THREE.Group();
  modelRoot.name = 'V3MenuRoot';
  scene.add(modelRoot);

  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 16),
    new THREE.ShadowMaterial({ color: 0x050403, opacity: 0.27 })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -0.49;
  shadowPlane.receiveShadow = true;
  scene.add(shadowPlane);

  const key = new THREE.DirectionalLight(0xffdfbf, 4.4);
  key.position.set(-4.7, 7.5, 5.5);
  key.castShadow = true;
  key.shadow.bias = -0.00022;
  key.shadow.normalBias = 0.025;
  key.shadow.radius = 4;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 24;
  key.shadow.camera.left = -5.4;
  key.shadow.camera.right = 5.4;
  key.shadow.camera.top = 5.4;
  key.shadow.camera.bottom = -4.2;
  scene.add(key);

  const fill = new THREE.HemisphereLight(0xfff8eb, 0x151211, 0.95);
  scene.add(fill);
  scene.add(new THREE.AmbientLight(0xfff2de, 0.12));

  const keyBase = key.position.clone();
  let model = null;
  let mixer = null;
  let clipActions = [];
  let frame = frameForWidth(host.clientWidth || window.innerWidth);
  let baseModelPosition = frame.modelPosition.clone();
  let targetProgress = 0;
  let progress = 0;
  let visible = false;
  let raf = 0;
  let disposed = false;

  const render = () => {
    if (!disposed) renderer.render(scene, camera);
  };

  const scrubClips = (value) => {
    for (const { action, duration } of clipActions) {
      action.paused = true;
      action.time = duration * value;
    }
    mixer?.update(0);
  };

  const applyMotionFrame = (value) => {
    const eased = smoothstep(value);
    const arc = Math.sin(value * Math.PI);

    camera.position.set(
      frame.camera.x + arc * 0.12,
      frame.camera.y + eased * frame.cameraRise,
      frame.camera.z - eased * frame.dolly
    );
    const look = frame.lookAt.clone();
    look.x += eased * 0.04;
    look.y += eased * 0.09;
    camera.lookAt(look);

    modelRoot.position.set(
      baseModelPosition.x + eased * 0.04,
      baseModelPosition.y + eased * 0.03,
      baseModelPosition.z
    );
    modelRoot.rotation.set(0, -0.17 + eased * 0.045, -0.02 + arc * 0.006);

    key.position.set(
      keyBase.x + eased * 0.40,
      keyBase.y + eased * 0.22,
      keyBase.z - eased * 0.28
    );
    shadowPlane.material.opacity = 0.27 - eased * 0.045;
    scrubClips(eased);
    render();
  };

  const applyFrame = () => {
    const rect = host.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    frame = frameForWidth(width);
    baseModelPosition = frame.modelPosition.clone();

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

    modelRoot.scale.setScalar(frame.modelScale);

    if (reducedMotion) {
      targetProgress = 0;
      progress = 0;
      camera.position.copy(frame.camera);
      camera.lookAt(frame.lookAt);
      modelRoot.position.copy(baseModelPosition);
      modelRoot.rotation.set(0, -0.17, -0.02);
      key.position.copy(keyBase);
      shadowPlane.material.opacity = 0.27;
      scrubClips(0);
      render();
    } else {
      applyMotionFrame(progress);
    }
  };

  const updateScroll = () => {
    if (reducedMotion) return;
    const rect = section.getBoundingClientRect();
    const travel = Math.max(section.offsetHeight * 0.76, window.innerHeight * 0.86);
    targetProgress = clamp(-rect.top / travel, 0, 1);
    start();
  };

  const tick = () => {
    if (disposed || reducedMotion || !visible || document.hidden) {
      raf = 0;
      return;
    }
    progress += (targetProgress - progress) * 0.082;
    if (Math.abs(targetProgress - progress) < 0.0005) progress = targetProgress;
    applyMotionFrame(progress);
    if (Math.abs(targetProgress - progress) > 0.0001) raf = requestAnimationFrame(tick);
    else raf = 0;
  };

  const start = () => {
    if (!reducedMotion && visible && !raf && !document.hidden) raf = requestAnimationFrame(tick);
  };

  const loader = new GLTFLoader();
  loader.load(
    `${import.meta.env.BASE_URL}models/manic-menu.glb`,
    (gltf) => {
      if (disposed) return;
      model = gltf.scene;
      model.name = 'BlenderMenuModel';
      model.traverse((object) => {
        if (!object.isMesh) return;
        object.castShadow = !object.name.startsWith('MENU_PLATE') && !object.name.startsWith('FOOD_GREEN_STEM');
        object.receiveShadow = true;
      });
      modelRoot.add(model);

      if (gltf.animations?.length) {
        mixer = new THREE.AnimationMixer(model);
        clipActions = gltf.animations
          .filter((clip) => clip.name.startsWith('ACT_MENU_EXPLODE_'))
          .map((clip) => {
            const action = mixer.clipAction(clip);
            action.play();
            action.paused = true;
            action.time = 0;
            return { action, duration: clip.duration };
          });
        scrubClips(0);
      }

      host.classList.add('menu-model-ready');
      document.documentElement.dataset.v3MenuModel = 'ready';
      document.documentElement.dataset.v3MenuClips = gltf.animations.map((clip) => clip.name).join(',');
      applyFrame();
      updateScroll();
    },
    undefined,
    (error) => {
      console.warn('V3 Blender menu failed to load:', error);
      host.classList.add('menu-model-failed');
      document.documentElement.dataset.v3MenuModel = 'fallback';
      render();
    }
  );

  const observer = new IntersectionObserver((entries) => {
    visible = Boolean(entries[0]?.isIntersecting);
    if (visible) {
      updateScroll();
      start();
    } else if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }, { threshold: 0.02 });
  observer.observe(section);

  const resizeObserver = new ResizeObserver(applyFrame);
  resizeObserver.observe(host);
  window.addEventListener('scroll', updateScroll, { passive: true });
  document.addEventListener('visibilitychange', start);
  applyFrame();

  return () => {
    disposed = true;
    if (raf) cancelAnimationFrame(raf);
    observer.disconnect();
    resizeObserver.disconnect();
    window.removeEventListener('scroll', updateScroll);
    document.removeEventListener('visibilitychange', start);
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
