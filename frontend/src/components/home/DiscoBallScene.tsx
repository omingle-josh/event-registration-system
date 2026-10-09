import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, Environment } from "@react-three/drei";
import * as THREE from "three";

function DiscoBall() {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Position is shifted 4 units to the right, and hanging from the top
  const ballPosition = new THREE.Vector3(4, 1, 0);

  // Rotate based on scroll and hover
  useFrame((_, delta) => {
    if (groupRef.current) {
      if (hovered) {
        // Fast rotation when hovered
        groupRef.current.rotation.y += delta * 3;
        groupRef.current.rotation.x += delta * 0.5;
      } else {
        // Base slow rotation
        groupRef.current.rotation.y += delta * 0.3;
        groupRef.current.rotation.x += delta * 0.1;
      }
      
      // Scroll-based additional rotation is handled by mapping scroll directly
      const scrollY = window.scrollY;
      groupRef.current.rotation.y = scrollY * 0.005 + (hovered ? groupRef.current.rotation.y : groupRef.current.rotation.y % (Math.PI*2));
    }
  });

  return (
    <group>
      {/* Hanging string */}
      <mesh position={[ballPosition.x, 6, ballPosition.y]}>
        <cylinderGeometry args={[0.02, 0.02, 10]} />
        <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.2} />
      </mesh>

      <group ref={groupRef} position={ballPosition}>
        <mesh
          ref={meshRef}
          onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[2.5, 32, 24]} />
          <meshPhysicalMaterial 
            color={hovered ? "#ffe0f0" : "#d0d0eb"}
            metalness={1}
            roughness={0} // Extremely shiny
            clearcoat={1}
            clearcoatRoughness={0}
            envMapIntensity={hovered ? 5 : 2}
            flatShading={true} // Crucial for the mirror ball facet effect
          />
        </mesh>
        

        {/* Dynamic Lights triggered by hover attached INSIDE the spinning group, so beams rotate */}
        <spotLight position={[0, -2, 4]} intensity={hovered ? 200 : 0} color="#ff00ff" angle={0.8} penumbra={1} distance={40} />
        <spotLight position={[0, 2, -4]} intensity={hovered ? 200 : 0} color="#00ffff" angle={0.8} penumbra={1} distance={40} />
      </group>

      <pointLight position={[9, 0, 5]} intensity={hovered ? 60 : 10} color="#ff00ff" distance={30} />
      <pointLight position={[-1, 0, 5]} intensity={hovered ? 60 : 10} color="#00ffff" distance={30} />
      <spotLight position={[4, 10, 0]} intensity={hovered ? 150 : 40} color="#ffffff" angle={0.5} penumbra={1} castShadow />

      {/* Background/ambient particles shifted slightly right to surround the ball */}
      <Sparkles 
        position={[4, 0, -2]}
        count={hovered ? 400 : 100} 
        scale={15} 
        size={hovered ? 6 : 2} 
        speed={hovered ? 1.5 : 0.2} 
        opacity={hovered ? 1 : 0.4} 
        color={hovered ? "#ff00ff" : "#ffffff"} 

      />
    </group>
  );
}

export function DiscoBallScene() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-screen z-0 bg-slate-950 overflow-hidden pointer-events-auto hidden md:block">
      {/* Dynamic dark gradient background */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] transition-colors duration-1000 mix-blend-screen"
        style={{
           backgroundImage: `radial-gradient(ellipse at center, rgba(168, 85, 247, ${Math.min(scrollY/1000, 0.4)}) 0%, rgba(2, 6, 23, 1) ${100 - Math.min(scrollY/20, 50)}%)`
        }}
      ></div>
      
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }} dpr={[1, 2]} shadows>
        {/* Basic ambient lighting */}
        <ambientLight intensity={0.5} />
        
        {/* Core directional lights */}
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" castShadow />
        <directionalLight position={[-10, -10, -5]} intensity={0.8} color="#ec4899" />
        
        <DiscoBall />
        
        {/* Environment adds standard reflections for the metalness material */}
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
