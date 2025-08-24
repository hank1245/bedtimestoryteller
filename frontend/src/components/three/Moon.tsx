import { Sphere } from "@react-three/drei";

export default function Moon({
  position = [-6, 7, -2],
  radius = 0.8,
  lightIntensity = 3.5,
  lightColor = "#f9e9a0",
  surfaceColor = "#fff2a6",
}: {
  position?: [number, number, number];
  radius?: number;
  lightIntensity?: number;
  lightColor?: string;
  surfaceColor?: string;
}) {
  return (
    <>
      <pointLight
        position={position}
        color={lightColor}
        intensity={lightIntensity}
        distance={120}
        decay={2}
      />
      <Sphere args={[radius, 32, 32]} position={position}>
        <meshBasicMaterial color={surfaceColor} toneMapped={false} />
      </Sphere>
    </>
  );
}
