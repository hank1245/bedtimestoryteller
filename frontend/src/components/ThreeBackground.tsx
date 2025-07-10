import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Sphere } from "@react-three/drei";
import styled from "styled-components";
import * as THREE from "three";

const BackgroundContainer = styled.div<{ $intensity?: number }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  opacity: ${props => props.$intensity || 0.8};
  pointer-events: none;
`;

function Moon({ position = [4, 5, -8] }: { position?: [number, number, number] }) {
  return (
    <Sphere args={[0.8, 32, 32]} position={position}>
      <meshLambertMaterial color="#f0f0f0" />
    </Sphere>
  );
}

function FloatingStars({ count = 150 }: { count?: number }) {
  const starsRef = useRef<THREE.Points>(null);
  
  const starPositions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 25;
    }
    return positions;
  }, [count]);
  
  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y = state.clock.elapsedTime * 0.01;
    }
  });
  
  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={starPositions}
          itemSize={3}
          args={[] as any}
        />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.12} />
    </points>
  );
}

function Scene({ moonPosition, starsCount = 150 }: { 
  moonPosition?: [number, number, number];
  starsCount?: number;
}) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.6} color="#ffffff" />
      <Stars 
        radius={80} 
        depth={40} 
        count={3000} 
        factor={3} 
        saturation={0} 
        fade 
      />
      <FloatingStars count={starsCount} />
      <Moon position={moonPosition} />
    </>
  );
}

interface ThreeBackgroundProps {
  intensity?: number;
  moonPosition?: [number, number, number];
  starsCount?: number;
}

export default function ThreeBackground({ 
  intensity = 0.6, 
  moonPosition = [4, 5, -8],
  starsCount = 150 
}: ThreeBackgroundProps) {
  return (
    <BackgroundContainer $intensity={intensity}>
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <Scene moonPosition={moonPosition} starsCount={starsCount} />
      </Canvas>
    </BackgroundContainer>
  );
}