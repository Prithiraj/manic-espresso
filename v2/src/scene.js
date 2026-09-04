import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const smoothstep = (value) => value * value * (3 - 2 * value);

function createContactTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(128, 128, 8, 128, 128, 118);
  gradient.addColorStop(0, 'rgba(47,38,32,0.38)');
  gradient.addColorStop(0.42, 'rgba(47,38,32,0.2)');
  gradient.addColorStop(1, 'rgba(47,38,32,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createCeramicSet() {
  const root = new THREE.Group();
  root.name = 'ceramic-set';

  const ceramic = new THREE.MeshPhysicalMaterial({
    color: 0xf3eadc,
    roughness: 0.44,
    metalness: 0,
    clearcoat: 0.16,
    clearcoatRoughness: 0.68,
    sheen: 0.08,
    sheenColor: new THREE.Color(0xfff8ec)
  });

  const ceramicEdge = new THREE.MeshPhysicalMaterial({
    color: 0xfffbf2,
    roughness: 0.36,
    metalness: 0,
    clearcoat: 0.19,
    clearcoatRoughness: 0.6
  });

  const coffeeMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x3b2015,
    roughness: 0.2,
    metalness: 0,
    clearcoat: 0.22,
    clearcoatRoughness: 0.22
  });

  const brass = new THREE.MeshStandardMaterial({
    color: 0xa77b43,
    roughness: 0.38,
    metalness: 0.72
  });

  const cupProfile = [
    [0.43, -0.72],
    [0.52, -0.67],
    [0.62, -0.50],
    [0.69, -0.10],
    [0.72, 0.30],
    [0.69, 0.62],
    [0.66, 0.73],
    [0.60, 0.76],
    [0.55, 0.67],
    [0.56, 0.28],
    [0.53, -0.22],
    [0.47, -0.54],
    [0.39, -0.64]
  ].map(([x, y]) => new THREE.Vector2(x, y));

  const cup = new THREE.Mesh(new THREE.LatheGeometry(cupProfile, 80), ceramic);
  cup.castShadow = true;
  cup.receiveShadow = true;
  cup.position.y = 0.08;
  root.add(cup);

  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.63, 0.035, 12, 72), ceramicEdge);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.82;
  rim.castShadow = true;
  root.add(rim);

  const coffee = new THREE.Mesh(new THREE.CylinderGeometry(0.565, 0.565, 0.025, 64), coffeeMaterial);
  coffee.position.y = 0.71;
  coffee.castShadow = false;
  coffee.receiveShadow = true;
  root.add(coffee);

  const crema = new THREE.Mesh(
    new THREE.RingGeometry(0.41, 0.545, 64),
    new THREE.MeshBasicMaterial({ color: 0x9f6a3d, transparent: true, opacity: 0.27, side: THREE.DoubleSide })
  );
  crema.rotation.x = -Math.PI / 2;
  crema.position.y = 0.726;
  root.add(crema);

  const handleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.60, 0.52, 0.02),
    new THREE.Vector3(1.05, 0.58, 0.03),
    new THREE.Vector3(1.34, 0.32, 0.02),
    new THREE.Vector3(1.35, -0.06, 0.01),
    new THREE.Vector3(1.12, -0.34, 0),
    new THREE.Vector3(0.67, -0.30, 0)
  ]);
  const handle = new THREE.Mesh(new THREE.TubeGeometry(handleCurve, 64, 0.105, 14, false), ceramic);
  handle.castShadow = true;
  handle.receiveShadow = true;
  root.add(handle);

  const saucerProfile = [
    [0.00, -0.91],
    [0.24, -0.91],
    [0.52, -0.88],
    [0.84, -0.82],
    [1.12, -0.74],
    [1.20, -0.67],
    [1.14, -0.61],
    [0.86, -0.63],
    [0.56, -0.68],
    [0.22, -0.72],
    [0.00, -0.72]
  ].map(([x, y]) => new THREE.Vector2(x, y));

  const saucer = new THREE.Mesh(new THREE.LatheGeometry(saucerProfile, 96), ceramic);
  saucer.castShadow = true;
  saucer.receiveShadow = true;
  root.add(saucer);

  const spoonGroup = new THREE.Group();
  const spoonCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.28, -0.78, 0.50),
    new THREE.Vector3(-0.72, -0.77, 0.64),
    new THREE.Vector3(-1.20, -0.76, 0.81),
    new THREE.Vector3(-1.72, -0.75, 1.00)
  ]);
  const spoonHandle = new THREE.Mesh(new THREE.TubeGeometry(spoonCurve, 48, 0.042, 10, false), brass);
  spoonHandle.castShadow = true;
  spoonGroup.add(spoonHandle);

  const bowlShape = new THREE.Shape();
  bowlShape.absellipse(0, 0, 0.28, 0.17, 0, Math.PI * 2, false, 0);
  const bowlGeometry = new THREE.ExtrudeGeometry(bowlShape, {
    depth: 0.045,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.022,
    bevelThickness: 0.018,
    curveSegments: 28
  });
  bowlGeometry.center();
  const bowl = new THREE.Mesh(bowlGeometry, brass);
  bowl.rotation.x = Math.PI / 2;
  bowl.rotation.y = -0.34;
  bowl.position.set(-1.94, -0.77, 1.08);
  bowl.scale.set(1.15, 1.0, 1.0);
  bowl.castShadow = true;
  spoonGroup.add(bowl);

  root.add(spoonGroup);
  return root;
}

function createPlinth() {
  const material = new THREE.MeshStandardMaterial({
    color: 0xded3c3,
    roughness: 0.92,
    metalness: 0
  });
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(4.4, 0.28, 3.45, 8, 0.18), material);
  mesh.position.set(0.05, -1.08, 0.16);
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  return mesh;
}

function frameForWidth(width) {
  if (width < 520) {
    return {
      fov: 41,
      camera: new THREE.Vector3(4.65, 3.1, 8.8),
      lookAt: new THREE.Vector3(0.72, -0.12, 0.05),
      scenePosition: new THREE.Vector3(1.35, 0.00, 0.25),
      sceneScale: 0.9,
      dpr: 1.35,
      shadowSize: 1024
    };
  }
  if (width < 900) {
    return {
      fov: 37,
      camera: new THREE.Vector3(4.2, 2.95, 8.0),
      lookAt: new THREE.Vector3(0.65, -0.08, 0.05),
      scenePosition: new THREE.Vector3(1.05, 0.03, 0.18),
      sceneScale: 0.96,
      dpr: 1.5,
      shadowSize: 1536
    };
  }
  return {
    fov: 34,
    camera: new THREE.Vector3(4.05, 2.8, 7.25),
    lookAt: new THREE.Vector3(0.58, -0.06, 0.04),
    scenePosition: new THREE.Vector3(0.85, 0.05, 0.12),
    sceneScale: 1,
    dpr: 1.75,
    shadowSize: 2048
  };
}

export function initCeramicScene(canvas, host) {
  if (!canvas || !host || !('WebGLRenderingContext' in window)) return null;

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
    console.warn('WebGL scene unavailable:', error);
    return null;
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.04;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xf3eee4, 9.5, 16.5);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 35);
  const sceneRoot = new THREE.Group();
  scene.add(sceneRoot);

  const plinth = createPlinth();
  sceneRoot.add(plinth);

  const ceramicSet = createCeramicSet();
  ceramicSet.position.set(0.55, 0.0, 0.0);
  ceramicSet.rotation.y = -0.22;
  sceneRoot.add(ceramicSet);

  const contactTexture = createContactTexture();
  const contact = new THREE.Mesh(
    new THREE.PlaneGeometry(3.3, 2.25),
    new THREE.MeshBasicMaterial({
      map: contactTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0.72,
      color: 0x8d7868
    })
  );
  contact.rotation.x = -Math.PI / 2;
  contact.position.set(0.7, -0.925, 0.14);
  contact.renderOrder = 1;
  sceneRoot.add(contact);

  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 18),
    new THREE.ShadowMaterial({ color: 0x58483c, opacity: 0.13 })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -1.23;
  shadowPlane.receiveShadow = true;
  scene.add(shadowPlane);

  const key = new THREE.DirectionalLight(0xffe7ce, 4.0);
  key.position.set(-4.2, 7.2, 5.4);
  key.castShadow = true;
  key.shadow.bias = -0.00028;
  key.shadow.normalBias = 0.028;
  key.shadow.radius = 4;
  key.shadow.camera.near = 0.6;
  key.shadow.camera.far = 22;
  key.shadow.camera.left = -5;
  key.shadow.camera.right = 5;
  key.shadow.camera.top = 5;
  key.shadow.camera.bottom = -4;
  scene.add(key);

  const fill = new THREE.HemisphereLight(0xfffaf1, 0x5f5147, 1.15);
  scene.add(fill);

  const ambient = new THREE.AmbientLight(0xfff8ed, 0.18);
  scene.add(ambient);

  const ceramicBasePosition = ceramicSet.position.clone();
  const ceramicBaseRotationY = ceramicSet.rotation.y;
  const plinthBasePosition = plinth.position.clone();
  const keyBasePosition = key.position.clone();
  const contactBaseOpacity = contact.material.opacity;

  let frame = frameForWidth(host.clientWidth || window.innerWidth);
  let baseCamera = frame.camera.clone();
  let baseLookAt = frame.lookAt.clone();
  let baseScenePosition = frame.scenePosition.clone();
  let targetPointerX = 0;
  let targetPointerY = 0;
  let pointerX = 0;
  let pointerY = 0;
  let targetScrollProgress = 0;
  let scrollProgress = 0;
  let visible = true;
  let raf = 0;
  let disposed = false;

  const render = () => {
    renderer.render(scene, camera);
    host.classList.add('is-webgl');
    document.documentElement.dataset.sceneReady = 'true';
  };

  const resetMotionState = () => {
    sceneRoot.position.copy(baseScenePosition);
    sceneRoot.rotation.set(0, 0, 0);
    ceramicSet.position.copy(ceramicBasePosition);
    ceramicSet.rotation.set(0, ceramicBaseRotationY, 0);
    plinth.position.copy(plinthBasePosition);
    contact.material.opacity = contactBaseOpacity;
    contact.scale.set(1, 1, 1);
    key.position.copy(keyBasePosition);
  };

  const applyFrame = () => {
    const rect = host.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    frame = frameForWidth(width);
    baseCamera = frame.camera.clone();
    baseLookAt = frame.lookAt.clone();
    baseScenePosition = frame.scenePosition.clone();

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, frame.dpr));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = frame.fov;
    camera.updateProjectionMatrix();

    resetMotionState();
    sceneRoot.scale.setScalar(frame.sceneScale);

    if (key.shadow.mapSize.x !== frame.shadowSize) {
      key.shadow.mapSize.set(frame.shadowSize, frame.shadowSize);
      if (key.shadow.map) {
        key.shadow.map.dispose();
        key.shadow.map = null;
      }
    }

    camera.position.copy(baseCamera);
    camera.lookAt(baseLookAt);
    render();
  };

  const updateScroll = () => {
    if (reducedMotion) {
      targetScrollProgress = 0;
      scrollProgress = 0;
      resetMotionState();
      camera.position.copy(baseCamera);
      camera.lookAt(baseLookAt);
      render();
      return;
    }

    const rect = host.getBoundingClientRect();
    const travel = Math.max(window.innerHeight, rect.height);
    targetScrollProgress = clamp(-rect.top / travel, 0, 1);
    start();
  };

  const onPointerMove = (event) => {
    if (reducedMotion) return;
    const rect = host.getBoundingClientRect();
    targetPointerX = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
    targetPointerY = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
  };

  const onPointerLeave = () => {
    targetPointerX = 0;
    targetPointerY = 0;
  };

  const tick = () => {
    if (disposed || reducedMotion || !visible || document.hidden) {
      raf = 0;
      return;
    }

    pointerX += (targetPointerX - pointerX) * 0.065;
    pointerY += (targetPointerY - pointerY) * 0.065;
    scrollProgress += (targetScrollProgress - scrollProgress) * 0.085;

    const scroll = smoothstep(scrollProgress);
    const lift = Math.sin(scroll * Math.PI) * 0.08 + scroll * 0.10;

    camera.position.set(
      baseCamera.x + pointerX * 0.15 - scroll * 0.22,
      baseCamera.y - pointerY * 0.08 + scroll * 0.28,
      baseCamera.z - scroll * 0.46
    );

    const look = baseLookAt.clone();
    look.x += pointerX * 0.055 + scroll * 0.14;
    look.y -= pointerY * 0.025;
    look.y += scroll * 0.07;
    look.z += scroll * 0.08;
    camera.lookAt(look);

    sceneRoot.position.set(
      baseScenePosition.x - scroll * 0.06,
      baseScenePosition.y + scroll * 0.025,
      baseScenePosition.z
    );
    sceneRoot.rotation.y = -scroll * 0.025;

    ceramicSet.position.set(
      ceramicBasePosition.x - scroll * 0.10,
      ceramicBasePosition.y + lift,
      ceramicBasePosition.z + scroll * 0.16
    );
    ceramicSet.rotation.y = ceramicBaseRotationY + scroll * 0.42;
    ceramicSet.rotation.z = -scroll * 0.028;

    plinth.position.set(
      plinthBasePosition.x + scroll * 0.035,
      plinthBasePosition.y,
      plinthBasePosition.z - scroll * 0.12
    );

    contact.material.opacity = contactBaseOpacity - scroll * 0.30;
    contact.scale.set(1 - scroll * 0.08, 1 - scroll * 0.05, 1);

    key.position.set(
      keyBasePosition.x + scroll * 0.62,
      keyBasePosition.y - scroll * 0.22,
      keyBasePosition.z - scroll * 0.38
    );

    render();
    raf = requestAnimationFrame(tick);
  };

  const start = () => {
    if (!reducedMotion && visible && !raf && !document.hidden) raf = requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver((entries) => {
    visible = Boolean(entries[0]?.isIntersecting);
    if (visible) {
      render();
      start();
    }
  }, { threshold: 0.04 });
  observer.observe(host);

  const resizeObserver = new ResizeObserver(applyFrame);
  resizeObserver.observe(host);

  host.addEventListener('pointermove', onPointerMove, { passive: true });
  host.addEventListener('pointerleave', onPointerLeave, { passive: true });
  window.addEventListener('scroll', updateScroll, { passive: true });
  document.addEventListener('visibilitychange', start);

  applyFrame();
  updateScroll();
  start();

  return () => {
    disposed = true;
    if (raf) cancelAnimationFrame(raf);
    observer.disconnect();
    resizeObserver.disconnect();
    host.removeEventListener('pointermove', onPointerMove);
    host.removeEventListener('pointerleave', onPointerLeave);
    window.removeEventListener('scroll', updateScroll);
    document.removeEventListener('visibilitychange', start);
    contactTexture.dispose();
    renderer.dispose();
  };
}
