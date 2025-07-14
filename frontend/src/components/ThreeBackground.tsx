import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Sphere } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import styled from "styled-components";
import * as THREE from "three";

const BackgroundContainer = styled.div<{ $intensity?: number }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  opacity: ${(props) => props.$intensity || 1};
  pointer-events: none;
`;

function Moon({
  position = [4, 5, -8],
}: {
  position?: [number, number, number];
}) {
  return (
    <>
      <pointLight
        position={position}
        color="#f9e9a0"
        intensity={5}
        distance={100}
        decay={2}
      />
      <Sphere args={[0.8, 32, 32]} position={position}>
        <meshBasicMaterial color="#fff2a6" toneMapped={false} />
      </Sphere>
    </>
  );
}

function FloatingStars({ count = 300 }: { count?: number }) {
  const starsRef = useRef<THREE.Points>(null);

  const starPositions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const distance = 15 + Math.random() * 30;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 40;

      positions[i * 3] = Math.cos(angle) * distance;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * distance;
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
      <pointsMaterial color="#fff5a0" size={2} sizeAttenuation={false} />
    </points>
  );
}

function Scene({
  moonPosition,
  starsCount = 300,
}: {
  moonPosition?: [number, number, number];
  starsCount?: number;
}) {
  return (
    <>
      <ambientLight intensity={0.1} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.5}
        color="#ffffff"
      />
      <Stars
        radius={100}
        depth={30}
        count={5000}
        factor={4}
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
  intensity = 1,
  moonPosition = [4, 5, -8],
  starsCount = 300,
}: ThreeBackgroundProps) {
  return (
    <BackgroundContainer $intensity={intensity}>
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <Scene moonPosition={moonPosition} starsCount={starsCount} />
        <EffectComposer>
          <Bloom
            intensity={3}
            luminanceThreshold={0.65}
            luminanceSmoothing={0.9}
            height={10}
          />
        </EffectComposer>
      </Canvas>
    </BackgroundContainer>
  );
}
