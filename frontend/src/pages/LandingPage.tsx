import { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Sphere } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import type { Mesh, Points } from "three";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
`;

const twinkle = keyframes`
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
`;

const LandingContainer = styled.div`
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  background: linear-gradient(135deg, #0a0a23 0%, #1a1a4e 50%, #2d1b69 100%);
  font-family: "Georgia", serif;
`;

const Section = styled.div<{ index: number }>`
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 2rem;
  z-index: 2;
  animation: ${fadeIn} 1s ease-out;
  animation-delay: ${(props) => props.index * 0.2}s;
  animation-fill-mode: both;
`;

const Title = styled.h1`
  font-size: 4rem;
  font-weight: 300;
  color: #ffffff;
  text-align: center;
  margin-bottom: 2rem;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
  animation: ${float} 6s ease-in-out infinite;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.5rem;
  color: #e0e0ff;
  text-align: center;
  max-width: 800px;
  line-height: 1.6;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  margin: 1rem;
  max-width: 300px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
`;

const FeatureTitle = styled.h3`
  color: #ffffff;
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const FeatureText = styled.p`
  color: #e0e0ff;
  font-size: 1rem;
  line-height: 1.5;
`;

const FeaturesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  margin: 4rem 0;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const CreateButton = styled.button`
  background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
  border: none;
  color: white;
  font-size: 1.3rem;
  font-weight: 600;
  padding: 1rem 3rem;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(255, 107, 107, 0.3);
  text-transform: uppercase;
  letter-spacing: 1px;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(255, 107, 107, 0.4);
    background: linear-gradient(45deg, #ff5252, #ff7575);
  }

  &:active {
    transform: translateY(-2px);
  }
`;

const CanvasContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
`;

const ScrollIndicator = styled.div`
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  color: #ffffff;
  font-size: 0.9rem;
  animation: ${twinkle} 2s infinite;

  &::after {
    content: "↓";
    display: block;
    text-align: center;
    margin-top: 0.5rem;
    animation: ${float} 2s ease-in-out infinite;
  }
`;

const ProcessSection = styled.div`
  margin-bottom: 4rem;
  width: 100%;
  max-width: 900px;
`;

const ProcessTitle = styled.h2`
  font-size: 2.5rem;
  color: #ffffff;
  text-align: center;
  margin-bottom: 3rem;
  font-weight: 300;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ProcessSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const ProcessStep = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(10px);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
    padding: 1rem;

    &:hover {
      transform: none;
    }
  }
`;

const ProcessStepNumber = styled.div`
  background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.2rem;
  flex-shrink: 0;
  box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
`;

const ProcessStepText = styled.p`
  color: #e0e0ff;
  font-size: 1.1rem;
  margin: 0;
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

function Moon() {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 32, 32]} position={[4, 3, -5]}>
      <meshLambertMaterial color="#f0f0f0" />
    </Sphere>
  );
}

function FloatingStars() {
  const starsRef = useRef<Points>(null);

  const starPositions = useMemo(() => {
    const positions = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={200}
          array={starPositions}
          itemSize={3}
          args={[] as any}
        />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.1} />
    </points>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        color="#ffffff"
      />
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
      />
      <FloatingStars />
      <Moon />
    </>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrolled = window.pageYOffset;
        const parallax = scrolled * 0.5;
        containerRef.current.style.transform = `translateY(${parallax}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCreateStories = () => {
    navigate("/login");
  };

  return (
    <LandingContainer>
      <CanvasContainer
        ref={containerRef}
        role="presentation"
        aria-hidden="true"
      >
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <Scene />
        </Canvas>
      </CanvasContainer>

      <Section index={0}>
        <Title>Bedtime Storyteller</Title>
        <Subtitle>
          Create magical bedtime stories with AI
          <br />
          Listen to soothing narration that brings tales to life
        </Subtitle>
        <ScrollIndicator>Scroll to learn more</ScrollIndicator>
      </Section>

      <Section index={1}>
        <FeaturesContainer>
          <FeatureCard>
            <FeatureTitle>✨ Free Trial</FeatureTitle>
            <FeatureText>
              Sign up and create up to 5 magical bedtime stories for free. AI
              crafts your unique tales with endless possibilities.
            </FeatureText>
          </FeatureCard>

          <FeatureCard>
            <FeatureTitle>🎭 Personalized Stories</FeatureTitle>
            <FeatureText>
              Choose your characters, settings, and themes. AI creates
              completely original stories tailored to your preferences.
            </FeatureText>
          </FeatureCard>

          <FeatureCard>
            <FeatureTitle>🎵 Audio Narration</FeatureTitle>
            <FeatureText>
              Listen to your stories with soothing, warm narration. Perfect for
              bedtime with calming voice options.
            </FeatureText>
          </FeatureCard>

          <FeatureCard>
            <FeatureTitle>📚 Story Library</FeatureTitle>
            <FeatureText>
              Save and revisit all your created stories. Build your personal
              collection of magical tales.
            </FeatureText>
          </FeatureCard>

          <FeatureCard>
            <FeatureTitle>🎯 Age-Appropriate</FeatureTitle>
            <FeatureText>
              Stories tailored for ages 2-12 with appropriate length and
              complexity. Choose from short, medium, or long story formats.
            </FeatureText>
          </FeatureCard>

          <FeatureCard>
            <FeatureTitle>🌟 Multiple Themes</FeatureTitle>
            <FeatureText>
              From funny adventures to gentle learning tales. Pick story styles
              and moral lessons that matter to you.
            </FeatureText>
          </FeatureCard>
        </FeaturesContainer>
      </Section>

      <Section index={2}>
        <ProcessSection>
          <ProcessTitle>How It Works</ProcessTitle>
          <ProcessSteps>
            <ProcessStep>
              <ProcessStepNumber>1</ProcessStepNumber>
              <ProcessStepText>Choose age & story length</ProcessStepText>
            </ProcessStep>
            <ProcessStep>
              <ProcessStepNumber>2</ProcessStepNumber>
              <ProcessStepText>Select character & interests</ProcessStepText>
            </ProcessStep>
            <ProcessStep>
              <ProcessStepNumber>3</ProcessStepNumber>
              <ProcessStepText>Pick story style & lesson</ProcessStepText>
            </ProcessStep>
            <ProcessStep>
              <ProcessStepNumber>4</ProcessStepNumber>
              <ProcessStepText>AI creates your unique story</ProcessStepText>
            </ProcessStep>
            <ProcessStep>
              <ProcessStepNumber>5</ProcessStepNumber>
              <ProcessStepText>Listen with beautiful narration</ProcessStepText>
            </ProcessStep>
          </ProcessSteps>
        </ProcessSection>
        <Title style={{ fontSize: "2.5rem", marginBottom: "2rem" }}>
          Start Your Journey
        </Title>
        <Subtitle style={{ marginBottom: "3rem" }}>
          Enter a world of magical storytelling adventures
        </Subtitle>
        <CreateButton onClick={handleCreateStories}>
          Create Stories
        </CreateButton>
        <div style={{ paddingBottom: "2rem" }}></div>
      </Section>
    </LandingContainer>
  );
}
