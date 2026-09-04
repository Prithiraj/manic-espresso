import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const CARD_KEYS = ['plate', 'welcome', 'find'];
const ROOT_NAMES = {
  plate: 'WHY_PLATE_ROOT',
  welcome: 'WHY_WELCOME_ROOT',
  find: 'WHY_FIND_ROOT'
};

const ACTION_GROUPS = {
  plate: (name) => name.startsWith('ACT_WHY_PLATE_'),
  welcome: (name) => name === 'ACT_WHY_CHAIR_OPEN' || name === 'ACT_WHY_CUP_WELCOME',
  find: (name) => name === 'ACT_WHY_DOOR_REVEAL'
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const smoothstep = (value) => value * value * (3 - 2 * value);

function cameraFrame(key, width) {
  const mobile = width < 620;
  const tablet = width < 980;

  if (key === 'plate') {
    return {
      fov: mobile ? 35 : 32,
      position: mobile ? new THREE.Vector3(3.8, 4.5, 6.8) : new THREE.Vector3(4.2, 4.8, 7.4),
      lookAt: new THREE.Vector3(0.0, 0.15, 0.0),
      scale: mobile ? 0.93 : tablet ? 0.90 : 0.98,
      rotationY: -0.16
    };
  }

  if (key === 'welcome') {
    return {
      fov: mobile ? 38 : 34,
      position: mobile ? new THREE.Vector3(4.9, 3.7, 7.6) : new THREE.Vector3(5.2, 3.9, 8.0),
      lookAt: new THREE.Vector3(0.15, 0.40, 0.05),
      scale: mobile ? 0.78 : tablet ? 0.76 : 0.84,
      rotationY: -0.22
    };
  }

  return {
    fov: mobile ? 39 : 34,
    position: mobile ? new THREE.Vector3(5.1, 3.5, 7.8) : new THREE.Vector3(5.5, 3.8, 8.2),
    lookAt: new THREE.Vector3(0.0, 0.32, 0.05),
    scale: mobile ? 0.70 : tablet ? 0.72 : 0.78,
    rotationY: -0.26
  };
}

function progressForCard(rect) {
  const viewport = window.innerHeight || 800;
  const start = viewport * 0.88;
  const end = viewport * 0.26;
  return clamp((start - rect.top) / Math.max(1, start - end), 0, 1);
}

export function initWhyScene(canvas, host) {
  if (!canvas || !host || !('WebGLRenderingContext' in window)) {
    document.documentElement.dataset.v3WhyModel = 'fallback';
    return null;
  }

  const cards = [...host.querySelectorAll('[data-why-card]')];
  if (cards.length !== 3) {
    document.documentElement.dataset.v3WhyModel = 'fallback';
    return null;
  }

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
    console.warn('V3 Why WebGL unavailable:', error);
    document.documentElement.dataset.v3WhyModel = 'fallback';
    return null;
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.03;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setScissorTest(true);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xf3eee4, 10.5, 18.0);

  const key = new THREE.DirectionalLight(0xffe3c8, 4.0);
  key.position.set(-4.6, 7.5, 5.8);
  key.castShadow = true;
  key.shadow.bias = -0.00025;
  key.shadow.normalBias = 0.026;
  key.shadow.radius = 4;
  key.shadow.mapSize.set(1536, 1536);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 24;
  key.shadow.camera.left = -6;
  key.shadow.camera.right = 6;
  key.shadow.camera.top = 6;
  key.shadow.camera.bottom = -5;
  scene.add(key);
  scene.add(new THREE.HemisphereLight(0xfffaf1, 0x51483f, 1.0));
  scene.add(new THREE.AmbientLight(0xfff4e5, 0.12));

  const cameras = CARD_KEYS.map(() => new THREE.PerspectiveCamera(34, 1, 0.1, 35));
  const roots = new Map();
  const actionsByCard = new Map(CARD_KEYS.map((keyName) => [keyName, []]));
  let mixer = null;
  let disposed = false;
  let visible = false;
  let raf = 0;

  const hideAll = () => roots.forEach((root) => { root.visible = false; });

  const applyCardAnimation = (keyName, progress) => {
    const actions = actionsByCard.get(keyName) || [];
    const eased = smoothstep(progress);

    for (const { action, duration } of actions) {
      action.paused = true;
      if (reducedMotion) {
        // The approved plate frame is assembled at the END of its Blender clips;
        // welcome/find approved static frames are at the START of their clips.
        action.time = keyName === 'plate' ? duration : 0;
      } else {
        action.time = duration * eased;
      }
    }
    mixer?.update(0);
  };

  const render = () => {
    raf = 0;
    if (disposed || roots.size !== 3) return;

    const hostRect = host.getBoundingClientRect();
    const cssWidth = Math.max(1, Math.round(hostRect.width));
    const cssHeight = Math.max(1, Math.round(hostRect.height));
    const maxDpr = cssWidth < 620 ? 1.2 : cssWidth < 980 ? 1.35 : 1.5;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
    renderer.setSize(cssWidth, cssHeight, false);

    const drawingWidth = renderer.domElement.width;
    const drawingHeight = renderer.domElement.height;
    const scaleX = drawingWidth / cssWidth;
    const scaleY = drawingHeight / cssHeight;

    cards.forEach((card, index) => {
      const keyName = card.dataset.whyCard;
      const root = roots.get(keyName);
      if (!root) return;

      const rect = card.getBoundingClientRect();
      const leftCss = Math.max(0, rect.left - hostRect.left);
      const topCss = Math.max(0, rect.top - hostRect.top);
      const widthCss = Math.min(rect.width, cssWidth - leftCss);
      const heightCss = Math.min(rect.height, cssHeight - topCss);
      if (widthCss <= 2 || heightCss <= 2) return;

      const x = Math.round(leftCss * scaleX);
      const width = Math.round(widthCss * scaleX);
      const height = Math.round(heightCss * scaleY);
      const y = Math.round(drawingHeight - (topCss + heightCss) * scaleY);

      renderer.setViewport(x, y, width, height);
      renderer.setScissor(x, y, width, height);
      renderer.setClearColor(0x000000, 0);
      renderer.clear(true, true, true);

      hideAll();
      root.visible = true;

      const progress = reducedMotion ? (keyName === 'plate' ? 1 : 0) : progressForCard(rect);
      applyCardAnimation(keyName, progress);

      const frame = cameraFrame(keyName, rect.width);
      const motionBias = reducedMotion ? 0 : smoothstep(progress) * 0.06;
      root.position.set(
        keyName === 'find' ? motionBias * 0.30 : 0,
        (keyName === 'plate' ? -0.20 : keyName === 'welcome' ? -0.10 : -0.08) + motionBias * 0.18,
        0
      );
      root.scale.setScalar(frame.scale);
      root.rotation.set(0, frame.rotationY + motionBias * 0.18, 0);

      const camera = cameras[index];
      camera.aspect = widthCss / heightCss;
      camera.fov = frame.fov;
      camera.position.set(
        frame.position.x - motionBias * 0.35,
        frame.position.y + motionBias * 0.12,
        frame.position.z - motionBias * 0.42
      );
      const look = frame.lookAt.clone();
      look.y += motionBias * 0.08;
      camera.lookAt(look);
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    });

    hideAll();
    document.documentElement.dataset.v3WhyModel = 'ready';
    host.classList.add('why-model-ready');
  };

  const requestRender = () => {
    if (!visible || disposed || raf) return;
    raf = requestAnimationFrame(render);
  };

  const loader = new GLTFLoader();
  loader.load(
    `${import.meta.env.BASE_URL}models/manic-why.glb`,
    (gltf) => {
      if (disposed) return;
      gltf.scene.traverse((object) => {
        if (object.isMesh) {
          object.castShadow = true;
          object.receiveShadow = true;
        }
      });

      for (const keyName of CARD_KEYS) {
        const object = gltf.scene.getObjectByName(ROOT_NAMES[keyName]);
        if (!object) {
          console.warn(`V3 Why root missing: ${ROOT_NAMES[keyName]}`);
          document.documentElement.dataset.v3WhyModel = 'fallback';
          host.classList.add('why-model-failed');
          return;
        }
        roots.set(keyName, object);
      }

      if (gltf.animations?.length) {
        mixer = new THREE.AnimationMixer(gltf.scene);
        for (const clip of gltf.animations) {
          const keyName = CARD_KEYS.find((candidate) => ACTION_GROUPS[candidate](clip.name));
          if (!keyName) continue;
          const action = mixer.clipAction(clip);
          action.play();
          action.paused = true;
          actionsByCard.get(keyName).push({ action, duration: clip.duration, name: clip.name });
        }
        document.documentElement.dataset.v3WhyClips = [...actionsByCard.values()]
          .flat()
          .map(({ name }) => name)
          .sort()
          .join(',');
      }

      scene.add(gltf.scene);
      hideAll();
      visible = true;
      render();
    },
    undefined,
    (error) => {
      console.warn('V3 Why GLB failed:', error);
      document.documentElement.dataset.v3WhyModel = 'fallback';
      host.classList.add('why-model-failed');
    }
  );

  const observer = new IntersectionObserver((entries) => {
    visible = Boolean(entries[0]?.isIntersecting);
    if (visible) requestRender();
  }, { threshold: 0.02 });
  observer.observe(host);

  const resizeObserver = new ResizeObserver(requestRender);
  resizeObserver.observe(host);

  if (!reducedMotion) window.addEventListener('scroll', requestRender, { passive: true });

  return () => {
    disposed = true;
    if (raf) cancelAnimationFrame(raf);
    observer.disconnect();
    resizeObserver.disconnect();
    if (!reducedMotion) window.removeEventListener('scroll', requestRender);
    mixer?.stopAllAction();
    renderer.dispose();
  };
}
