import React, { useEffect, useRef } from 'react';
import * as _THREE from 'three';
const THREE: any = _THREE;

interface GlobeSceneProps {
  className?: string;
}

interface DestinationHub {
  name: string;
  lat: number;
  lng: number;
}

const HUBS: DestinationHub[] = [
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  { name: 'Kyoto', lat: 35.0116, lng: 135.7681 },
  { name: 'Paris', lat: 48.8566, lng: 2.3522 },
  { name: 'New York', lat: 40.7128, lng: -74.006 },
  { name: 'Reykjavik', lat: 64.1466, lng: -21.9426 },
  { name: 'Cairo', lat: 30.0444, lng: 31.2357 },
  { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
];

const FLIGHT_ROUTES = [
  { from: HUBS[0], to: HUBS[2] }, // Tokyo -> Paris
  { from: HUBS[3], to: HUBS[1] }, // New York -> Kyoto
  { from: HUBS[2], to: HUBS[5] }, // Paris -> Cairo
  { from: HUBS[3], to: HUBS[6] }, // New York -> Rio
  { from: HUBS[2], to: HUBS[4] }, // Paris -> Reykjavik
];

// Helper: Convert Lat/Lng to Vector3 on Sphere
function latLngToVector3(lat: number, lng: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export const GlobeScene: React.FC<GlobeSceneProps> = ({ className = 'w-full h-[550px]' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<any>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5.2;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Globe Master Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 4. Base Sphere (Deep Twilight Navy)
    const globeRadius = 1.85;
    const sphereGeo = new THREE.SphereGeometry(globeRadius, 64, 64);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x070c18,
      roughness: 0.65,
      metalness: 0.35,
      emissive: 0x040810,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(sphereMesh);

    // 5. Cartographic Latitude/Longitude Wireframe Grid
    const gridGeo = new THREE.SphereGeometry(globeRadius + 0.005, 36, 18);
    const gridMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const gridMesh = new THREE.Mesh(gridGeo, gridMat);
    globeGroup.add(gridMesh);

    // 6. Dot Matrix Continent Particles
    const dotCount = 1800;
    const dotPositions = new Float32Array(dotCount * 3);
    for (let i = 0; i < dotCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = globeRadius + 0.012;

      dotPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      dotPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      dotPositions[i * 3 + 2] = r * Math.cos(phi);
    }
    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3));
    const dotMat = new THREE.PointsMaterial({
      color: 0xfb923c,
      size: 0.035,
      transparent: true,
      opacity: 0.45,
    });
    const dotPoints = new THREE.Points(dotGeo, dotMat);
    globeGroup.add(dotPoints);

    // 7. City Hub Pins & Beacons
    const pinGroup = new THREE.Group();
    globeGroup.add(pinGroup);

    HUBS.forEach((hub) => {
      const pos = latLngToVector3(hub.lat, hub.lng, globeRadius);

      // Pin Head (Glowing Orange Orb)
      const pinGeo = new THREE.SphereGeometry(0.045, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos);
      pinGroup.add(pinMesh);

      // Light Beacon Ray pointing outward
      const normal = pos.clone().normalize();
      const rayEnd = pos.clone().add(normal.clone().multiplyScalar(0.22));
      const rayGeo = new THREE.BufferGeometry().setFromPoints([pos, rayEnd]);
      const rayMat = new THREE.LineBasicMaterial({
        color: 0xfb923c,
        transparent: true,
        opacity: 0.75,
      });
      const rayLine = new THREE.Line(rayGeo, rayMat);
      pinGroup.add(rayLine);
    });

    // 8. Flight Trajectory Arcs
    const flightGroup = new THREE.Group();
    globeGroup.add(flightGroup);

    const arcPhotons: { mesh: any; curve: any; t: number; speed: number }[] = [];

    FLIGHT_ROUTES.forEach((route, idx) => {
      const vStart = latLngToVector3(route.from.lat, route.from.lng, globeRadius);
      const vEnd = latLngToVector3(route.to.lat, route.to.lng, globeRadius);

      // Calculate midpoint elevated into the atmosphere
      const vMid = new THREE.Vector3().addVectors(vStart, vEnd).multiplyScalar(0.5);
      const distance = vStart.distanceTo(vEnd);
      vMid.normalize().multiplyScalar(globeRadius + distance * 0.28);

      const curve = new THREE.QuadraticBezierCurve3(vStart, vMid, vEnd);
      const points = curve.getPoints(50);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(points);
      const curveMat = new THREE.LineBasicMaterial({
        color: idx % 2 === 0 ? 0xf97316 : 0x38bdf8,
        transparent: true,
        opacity: 0.35,
      });
      const curveLine = new THREE.Line(curveGeo, curveMat);
      flightGroup.add(curveLine);

      // Animated Photon
      const photonGeo = new THREE.SphereGeometry(0.03, 12, 12);
      const photonMat = new THREE.MeshBasicMaterial({
        color: idx % 2 === 0 ? 0xffedd5 : 0xe0f2fe,
      });
      const photonMesh = new THREE.Mesh(photonGeo, photonMat);
      flightGroup.add(photonMesh);

      arcPhotons.push({
        mesh: photonMesh,
        curve,
        t: Math.random(),
        speed: 0.0035 + Math.random() * 0.002,
      });
    });

    // 9. Atmospheric Glow Halo (BackSide Rim)
    const glowGeo = new THREE.SphereGeometry(globeRadius * 1.15, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glowMesh);

    // 10. Starfield Background
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 900;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 50;
      starPositions[i + 1] = (Math.random() - 0.5) * 50;
      starPositions[i + 2] = (Math.random() - 0.5) * 50;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.035,
      transparent: true,
      opacity: 0.5,
    });
    const starField = new THREE.Points(starsGeo, starsMat);
    scene.add(starField);

    // 11. Interactive Drag-To-Spin Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let velocityX = 0.002;
    let velocityY = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - prevMouseX;
      const deltaY = clientY - prevMouseY;

      velocityX = deltaX * 0.004;
      velocityY = deltaY * 0.004;

      globeGroup.rotation.y += velocityX;
      globeGroup.rotation.x += velocityY;

      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.style.cursor = 'grab';
    domElement.addEventListener('mousedown', onPointerDown);
    domElement.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);

    // 12. Main 60fps Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Inertia & Natural Rotation
      if (!isDragging) {
        velocityX *= 0.96;
        velocityY *= 0.96;
        // Keep a minimum idle spin
        if (Math.abs(velocityX) < 0.0018) velocityX = 0.0018;
      }
      globeGroup.rotation.y += velocityX;
      globeGroup.rotation.x += velocityY;

      // Restrict X tilt so earth doesn't flip upside down
      globeGroup.rotation.x = Math.max(-0.6, Math.min(0.6, globeGroup.rotation.x));

      // Advance Flight Photons
      arcPhotons.forEach((item) => {
        item.t = (item.t + item.speed) % 1;
        const pt = item.curve.getPoint(item.t);
        item.mesh.position.copy(pt);
      });

      // Subtle star drift
      starField.rotation.y += 0.0002;

      renderer.render(scene, camera);
    };
    animate();

    // 13. Responsive Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 500;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', onPointerDown);
      domElement.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchend', onPointerUp);
      cancelAnimationFrame(animationFrameId);

      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
      renderer.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      gridGeo.dispose();
      gridMat.dispose();
      dotGeo.dispose();
      dotMat.dispose();
      glowGeo.dispose();
      glowMat.dispose();
      starsGeo.dispose();
      starsMat.dispose();
    };
  }, []);

  return (
    <div className={`relative ${className} select-none`}>
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none text-[11px] uppercase tracking-wider text-slate-500 font-medium">
        Drag to rotate earth
      </div>
    </div>
  );
};

export default GlobeScene;
