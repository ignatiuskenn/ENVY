import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight, Eye, ShoppingBag } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { formatPeso } from '../../utils/money';
import { EnvyPixelMark } from './EnvyPixelMark';

gsap.registerPlugin(useGSAP);

const ITEM_SPACING = 2.05;

function createFallbackTexture(product) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');

  // Transparent outer frame, crisp floating garment tag silhouette
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#1b2229';
  ctx.beginPath();
  ctx.roundRect(76, 56, 360, 480, 18);
  ctx.fill();

  ctx.strokeStyle = '#24FF6A';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#24FF6A';
  ctx.font = 'bold 24px monospace';
  ctx.fillText(`EV-${String(product.id).padStart(2, '0')}`, 106, 114);

  ctx.fillStyle = '#F3F6F8';
  ctx.font = 'bold 30px sans-serif';
  const words = (product.name || 'ENVY').split(' ');
  let line = '';
  let y = 260;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > 300) {
      ctx.fillText(line, 106, y);
      line = word;
      y += 42;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, 106, y);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function loadCutoutTexture(url, onReady) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const imgW = img.naturalWidth || 520;
    const imgH = img.naturalHeight || 620;
    const scale = Math.min((canvas.width - 24) / imgW, (canvas.height - 24) / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const dx = (canvas.width - drawW) / 2;
    const dy = (canvas.height - drawH) / 2;

    ctx.drawImage(img, dx, dy, drawW, drawH);

    // For raster product photos with solid light backgrounds, strip pure white edge pixels
    if (!url.endsWith('.svg')) {
      try {
        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = frame.data;
        for (let i = 0; i < d.length; i += 4) {
          if (d[i] > 242 && d[i + 1] > 242 && d[i + 2] > 242) {
            d[i + 3] = 0;
          }
        }
        ctx.putImageData(frame, 0, 0);
      } catch {
        // Ignore CORS-tainted canvas readbacks
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    onReady(tex);
  };
  img.src = url;
}

function createGarmentGeometry() {
  const geo = new THREE.PlaneGeometry(1.75, 2.1, 20, 24);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;

  for (let i = 0; i < pos.count; i++) {
    const u = uv.getX(i);
    const v = uv.getY(i);
    const shoulderTaper = v > 0.82 ? 1 - (v - 0.82) * 0.32 : 1;
    const x = pos.getX(i) * shoulderTaper;
    const chestDrape = Math.sin(v * Math.PI) * 0.13;
    const pleatWave = Math.sin(u * Math.PI * 3) * 0.025 * (1 - v * 0.4);
    pos.setX(i, x);
    pos.setZ(i, chestDrape + pleatWave);
  }

  geo.computeVertexNormals();
  return geo;
}

export function SpatialGarmentRack({
  products = [],
  categories = [],
  activeCategoryId = '',
  onSelectCategory,
  onAddToCart,
}) {
  const containerRef = useRef(null);
  const canvasHostRef = useRef(null);
  const cameraRef = useRef(null);
  const isTransitioningRef = useRef(false);
  const navigate = useNavigate();

  const filteredProducts = useMemo(() => {
    if (!activeCategoryId) return products;
    return products.filter(
      (p) => String(p.category_id) === String(activeCategoryId)
    );
  }, [products, activeCategoryId]);

  const [selection, setSelection] = useState({
    categoryKey: String(activeCategoryId),
    index: 0,
  });

  const activeIndex =
    selection.categoryKey === String(activeCategoryId)
      ? Math.min(selection.index, Math.max(0, filteredProducts.length - 1))
      : 0;

  const setActiveIndex = (nextOrUpdater) => {
    setSelection((prev) => {
      const base =
        prev.categoryKey === String(activeCategoryId)
          ? Math.min(prev.index, Math.max(0, filteredProducts.length - 1))
          : 0;
      const rawNext =
        typeof nextOrUpdater === 'function' ? nextOrUpdater(base) : nextOrUpdater;
      const clamped = Math.max(
        0,
        Math.min(Math.max(0, filteredProducts.length - 1), rawNext)
      );
      return { categoryKey: String(activeCategoryId), index: clamped };
    });
  };

  const activeProduct = filteredProducts[activeIndex] || null;
  const activeIndexRef = useRef(activeIndex);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const rackStateRef = useRef({
    offsetX: 0,
    isDragging: false,
  });
  const itemVisualsRef = useRef([]);

  const reducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  const handleInspectProduct = useCallback(
    (productId) => {
      if (isTransitioningRef.current) return;
      isTransitioningRef.current = true;

      if (reducedMotion || !cameraRef.current || !containerRef.current) {
        navigate(`/products/${productId}`);
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => navigate(`/products/${productId}`),
      });

      tl.to(cameraRef.current.position, {
        z: 4.15,
        y: 0.24,
        duration: 0.36,
        ease: 'power2.inOut',
      }).to(
        containerRef.current,
        {
          opacity: 0.2,
          duration: 0.24,
          ease: 'power2.in',
        },
        0.12
      );
    },
    [navigate, reducedMotion]
  );

  const inspectRef = useRef(handleInspectProduct);
  useEffect(() => {
    inspectRef.current = handleInspectProduct;
  }, [handleInspectProduct]);

  useEffect(() => {
    const host = canvasHostRef.current;
    if (!host || filteredProducts.length === 0) return;

    isTransitioningRef.current = false;
    const width = host.clientWidth || 800;
    const height = host.clientHeight || 560;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.14, width < 640 ? 7.1 : 6.1);
    cameraRef.current = camera;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    host.appendChild(renderer.domElement);

    // Studio lighting: ambient + overhead key spot + signal-green rim
    const ambient = new THREE.AmbientLight(0xe6eef5, 1.0);
    const spot = new THREE.SpotLight(0xffffff, 56, 20, Math.PI / 4, 0.5, 1.4);
    spot.position.set(0, 4.4, 3.8);
    spot.target.position.set(0, -0.1, 0);
    const rim = new THREE.PointLight(0x24ff6a, 2.0, 8);
    rim.position.set(0, 1.5, -1.6);
    scene.add(ambient, spot, spot.target, rim);

    const railGroup = new THREE.Group();
    const railGeo = new THREE.CylinderGeometry(0.04, 0.04, 38, 24);
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xd4dde6,
      metalness: 0.92,
      roughness: 0.18,
    });
    const railMesh = new THREE.Mesh(railGeo, chromeMat);
    railMesh.rotation.z = Math.PI / 2;
    railMesh.position.y = 1.58;
    scene.add(railMesh);
    scene.add(railGroup);

    const hookGeo = new THREE.TorusGeometry(0.09, 0.015, 10, 24, Math.PI);
    const stemGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.18, 10);
    const barGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.86, 12);
    const hangerBodyMat = new THREE.MeshStandardMaterial({
      color: 0x262e36,
      metalness: 0.6,
      roughness: 0.3,
    });
    const garmentGeo = createGarmentGeometry();

    const disposables = [railGeo, chromeMat, hookGeo, stemGeo, barGeo, hangerBodyMat, garmentGeo];
    const clickTargets = [];
    const items = [];
    let disposed = false;

    filteredProducts.forEach((product, idx) => {
      const group = new THREE.Group();
      group.position.set(idx * ITEM_SPACING, 0, 0);

      const hook = new THREE.Mesh(hookGeo, chromeMat);
      hook.position.set(0, 1.58, 0);

      const stem = new THREE.Mesh(stemGeo, chromeMat);
      stem.position.set(0, 1.46, 0);

      const bar = new THREE.Mesh(barGeo, hangerBodyMat);
      bar.rotation.z = Math.PI / 2;
      bar.position.set(0, 1.35, 0);

      const fallbackTex = createFallbackTexture(product);
      disposables.push(fallbackTex);

      const garmentMat = new THREE.MeshStandardMaterial({
        map: fallbackTex,
        transparent: true,
        alphaTest: 0.04,
        roughness: 0.36,
        metalness: 0.16,
        side: THREE.DoubleSide,
      });
      disposables.push(garmentMat);

      if (product.image_url) {
        loadCutoutTexture(product.image_url, (cutoutTex) => {
          if (disposed) {
            cutoutTex.dispose();
            return;
          }
          garmentMat.map = cutoutTex;
          garmentMat.needsUpdate = true;
          disposables.push(cutoutTex);
        });
      }

      const garmentMesh = new THREE.Mesh(garmentGeo, garmentMat);
      garmentMesh.position.set(0, 0.36, 0.03);
      garmentMesh.userData = { productIndex: idx, productId: product.id };

      group.add(hook, stem, bar, garmentMesh);
      railGroup.add(group);
      clickTargets.push(garmentMesh);
      items.push({
        group,
        garmentMat,
        z: idx === 0 ? 0.58 : -0.24,
        scale: idx === 0 ? 1.08 : 0.88,
        rotY: 0,
        swingAngle: 0,
        swingVel: 0,
        tint: idx === 0 ? 1 : 0.52,
      });
    });

    itemVisualsRef.current = items;
    rackStateRef.current.offsetX = -activeIndexRef.current * ITEM_SPACING;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downX = 0;
    let downY = 0;
    let startOffset = 0;
    let moved = false;

    const onPointerDown = (e) => {
      rackStateRef.current.isDragging = true;
      downX = e.clientX;
      downY = e.clientY;
      startOffset = rackStateRef.current.offsetX;
      moved = false;
      gsap.killTweensOf(rackStateRef.current);
    };

    const onPointerMove = (e) => {
      if (!rackStateRef.current.isDragging) return;
      const dx = e.clientX - downX;
      const dy = e.clientY - downY;
      if (Math.hypot(dx, dy) > 6) moved = true;
      const minOffset = -(filteredProducts.length - 1) * ITEM_SPACING - 0.4;
      const maxOffset = 0.4;
      const next = startOffset + dx * 0.0085;
      rackStateRef.current.offsetX = Math.max(minOffset, Math.min(maxOffset, next));
    };

    const onPointerUp = (e) => {
      if (!rackStateRef.current.isDragging) return;
      rackStateRef.current.isDragging = false;

      if (moved) {
        const nearest = Math.round(-rackStateRef.current.offsetX / ITEM_SPACING);
        const clamped = Math.max(0, Math.min(filteredProducts.length - 1, nearest));
        if (clamped === activeIndexRef.current) {
          gsap.to(rackStateRef.current, {
            offsetX: -clamped * ITEM_SPACING,
            duration: reducedMotion ? 0 : 0.45,
            ease: 'power3.out',
          });
        } else {
          setActiveIndex(clamped);
        }
        return;
      }

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickTargets, false);
      if (hits.length > 0) {
        const { productIndex, productId } = hits[0].object.userData;
        if (productIndex === activeIndexRef.current) {
          inspectRef.current?.(productId);
        } else {
          if (items[productIndex]) {
            items[productIndex].swingVel = productIndex > activeIndexRef.current ? -0.025 : 0.025;
          }
          setActiveIndex(productIndex);
        }
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    const onResize = () => {
      if (!host) return;
      const w = host.clientWidth || 800;
      const h = host.clientHeight || 560;
      camera.aspect = w / h;
      camera.position.z = w < 640 ? 7.1 : 6.1;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    let rafId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const targetIdx = activeIndexRef.current;

      railGroup.position.x = rackStateRef.current.offsetX;

      items.forEach((item, idx) => {
        const dist = Math.abs(idx - targetIdx);
        const isCurrent = idx === targetIdx;
        const targetZ = isCurrent ? 0.58 : -0.22 * Math.min(dist, 2);
        const targetScale = isCurrent ? 1.08 : Math.max(0.82, 1 - dist * 0.09);
        const targetRotY = isCurrent ? 0 : idx < targetIdx ? 0.18 : -0.18;
        const targetTint = isCurrent ? 1.0 : 0.52;

        const lerpAlpha = reducedMotion ? 1 : 0.12;
        item.z += (targetZ - item.z) * lerpAlpha;
        item.scale += (targetScale - item.scale) * lerpAlpha;
        item.rotY += (targetRotY - item.rotY) * lerpAlpha;
        item.tint += (targetTint - item.tint) * lerpAlpha;

        // Damped spring pendulum swing on click
        item.swingVel += -item.swingAngle * 0.08;
        item.swingVel *= 0.9;
        item.swingAngle += item.swingVel;

        item.group.position.z = item.z;
        item.group.scale.setScalar(item.scale);

        const swayY = isCurrent && !reducedMotion ? Math.sin(elapsed * 1.4) * 0.045 : 0;
        const swayZ = isCurrent && !reducedMotion ? Math.cos(elapsed * 1.1) * 0.009 : 0;
        item.group.rotation.y = item.rotY + swayY;
        item.group.rotation.z = swayZ + (reducedMotion ? 0 : item.swingAngle);

        item.garmentMat.color.setRGB(item.tint, item.tint, item.tint);
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      domEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
      disposables.forEach((d) => d.dispose?.());
      renderer.dispose();
      if (domEl.parentNode === host) {
        host.removeChild(domEl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredProducts, reducedMotion]);

  // GSAP damped rail glide + HUD lock-in transition when activeIndex changes
  useGSAP(
    () => {
      if (!rackStateRef.current.isDragging) {
        gsap.to(rackStateRef.current, {
          offsetX: -activeIndex * ITEM_SPACING,
          duration: reducedMotion ? 0 : 0.72,
          ease: 'power3.out',
        });
      }

      if (!reducedMotion) {
        gsap.fromTo(
          '[data-rack-hud]',
          { opacity: 0.35, y: 6, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power3.out' }
        );
      }
    },
    { scope: containerRef, dependencies: [activeIndex, filteredProducts.length] }
  );

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setActiveIndex((i) => i - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setActiveIndex((i) => i + 1);
    }
  };

  if (products.length === 0) return null;

  return (
    <section
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="ENVY 3D Spatial Product Rack"
      className="kalle-studio-grid relative h-[560px] w-full overflow-hidden border-b border-[#262E36] select-none focus:outline-none sm:h-[640px] lg:h-[690px]"
    >
      {/* Top Centered Brand Signature */}
      <div className="pointer-events-none absolute inset-x-0 top-6 z-20 flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          <EnvyPixelMark className="h-7 w-7 sm:h-8 sm:w-8" />
          <span className="font-mono text-2xl font-black tracking-[0.34em] text-[#F3F6F8] sm:text-3xl">
            ENVY
          </span>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-[#8A99AD]">
          SPATIAL RACK // CLICK GARMENT TO FOCUS OR INSPECT
        </p>
      </div>

      {/* Three.js Canvas Mount */}
      <div
        ref={canvasHostRef}
        className="h-full w-full cursor-grab active:cursor-grabbing"
      />

      {/* Left / Right Rail Stepper Controls */}
      {filteredProducts.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setActiveIndex((i) => i - 1)}
            disabled={activeIndex <= 0}
            aria-label="Previous garment"
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 cursor-pointer rounded-md border border-[#262E36] bg-[#171C21]/85 p-2 text-[#F3F6F8] transition hover:border-[#24FF6A] hover:text-[#24FF6A] disabled:cursor-not-allowed disabled:opacity-30 sm:left-6"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setActiveIndex((i) => i + 1)}
            disabled={activeIndex >= filteredProducts.length - 1}
            aria-label="Next garment"
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 cursor-pointer rounded-md border border-[#262E36] bg-[#171C21]/85 p-2 text-[#F3F6F8] transition hover:border-[#24FF6A] hover:text-[#24FF6A] disabled:cursor-not-allowed disabled:opacity-30 sm:right-6"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Center Green Targeting Reticle */}
      {activeProduct && (
        <div
          data-rack-hud
          className="pointer-events-none absolute left-1/2 top-[47%] z-10 h-56 w-48 -translate-x-1/2 -translate-y-1/2 border border-[#24FF6A]/55 sm:h-72 sm:w-64"
        >
          <span className="absolute -left-1.5 -top-1.5 h-3 w-3 border-l-2 border-t-2 border-[#24FF6A]" />
          <span className="absolute -right-1.5 -top-1.5 h-3 w-3 border-r-2 border-t-2 border-[#24FF6A]" />
          <span className="absolute -bottom-1.5 -left-1.5 h-3 w-3 border-b-2 border-l-2 border-[#24FF6A]" />
          <span className="absolute -bottom-1.5 -right-1.5 h-3 w-3 border-b-2 border-r-2 border-[#24FF6A]" />

          <span className="absolute -top-6 left-0 rounded-xs bg-[#24FF6A] px-2 py-0.5 font-mono text-[10px] font-black tracking-wider text-[#0B0E11]">
            EV-{String(activeProduct.id).padStart(2, '0')}
          </span>

          {activeProduct.stock_quantity <= 0 && (
            <span className="absolute -top-6 right-0 rounded-xs bg-red-600 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-white">
              Out of Stock
            </span>
          )}
        </div>
      )}

      {/* Bottom Telemetry Readout + Category Dock */}
      <div className="absolute inset-x-0 bottom-4 z-20 flex flex-col items-center gap-3 px-3 sm:bottom-5">
        {activeProduct && (
          <div
            data-rack-hud
            className="flex flex-wrap items-center justify-center gap-3 rounded-md border border-[#262E36] bg-[#171C21]/92 px-3.5 py-2 backdrop-blur-md"
          >
            <div className="text-center sm:text-left">
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#F3F6F8]">
                {activeProduct.name}
              </p>
              <p className="font-mono text-xs font-semibold text-[#24FF6A]">
                {formatPeso(activeProduct.price)}
                <span className="ml-2 text-[11px] font-normal text-[#8A99AD]">
                  {activeProduct.stock_quantity > 0
                    ? `${activeProduct.stock_quantity} IN STOCK`
                    : 'SOLD OUT'}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={activeProduct.stock_quantity <= 0}
                onClick={() => onAddToCart?.(activeProduct)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm bg-[#24FF6A] px-3 py-1.5 font-mono text-[11px] font-black uppercase tracking-wider text-[#0B0E11] transition hover:bg-[#4dff88] disabled:cursor-not-allowed disabled:bg-[#262E36] disabled:text-[#8A99AD]"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                {activeProduct.stock_quantity <= 0 ? 'Sold Out' : 'Add to Cart'}
              </button>

              <button
                type="button"
                onClick={() => handleInspectProduct(activeProduct.id)}
                className="inline-flex cursor-pointer items-center gap-1 rounded-sm border border-[#262E36] bg-[#111518] px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#F3F6F8] transition hover:border-[#24FF6A] hover:text-[#24FF6A]"
              >
                <Eye className="h-3.5 w-3.5" />
                Inspect
              </button>
            </div>
          </div>
        )}

        {/* KALLE-style Floating Category Dock */}
        <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-md border border-[#262E36] bg-[#0B0E11]/95 p-1 backdrop-blur-md">
          <button
            type="button"
            onClick={() => onSelectCategory?.('')}
            className={`cursor-pointer whitespace-nowrap rounded-xs px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider transition ${
              activeCategoryId === ''
                ? 'bg-[#24FF6A] text-[#0B0E11] font-black'
                : 'text-[#8A99AD] hover:text-[#F3F6F8]'
            }`}
          >
            All Gear
          </button>

          {categories.map((cat) => {
            const isSelected = String(activeCategoryId) === String(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory?.(String(cat.id))}
                className={`cursor-pointer whitespace-nowrap rounded-xs px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider transition ${
                  isSelected
                    ? 'bg-[#24FF6A] text-[#0B0E11] font-black'
                    : 'text-[#8A99AD] hover:text-[#F3F6F8]'
                }`}
              >
                {cat.name}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => navigate('/products')}
            className="cursor-pointer whitespace-nowrap rounded-xs border-l border-[#262E36] px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#8A99AD] transition hover:text-[#24FF6A]"
          >
            Catalog →
          </button>
        </div>
      </div>
    </section>
  );
}
