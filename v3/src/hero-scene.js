import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const smoothstep = (value) => value * value * (3 - 2 * value);

function frameForWidth(width) {
  if (width < 520) {
    return {
      fov: 37,
      camera: new THREE.Vector3(4.3, 3.0, 7.9),
      lookAt: new THREE.Vector3(0.35, 0.05, 0.15),
      modelPosition: new THREE.Vector3(0.95, -0.36, 0.05),
      modelScale: 0.86,
      dpr: 1.25,
      shadowSize: 1024,
      dolly: 0.30,
      lift: 0.10
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
      shadowSize: 1536,
      dolly: 0.34,
      lift: 0.08
    };
  }
  return {
    fov: 31.5,
    camera: new THREE.Vector3(4.35, 2.75, 6.7),
    lookAt: new THREE.Vector3(0.28, -0.02, 0.02),
    modelPosition: new THREE.Vector3(0.72, -0.22, 0.0),
    modelScale: 1.02,
    dpr: 1.6,
    shadowSize: 2048,
    dolly: 0.40,
    lift: 0.06
  };
}

export function initHeroScene(canvas, host) {
  if (!canvas || !host || !('WebGLRenderingContext' in window)) {
    document.documentElement.dataset.v3Model = 'fallback';
    return null;
  }

  const hero = host.closest('.hero') || host;
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

  const keyBase = key.position.clone();
  let model = null;
  let mixer = null;
  let clipActions = [];
  let frame = frameForWidth(host.clientWidth || window.innerWidth);
  let baseModelPosition = frame.modelPosition.clone();
  let targetProgress = 0;
  let progress = 0;
  let visible = true;
  let raf = 0;
  let disposed = false;

  const render = () => {
    if (disposed) return;
    renderer.render(scene, camera);
  };

  const scrubBlenderClips = (value) => {
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
      frame.camera.x + arc * 0.14,
      frame.camera.y + eased * 0.22,
      frame.camera.z - eased * frame.dolly
    );

    const look = frame.lookAt.clone();
    look.x += eased * 0.06;
    look.y += eased * 0.08;
    camera.lookAt(look);

    modelRoot.position.set(
      baseModelPosition.x + eased * 0.08,
      baseModelPosition.y + eased * frame.lift,
      baseModelPosition.z - eased * 0.04
    );
    modelRoot.rotation.set(0, -0.19 + eased * 0.07, -0.015 + arc * 0.008);

    key.position.set(
      keyBase.x + eased * 0.55,
      keyBase.y + eased * 0.18,
      keyBase.z - eased * 0.35
    );

    shadowPlane.material.opacity = 0.14 - eased * 0.025;
    scrubBlenderClips(eased);
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

    if (reducedMotion) {
      targetProgress = 0;
      progress = 0;
      camera.position.copy(frame.camera);
      camera.lookAt(frame.lookAt);
      modelRoot.position.copy(baseModelPosition);
      modelRoot.scale.setScalar(frame.modelScale);
      modelRoot.rotation.set(0, -0.19, -0.015);
      key.position.copy(keyBase);
      shadowPlane.material.opacity = 0.14;
      scrubBlenderClips(0);
      render();
      return;
    }

    modelRoot.scale.setScalar(frame.modelScale);
    applyMotionFrame(progress);
  };

  const updateScroll = () => {
    if (reducedMotion) return;
    const rect = hero.getBoundingClientRect();
    const heroTopInDocument = window.scrollY + rect.top;
    const travel = Math.max(hero.offsetHeight * 0.82, window.innerHeight * 0.82);
    targetProgress = clamp((window.scrollY - heroTopInDocument) / travel, 0, 1);
    start();
  };

  const tick = () => {
    if (disposed || reducedMotion || !visible || document.hidden) {
      raf = 0;
      return;
    }

    progress += (targetProgress - progress) * 0.085;
    if (Math.abs(targetProgress - progress) < 0.0005) progress = targetProgress;
    applyMotionFrame(progress);

    if (Math.abs(targetProgress - progress) > 0.0001) {
      raf = requestAnimationFrame(tick);
    } else {
      raf = 0;
    }
  };

  const start = () => {
    if (!reducedMotion && visible && !raf && !document.hidden) {
      raf = requestAnimationFrame(tick);
    }
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
        clipActions = gltf.animations.map((clip) => {
          const action = mixer.clipAction(clip);
          action.play();
          action.paused = true;
          action.time = 0;
          return { action, duration: clip.duration };
        });
        scrubBlenderClips(0);
      }

      host.classList.add('model-ready');
      document.documentElement.dataset.v3Model = 'ready';
      document.documentElement.dataset.v3HeroClips = gltf.animations.map((clip) => clip.name).join(',');
      applyFrame();
      updateScroll();
    },
    undefined,
    (error) => {
      console.warn('V3 Blender hero failed to load:', error);
      host.classList.add('model-failed');
      document.documentElement.dataset.v3Model = 'fallback';
      render();
    }
  );

  const observer = new IntersectionObserver((entries) => {
    visible = Boolean(entries[0]?.isIntersecting);
    if (visible) start();
    else if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }, { threshold: 0.02 });
  observer.observe(hero);

  const resizeObserver = new ResizeObserver(applyFrame);
  resizeObserver.observe(host);
  window.addEventListener('scroll', updateScroll, { passive: true });
  document.addEventListener('visibilitychange', start);

  applyFrame();
  updateScroll();

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
