import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import * as satellite from 'satellite.js';
import { useMissionStore } from '../store/useMissionStore';
import { Satellite } from '../types';

export default function GlobeView() {
  const { satellites } = useMissionStore();
  const satList = Object.values(satellites);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
      <div>
        <h2 className="text-2xl font-display font-bold tracking-tight">Orbital Map</h2>
        <p className="text-muted-foreground text-sm">Real-time 3D visualization of fleet positions</p>
      </div>

      <div className="flex-1 glass-panel rounded-xl overflow-hidden relative border border-border">
        <Canvas camera={{ position: [0, 0, 40], fov: 45 }}>
          <ambientLight intensity={0.1} />
          <pointLight position={[100, 10, 50]} intensity={1.5} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          
          <Earth />
          
          {satList.map(sat => (
            <SatelliteMarker key={sat._id} sat={sat} />
          ))}
          
          <OrbitControls enablePan={true} enableZoom={true} minDistance={12} maxDistance={100} />
        </Canvas>

        {/* Legend overlay */}
        <div className="absolute bottom-6 left-6 glass-panel p-4 rounded-lg flex flex-col gap-2 text-sm pointer-events-none">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-success shadow-[0_0_10px_#00E676]"></div> Nominal</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-warning shadow-[0_0_10px_#FFC400]"></div> Warning</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-destructive shadow-[0_0_10px_#FF1744]"></div> Critical</div>
        </div>
      </div>
    </div>
  );
}

function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.0005; // slow Earth rotation
    }
  });

  return (
    <Sphere ref={earthRef} args={[10, 64, 64]}>
      {/* Basic wireframe/dark earth material since we don't have textures easily available */}
      <meshStandardMaterial 
        color="#0B0E14" 
        emissive="#0a192f"
        emissiveIntensity={0.2}
        wireframe={true} 
        transparent 
        opacity={0.3} 
      />
      
      {/* Inner solid dark sphere */}
      <Sphere args={[9.9, 32, 32]}>
        <meshBasicMaterial color="#020617" />
      </Sphere>
    </Sphere>
  );
}

function SatelliteMarker({ sat }: { sat: Satellite }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Parse TLE once
  const satrec = useMemo(() => {
    try {
      return satellite.twoline2satrec(sat.tleLine1, sat.tleLine2);
    } catch (e) {
      return null;
    }
  }, [sat.tleLine1, sat.tleLine2]);

  useFrame(() => {
    if (!satrec || !meshRef.current) return;
    
    // Propagate satellite position
    const date = new Date();
    const positionAndVelocity = satellite.propagate(satrec, date);
    if (!positionAndVelocity) return;
    const positionEci = positionAndVelocity.position;
    
    if (typeof positionEci !== 'boolean' && positionEci) {
      const gmst = satellite.gstime(date);
      const positionGd = satellite.eciToGeodetic(positionEci as satellite.EciVec3<number>, gmst);
      
      const longitude = positionGd.longitude;
      const latitude = positionGd.latitude;
      const height = positionGd.height;
      
      // Convert to 3D cartesian coordinates
      // Earth radius is ~6371 km. Our 3D Earth radius is 10.
      // So altitude scaling: 10 + (height / 6371) * 10
      const r = 10 + (height / 6371) * 10;
      
      const x = r * Math.cos(latitude) * Math.cos(longitude);
      const y = r * Math.sin(latitude);
      const z = r * Math.cos(latitude) * Math.sin(longitude);
      
      meshRef.current.position.set(x, y, z);
    }
  });

  const color = sat.status === 'critical' ? '#FF1744' : sat.status === 'warning' ? '#FFC400' : '#00E676';

  return (
    <mesh 
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshBasicMaterial color={color} />
      
      {hovered && (
        <Html distanceFactor={15} zIndexRange={[100, 0]} className="pointer-events-none">
          <div className="bg-surface/90 border border-border backdrop-blur-md px-3 py-2 rounded-lg text-xs whitespace-nowrap shadow-xl">
            <div className="font-bold font-display text-white">{sat.name}</div>
            <div className="text-muted-foreground font-mono mt-1">NORAD: {sat.noradId}</div>
            <div className={`mt-1 font-bold uppercase tracking-wider ${sat.status === 'critical' ? 'text-destructive' : sat.status === 'warning' ? 'text-warning' : 'text-success'}`}>
              {sat.status}
            </div>
          </div>
        </Html>
      )}
    </mesh>
  );
}
