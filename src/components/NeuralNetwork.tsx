import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles, Line, Float } from '@react-three/drei'
import * as THREE from 'three'

// Neural node that floats and pulses
function NeuralNode({ position, color = '#0077cc', size = 0.08 }: { 
  position: [number, number, number]
  color?: string
  size?: number 
}) {
  const ref = useRef<THREE.Mesh>(null!)
  const speed = useRef(0.3 + Math.random() * 0.4)
  const phase = useRef(Math.random() * Math.PI * 2)
  const pulsePhase = useRef(Math.random() * Math.PI * 2)

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime * speed.current + phase.current
      ref.current.position.y = position[1] + Math.sin(t) * 0.4
      ref.current.position.x = position[0] + Math.cos(t * 0.7) * 0.25
      ref.current.position.z = position[2] + Math.sin(t * 0.5) * 0.15
      
      // Pulse effect
      const pulse = 0.8 + Math.sin(state.clock.elapsedTime * 2 + pulsePhase.current) * 0.2
      ref.current.scale.setScalar(pulse)
    }
  })

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[size, 12, 12]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </mesh>
  )
}

// Animated connection line between two points
function ConnectionLine({ start, end, color = '#0077cc' }: {
  start: [number, number, number]
  end: [number, number, number]
  color?: string
}) {
  const ref = useRef<any>(null!)
  const startVec = useRef(new THREE.Vector3(...start))
  const endVec = useRef(new THREE.Vector3(...end))
  const phase = useRef(Math.random() * Math.PI * 2)

  useFrame((state) => {
    if (ref.current) {
      // Animate opacity based on time
      const opacity = 0.1 + Math.sin(state.clock.elapsedTime * 0.5 + phase.current) * 0.1
      ref.current.material.opacity = opacity
    }
  })

  return (
    <Line
      ref={ref}
      points={[startVec.current, endVec.current]}
      color={color}
      lineWidth={0.5}
      transparent
      opacity={0.15}
    />
  )
}

// Flowing spark along a curved path (inspired by demos/sparks-and-effects)
function FlowingSpark({ color = '#0077cc', radius = 8 }: { color?: string; radius?: number }) {
  const ref = useRef<THREE.Mesh>(null!)
  const speed = useRef(0.5 + Math.random() * 0.5)
  const offset = useRef(Math.random() * Math.PI * 2)
  const yOffset = useRef((Math.random() - 0.5) * 6)
  const zOffset = useRef((Math.random() - 0.5) * 4)

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime * speed.current + offset.current
      ref.current.position.x = Math.sin(t) * radius
      ref.current.position.y = yOffset.current + Math.cos(t * 1.5) * 2
      ref.current.position.z = zOffset.current + Math.sin(t * 0.7) * 3
      
      // Scale based on position (closer = larger)
      const scale = 0.5 + (ref.current.position.z + 5) / 10
      ref.current.scale.setScalar(Math.max(0.3, scale))
    }
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.03, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.9} />
    </mesh>
  )
}

export function NeuralNetwork() {
  // Generate neural nodes
  const nodes = useMemo(() => 
    Array.from({ length: 40 }, () => ({
      position: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 6 - 3
      ] as [number, number, number],
      color: Math.random() > 0.6 ? '#8b5cf6' : '#0077cc',
      size: 0.04 + Math.random() * 0.05
    }))
  , [])

  // Generate connections between nearby nodes
  const connections = useMemo(() => {
    const conns: { start: [number, number, number]; end: [number, number, number]; color: string }[] = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = Math.sqrt(
          Math.pow(nodes[i].position[0] - nodes[j].position[0], 2) +
          Math.pow(nodes[i].position[1] - nodes[j].position[1], 2) +
          Math.pow(nodes[i].position[2] - nodes[j].position[2], 2)
        )
        if (dist < 5 && Math.random() > 0.7) {
          conns.push({
            start: nodes[i].position,
            end: nodes[j].position,
            color: Math.random() > 0.5 ? '#0077cc' : '#8b5cf6'
          })
        }
      }
    }
    return conns
  }, [nodes])

  // Flowing sparks
  const sparks = useMemo(() =>
    Array.from({ length: 20 }, () => ({
      color: Math.random() > 0.5 ? '#0077cc' : '#8b5cf6',
      radius: 6 + Math.random() * 8
    }))
  , [])

  return (
    <group>
      {/* Neural nodes */}
      {nodes.map((node, i) => (
        <NeuralNode 
          key={`node-${i}`} 
          position={node.position} 
          color={node.color}
          size={node.size}
        />
      ))}
      
      {/* Connection lines */}
      {connections.map((conn, i) => (
        <ConnectionLine
          key={`conn-${i}`}
          start={conn.start}
          end={conn.end}
          color={conn.color}
        />
      ))}

      {/* Flowing sparks */}
      {sparks.map((spark, i) => (
        <FlowingSpark 
          key={`spark-${i}`} 
          color={spark.color} 
          radius={spark.radius}
        />
      ))}
      
      {/* Ambient sparkles - cyan layer */}
      <Sparkles
        count={80}
        scale={[24, 14, 8]}
        size={2}
        speed={0.3}
        opacity={0.6}
        color="#0077cc"
      />
      
      {/* Ambient sparkles - purple layer */}
      <Sparkles
        count={50}
        scale={[20, 12, 6]}
        size={1.5}
        speed={0.2}
        opacity={0.5}
        color="#8b5cf6"
      />

      {/* Deep background sparkles */}
      <Sparkles
        count={30}
        scale={[30, 18, 15]}
        size={1}
        speed={0.1}
        opacity={0.3}
        color="#94a3b8"
        position={[0, 0, -10]}
      />
    </group>
  )
}
