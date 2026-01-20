import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'

interface FloatingParticleProps {
  position: [number, number, number]
  size?: number
  color?: string
}

function FloatingParticle({ position, size = 0.08, color = '#0066cc' }: FloatingParticleProps) {
  const ref = useRef<THREE.Mesh>(null!)
  const speed = useRef(0.2 + Math.random() * 0.3)
  const phase = useRef(Math.random() * Math.PI * 2)

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime * speed.current + phase.current
      ref.current.position.y = position[1] + Math.sin(t) * 0.3
      ref.current.position.x = position[0] + Math.cos(t * 0.7) * 0.2
    }
  })

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} />
    </mesh>
  )
}

export function NeuralNetwork() {
  // Generate static particle positions
  const particles = useRef(
    Array.from({ length: 30 }, () => ({
      position: [
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 4 - 2
      ] as [number, number, number],
      color: Math.random() > 0.5 ? '#0066cc' : '#8e44ad',
      size: 0.05 + Math.random() * 0.06
    }))
  ).current

  return (
    <group>
      {/* Simple floating particles */}
      {particles.map((p, i) => (
        <FloatingParticle 
          key={i} 
          position={p.position} 
          color={p.color}
          size={p.size}
        />
      ))}
      
      {/* Drei Sparkles - very stable, GPU-based */}
      <Sparkles
        count={60}
        scale={[20, 12, 6]}
        size={1.5}
        speed={0.2}
        opacity={0.4}
        color="#0066cc"
      />
      <Sparkles
        count={40}
        scale={[18, 10, 5]}
        size={1}
        speed={0.15}
        opacity={0.3}
        color="#8e44ad"
      />
    </group>
  )
}
