import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const smoothstep = (value) => value * value * (3 - 2 * value);

function frameForWidth(width) {
  if (width < 520) {
    return {
      fov: 38,
      camera: new THREE.Vector3(5.6, 3.8, 7.8),
      lookAt: new THREE.Vector3(0.0, 0.95, 0.05),
      modelPosition: new THREE.Vector3(0.30, -0.42, 0.10),
      modelScale: 0.72,
      dpr: 1.2,
      shadowSize: 1024,
      cameraIn: new THREE.Vector3(-0.26, 0.20, -0.28),
      lookShift: new THREE.Vector3(0.16, 0.10, 0.12)
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
      shadowSize: 1536,
      cameraIn: new THREE.Vector3(-0.34, 0.24, -0.36),
      lookShift: new THREE.Vector3(0.20, 0.12, 0.14)
    };
  }
  return {
    fov: 31.5,
    camera: new THREE.Vector3(6.15, 4.2, 6.85),
    lookAt: new THREE.Vector3(0.0, 0.92, 0.0),
    modelPosition: new THREE.Vector3(0.08, -0.30, 0.0),
    modelScale: 0.91,
    dpr: 1.5,
    shadowSize: 2048,
    cameraIn: new THREE.Vector3(-0.46, 0.28, -0.46),
    lookShift: new THREE.Vector3(0.26, 0.14, 0.18)
  };
}

export function initCafeScene(canvas, host) {
  if (!canvas || !host || !('WebGLRenderingContext' in window)) {
    document.documentElement.dataset.v3CafeModel = 'fallback';
    return null;
  }

  const section = host.closest('.place') || host;
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

  const scrub = (value) => {
    for (const { action, duration } of clipActions) {
      action.paused = true;
      action.time = duration * value;
    }
    mixer?.update(0);
  };

  const applyPhotoState = (value) => {
    const eased = smoothstep(value);
    host.style.setProperty('--cafe-exterior-opacity', String(1 - eased * 0.30));
    host.style.setProperty('--cafe-interior-opacity', String(0.78 + eased * 0.22));
    host.style.setProperty('--cafe-interior-scale', String(1 + eased * 0.045));
  };

  const applyMotionFrame = (value) => {
    const eased = smoothstep(value);
    const arc = Math.sin(value * Math.PI);

    camera.position.set(
      frame.camera.x + frame.cameraIn.x * eased + arc * 0.08,
      frame.camera.y + frame.cameraIn.y * eased,
      frame.camera.z + frame.cameraIn.z * eased
    );
    const look = frame.lookAt.clone().addScaledVector(frame.lookShift, eased);
    camera.lookAt(look);

    modelRoot.position.set(
      baseModelPosition.x + eased * 0.03,
      baseModelPosition.y + eased * 0.02,
      baseModelPosition.z
    );
    modelRoot.rotation.set(0, -0.08 + eased * 0.035, -0.01 + arc * 0.004);

    key.position.set(
      keyBase.x + eased * 0.45,
      keyBase.y + eased * 0.20,
      keyBase.z - eased * 0.35
    );
    shadowPlane.material.opacity = 0.13 - eased * 0.018;
    scrub(eased);
    applyPhotoState(eased);
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
      modelRoot.rotation.set(0, -0.08, -0.01);
      key.position.copy(keyBase);
      shadowPlane.material.opacity = 0.13;
      scrub(0);
      applyPhotoState(0);
      render();
    } else {
      applyMotionFrame(progress);
    }
  };

  const updateScroll = () => {
    if (reducedMotion) return;
    const rect = section.getBoundingClientRect();
    const travel = Math.max(section.offsetHeight * 0.72, window.innerHeight * 0.82);
    targetProgress = clamp(-rect.top / travel, 0, 1);
    start();
  };

  const tick = () => {
    if (disposed || reducedMotion || !visible || document.hidden) {
      raf = 0;
      return;
    }
    progress += (targetProgress - progress) * 0.08;
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

      if (gltf.animations?.length) {
        mixer = new THREE.AnimationMixer(model);
        clipActions = gltf.animations
          .filter((clip) => clip.name.startsWith('ACT_CAFE_'))
          .map((clip) => {
            const action = mixer.clipAction(clip);
            action.play();
            action.paused = true;
            action.time = 0;
            return { action, duration: clip.duration };
          });
        scrub(0);
      }

      host.classList.add('cafe-model-ready');
      document.documentElement.dataset.v3CafeModel = 'ready';
      document.documentElement.dataset.v3CafeClips = gltf.animations.map((clip) => clip.name).join(',');
      applyFrame();
      updateScroll();
    },
    undefined,
    (error) => {
      console.warn('V3 Blender Cafe model failed to load:', error);
      host.classList.add('cafe-model-failed');
      document.documentElement.dataset.v3CafeModel = 'fallback';
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
