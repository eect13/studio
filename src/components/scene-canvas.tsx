import { useEffect, useRef } from "react";
import * as THREE from "three";
import { parseCssHex, THEMES, useStudioTheme } from "@/lib/theme";

type SceneApi = {
  mats: Array<THREE.LineBasicMaterial | THREE.MeshBasicMaterial | THREE.PointsMaterial>;
  scene: THREE.Scene;
};

export function SceneCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const apiRef = useRef<SceneApi | null>(null);
  const theme = useStudioTheme((s) => s.theme);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const t0theme = THEMES[useStudioTheme.getState().theme];
    const accent = parseCssHex(t0theme.accent);
    const bg = parseCssHex(t0theme.bg, 0x070807);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(bg, 0.045);

    const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 80);
    camera.position.set(0, 0, 9);

    const group = new THREE.Group();
    scene.add(group);

    const icoGeo = new THREE.IcosahedronGeometry(2.35, 1);
    const wire = new THREE.WireframeGeometry(icoGeo);
    const icoMat = new THREE.LineBasicMaterial({
      color: accent,
      transparent: true,
      opacity: 0.22,
    });
    const ico = new THREE.LineSegments(wire, icoMat);
    group.add(ico);

    const innerGeo = new THREE.IcosahedronGeometry(1.05, 0);
    const innerMat = new THREE.MeshBasicMaterial({
      color: accent,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const inner = new THREE.Mesh(innerGeo, innerMat);
    group.add(inner);

    const count = window.innerWidth < 700 ? 700 : 1400;
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 2.2 + Math.random() * 6.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi) * 0.7;
      seeds[i] = Math.random() * Math.PI * 2;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({
      color: accent,
      size: 0.028,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    apiRef.current = { mats: [icoMat, innerMat, pMat], scene };

    const pointer = new THREE.Vector2(0, 0);
    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    let scrollY = window.scrollY;
    const onScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight, false);
    };
    window.addEventListener("resize", onResize);

    const t0 = performance.now();
    const base = pGeo.attributes.position.array as Float32Array;
    const orig = base.slice();

    const animate = () => {
      const t = (performance.now() - t0) / 1000;
      const docH = Math.max(document.body.scrollHeight - window.innerHeight, 1);
      const doc = Math.min(scrollY / docH, 1);

      group.rotation.x = t * 0.07 + pointer.y * 0.18 + doc * 0.8;
      group.rotation.y = t * 0.11 + pointer.x * 0.28 + doc * 1.1;
      inner.rotation.y = -t * 0.22;
      inner.rotation.z = t * 0.08;
      ico.scale.setScalar(1 + Math.sin(t * 0.6) * 0.04);

      camera.position.x += (pointer.x * 0.6 - camera.position.x) * 0.04;
      camera.position.y += (pointer.y * 0.35 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      for (let i = 0; i < count; i++) {
        const ix = i * 3;
        const swirl = Math.sin(t * 0.35 + seeds[i]) * 0.08;
        let x = orig[ix] + swirl;
        let y = orig[ix + 1] + Math.cos(t * 0.25 + seeds[i]) * 0.06;
        const z = orig[ix + 2];
        const dx = x - pointer.x * 4.2;
        const dy = y - pointer.y * 2.6;
        const d2 = dx * dx + dy * dy;
        if (d2 < 4.2) {
          const f = (4.2 - d2) * 0.18;
          x += dx * f;
          y += dy * f;
        }
        base[ix] = x;
        base[ix + 1] = y;
        base[ix + 2] = z;
      }
      pGeo.attributes.position.needsUpdate = true;
      particles.rotation.y = t * 0.02 + doc * 0.4;
      renderer.render(scene, camera);
    };

    const onVis = () => {
      renderer.setAnimationLoop(document.hidden ? null : animate);
    };
    document.addEventListener("visibilitychange", onVis);
    renderer.setAnimationLoop(animate);

    return () => {
      renderer.setAnimationLoop(null);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      apiRef.current = null;
      icoGeo.dispose();
      wire.dispose();
      icoMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      pGeo.dispose();
      pMat.dispose();
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;
    const t = THEMES[theme];
    const accent = parseCssHex(t.accent);
    const bg = parseCssHex(t.bg, 0x070807);
    for (const mat of api.mats) mat.color.setHex(accent);
    api.scene.fog = new THREE.FogExp2(bg, 0.045);
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
