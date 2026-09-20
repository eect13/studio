import { useEffect, useRef } from "react";
import * as THREE from "three";
import { parseCssHex, useStudioTheme } from "@/lib/theme";

export function SceneCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useStudioTheme((s) => s.theme);
  const sceneId = useStudioTheme((s) => s.scene);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const styles = getComputedStyle(document.documentElement);
    const accent = parseCssHex(styles.getPropertyValue("--studio-accent"));
    const bg = parseCssHex(styles.getPropertyValue("--studio-bg"), 0x070807);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(bg, sceneId === "lattice" ? 0.032 : 0.045);

    const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 80);
    if (sceneId === "lattice") camera.position.set(0, 8.4, 11.2);
    else camera.position.set(0, 0, 9);

    const pointer = new THREE.Vector2(0, 0);
    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("pointermove", onPointer);

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
    const disposables: THREE.Object3D[] = [];
    const geos: THREE.BufferGeometry[] = [];
    const mats: THREE.Material[] = [];

    let animate: () => void;

    if (sceneId === "lattice") {
      const cols = window.innerWidth < 700 ? 14 : 20;
      const rows = window.innerWidth < 700 ? 10 : 14;
      const count = cols * rows;
      const tile = new THREE.BoxGeometry(0.46, 0.045, 0.46);
      const tileMat = new THREE.MeshBasicMaterial({
        color: accent,
        transparent: true,
        opacity: 0.42,
      });
      const mesh = new THREE.InstancedMesh(tile, tileMat, count);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      scene.add(mesh);
      geos.push(tile);
      mats.push(tileMat);
      disposables.push(mesh);

      const grid = new THREE.GridHelper(32, 32, accent, accent);
      const gridMat = grid.material;
      if (Array.isArray(gridMat)) {
        for (const m of gridMat) {
          m.transparent = true;
          m.opacity = 0.14;
          mats.push(m);
        }
      } else {
        gridMat.transparent = true;
        gridMat.opacity = 0.14;
        mats.push(gridMat);
      }
      scene.add(grid);
      disposables.push(grid);

      const dummy = new THREE.Object3D();
      const spacing = 0.62;

      animate = () => {
        const t = (performance.now() - t0) / 1000;
        const docH = Math.max(document.body.scrollHeight - window.innerHeight, 1);
        const doc = Math.min(scrollY / docH, 1);
        const px = pointer.x * 6.2;
        const pz = -pointer.y * 5.4;

        for (let j = 0; j < rows; j++) {
          for (let i = 0; i < cols; i++) {
            const x = (i - (cols - 1) / 2) * spacing;
            const z = (j - (rows - 1) / 2) * spacing;
            const dx = x - px;
            const dz = z - pz;
            const d = Math.sqrt(dx * dx + dz * dz);
            const wave = Math.sin(t * 1.15 + d * 0.9) * 0.16;
            const well = Math.exp(-d * d * 0.11) * 1.15;
            const y = wave + well;
            dummy.position.set(x, y, z);
            dummy.scale.set(1, 1 + y * 0.55, 1);
            dummy.rotation.set(0, t * 0.04, 0);
            dummy.updateMatrix();
            mesh.setMatrixAt(j * cols + i, dummy.matrix);
          }
        }
        mesh.instanceMatrix.needsUpdate = true;
        mesh.rotation.y = doc * 0.18;

        camera.position.x += (pointer.x * 1.4 - camera.position.x) * 0.035;
        camera.position.z += (11.2 - pointer.y * 0.8 - camera.position.z) * 0.03;
        camera.lookAt(0, 0.4, 0);
        renderer.render(scene, camera);
      };
    } else {
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
      geos.push(icoGeo, wire);
      mats.push(icoMat);

      const innerGeo = new THREE.IcosahedronGeometry(1.05, 0);
      const innerMat = new THREE.MeshBasicMaterial({
        color: accent,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
      });
      const inner = new THREE.Mesh(innerGeo, innerMat);
      group.add(inner);
      geos.push(innerGeo);
      mats.push(innerMat);

      const count = window.innerWidth < 700 ? 1200 : 2400;
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
      geos.push(pGeo);
      mats.push(pMat);

      const base = pGeo.attributes.position.array as Float32Array;
      const orig = base.slice();

      animate = () => {
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
    }

    renderer.setAnimationLoop(animate);

    return () => {
      renderer.setAnimationLoop(null);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      for (const obj of disposables) {
        scene.remove(obj);
        if (obj instanceof THREE.InstancedMesh) obj.dispose();
      }
      for (const g of geos) g.dispose();
      for (const m of mats) m.dispose();
      renderer.dispose();
    };
  }, [theme, sceneId]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
