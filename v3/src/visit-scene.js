import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const smoothstep = (value) => value * value * (3 - 2 * value);

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
      cameraShift: new THREE.Vector3(0.05, 0.05, 0.14),
      lookShift: new THREE.Vector3(0.03, 0.025, 0.02),
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
      cameraShift: new THREE.Vector3(0.06, 0.06, 0.16),
      lookShift: new THREE.Vector3(0.04, 0.03, 0.025),
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
    cameraShift: new THREE.Vector3(0.07, 0.07, 0.18),
    lookShift: new THREE.Vector3(0.05, 0.035, 0.03),
  };
}

export function initVisitScene(canvas, host) {
  if (!canvas || !host || !('WebGLRenderingContext' in window)) {
    document.documentElement.dataset.v3VisitModel = 'fallback';
    return null;
  }

  const section = host.closest('.visit-section') || host;
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

  const keyBase = key.position.clone();
  let frame = frameForWidth(host.clientWidth || window.innerWidth);
  let disposed = false;
  let visible = false;
  let mixer = null;
  let actions = [];
  let targetProgress = 0;
  let progress = 0;
  let raf = 0;

  const render = () => {
    if (!disposed) renderer.render(scene, camera);
  };

  const scrub = (value) => {
    for (const { action, duration } of actions) {
      action.paused = true;
      action.time = reducedMotion ? 0 : duration * value;
    }
    mixer?.update(0);
  };

  const applyMotionFrame = (value) => {
    const eased = reducedMotion ? 0 : smoothstep(value);
    camera.position.set(
      frame.camera.x + frame.cameraShift.x * eased,
      frame.camera.y + frame.cameraShift.y * eased,
      frame.camera.z + frame.cameraShift.z * eased,
    );
    const look = frame.lookAt.clone().addScaledVector(frame.lookShift, eased);
    camera.lookAt(look);

    modelRoot.position.copy(frame.modelPosition);
    modelRoot.scale.setScalar(frame.modelScale);
    modelRoot.rotation.set(-0.01, -0.10 + eased * 0.012, -0.012);

    // The light does most of the spatial work here: a small grazing shift makes the relief lines read.
    key.position.set(
      keyBase.x + eased * 0.65,
      keyBase.y - eased * 0.28,
      keyBase.z - eased * 0.48,
    );
    shadowPlane.material.opacity = 0.14 - eased * 0.012;
    host.style.setProperty('--visit-photo-shift', `${-5 * eased}px`);
    host.style.setProperty('--visit-photo-scale', String(1 + eased * 0.014));

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
    const start = viewport * 0.82;
    const end = viewport * 0.16;
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
    `${import.meta.env.BASE_URL}models/manic-visit.glb`,
    (gltf) => {
      if (disposed) return;
      const model = gltf.scene;
      model.name = 'BlenderVisitModel';
      model.traverse((object) => {
        if (!object.isMesh) return;
        object.castShadow = !object.name.includes('RELIEF_LINE') && !object.name.includes('CONTACT');
        object.receiveShadow = true;
      });
      modelRoot.add(model);

      if (gltf.animations?.length) {
        mixer = new THREE.AnimationMixer(model);
        actions = gltf.animations
          .filter((clip) => clip.name.startsWith('ACT_VISIT_'))
          .map((clip) => {
            const action = mixer.clipAction(clip);
            action.play();
            action.paused = true;
            action.time = 0;
            return { action, duration: clip.duration, name: clip.name };
          });
        document.documentElement.dataset.v3VisitClips = actions.map(({ name }) => name).sort().join(',');
      }

      host.classList.add('visit-model-ready');
      document.documentElement.dataset.v3VisitModel = 'ready';
      applyFrame();
      updateScroll();
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
