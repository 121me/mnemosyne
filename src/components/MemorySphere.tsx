import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Sparkles, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

export function MemorySphere() {
  const ringRef = useRef<THREE.Mesh>(null!)
  const ring2Ref = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    const time = state.clock.elapsedTime
    
    if (ringRef.current) {
      ringRef.current.rotation.z = time * 0.3
      ringRef.current.rotation.x = Math.PI / 2 + Math.sin(time * 0.5) * 0.15
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -time * 0.2
      ring2Ref.current.rotation.y = time * 0.1
    }
  })

  return (
    <Float 
      speed={1.2} 
      rotationIntensity={0.2} 
      floatIntensity={0.4}
      position={[0, 0, 0]}
    >
      <group>
        {/* Main sphere with distort material */}
        <mesh>
          <sphereGeometry args={[1.5, 64, 64]} />
          <MeshDistortMaterial
            color="#4a90d9"
            roughness={0.2}
            metalness={0.8}
            distort={0.15}
            speed={1.5}
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* Inner glow - simple sphere */}
        <mesh scale={1.4}>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshBasicMaterial 
            color="#0066cc" 
            transparent 
            opacity={0.1}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Orbital ring 1 */}
        <mesh ref={ringRef}>
          <torusGeometry args={[2.2, 0.02, 16, 100]} />
          <meshBasicMaterial color="#0066cc" transparent opacity={0.5} />
        </mesh>

        {/* Orbital ring 2 */}
        <mesh ref={ring2Ref} rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[2.5, 0.015, 16, 100]} />
          <meshBasicMaterial color="#8e44ad" transparent opacity={0.4} />
        </mesh>

        {/* Sparkles around the sphere */}
        <Sparkles 
          count={40}
          scale={5}
          size={1.5}
          speed={0.3}
          opacity={0.5}
          color="#0066cc"
        />
      </group>
    </Float>
  )
}
