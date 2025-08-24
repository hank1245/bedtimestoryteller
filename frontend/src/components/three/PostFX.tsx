import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

export default function PostFX({
  bloomIntensity = 2.2,
  luminanceThreshold = 0.6,
  luminanceSmoothing = 0.85,
  vignetteOffset = 0.18,
  vignetteDarkness = 0.6,
}: {
  bloomIntensity?: number;
  luminanceThreshold?: number;
  luminanceSmoothing?: number;
  vignetteOffset?: number;
  vignetteDarkness?: number;
}) {
  return (
    <EffectComposer>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={luminanceThreshold}
        luminanceSmoothing={luminanceSmoothing}
        height={10}
      />
      <Vignette
        offset={vignetteOffset}
        darkness={vignetteDarkness}
        eskil={false}
      />
    </EffectComposer>
  );
}
