import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const smoothstep = (value) => value * value * (3 - 2 * value);

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
      cameraMove: new THREE.Vector3(-0.18, 0.34, -0.14),
      lookShift: new THREE.Vector3(0.0, 0.05, 0.0),
      motionScale: 0.42,
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
      cameraMove: new THREE.Vector3(-0.42, 0.72, -0.34),
      lookShift: new THREE.Vector3(0.0, 0.07, 0.0),
      motionScale: 0.72,
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
    cameraMove: new THREE.Vector3(-0.72, 1.08, -0.52),
    lookShift: new THREE.Vector3(0.0, 0.10, 0.0),
    motionScale: 1.0,
  };
}

export function initGalleryScene(canvas, host) {
  if (!canvas || !host || !('WebGLRenderingContext' in window)) {
    document.documentElement.dataset.v3GalleryModel = 'fallback';
    return null;
  }

  const section = host.closest('.gallery-section') || host;
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

  const keyBase = key.position.clone();
  let frame = frameForWidth(host.clientWidth || window.innerWidth);
  let disposed = false;
  let visible = false;
  let targetProgress = 0;
  let progress = 0;
  let raf = 0;

  const render = () => {
    if (!disposed) renderer.render(scene, camera);
  };

  const applyHtmlState = (value) => {
    const eased = reducedMotion ? 0 : smoothstep(value) * frame.motionScale;
    host.style.setProperty('--gallery-wide-y', `${-12 * eased}px`);
    host.style.setProperty('--gallery-wide-rotate', `${1.0 * eased}deg`);
    host.style.setProperty('--gallery-wide-scale', String(1 + 0.014 * eased));
    host.style.setProperty('--gallery-tall-y', `${8 * eased}px`);
    host.style.setProperty('--gallery-tall-rotate', `${-1.25 * eased}deg`);
    host.style.setProperty('--gallery-tall-scale', String(1 + 0.010 * eased));
    host.style.setProperty('--gallery-food-y', `${-18 * eased}px`);
    host.style.setProperty('--gallery-food-rotate', `${1.8 * eased}deg`);
    host.style.setProperty('--gallery-food-scale', String(1 + 0.022 * eased));
    host.dataset.galleryProgress = eased.toFixed(3);
  };

  const applyMotionFrame = (value) => {
    const eased = reducedMotion ? 0 : smoothstep(value) * frame.motionScale;

    camera.position.set(
      frame.camera.x + frame.cameraMove.x * eased,
      frame.camera.y + frame.cameraMove.y * eased,
      frame.camera.z + frame.cameraMove.z * eased,
    );
    const look = frame.lookAt.clone().addScaledVector(frame.lookShift, eased);
    camera.lookAt(look);
    camera.fov = frame.fov - eased * 1.7;
    camera.updateProjectionMatrix();

    modelRoot.position.set(
      frame.modelPosition.x,
      frame.modelPosition.y - eased * 0.018,
      frame.modelPosition.z,
    );
    modelRoot.scale.setScalar(frame.modelScale * (1 - eased * 0.012));
    modelRoot.rotation.set(
      -0.015 - eased * 0.025,
      -0.10 + eased * 0.045,
      -0.012 + eased * 0.006,
    );

    key.position.set(
      keyBase.x + eased * 0.28,
      keyBase.y + eased * 0.20,
      keyBase.z - eased * 0.22,
    );
    shadowPlane.material.opacity = 0.16 - eased * 0.018;
    applyHtmlState(value);
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
    const end = viewport * 0.12;
    // Complete the gallery choreography while the section enters the viewport.
    // Tying it to the full section height made the motion nearly imperceptible on tall layouts.
    targetProgress = clamp((start - rect.top) / Math.max(1, start - end), 0, 1);
    startLoop();
  };

  const tick = () => {
    if (disposed || reducedMotion || !visible || document.hidden) {
      raf = 0;
      return;
    }
    progress += (targetProgress - progress) * 0.095;
    if (Math.abs(targetProgress - progress) < 0.0005) progress = targetProgress;
    applyMotionFrame(progress);
    if (Math.abs(targetProgress - progress) > 0.0001) raf = requestAnimationFrame(tick);
    else raf = 0;
  };

  const startLoop = () => {
    if (!reducedMotion && visible && !raf && !document.hidden) raf = requestAnimationFrame(tick);
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
      updateScroll();
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
    renderer.dispose();
  };
}
