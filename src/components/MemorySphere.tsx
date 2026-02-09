import { useRef, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Sparkles, MeshDistortMaterial, Edges } from '@react-three/drei'
import * as THREE from 'three'

// Orbital ring component
function OrbitalRing({ 
  radius = 2.2, 
  thickness = 0.02, 
  color = '#0077cc', 
  rotationSpeed = 0.3,
  initialRotation = [0, 0, 0] as [number, number, number]
}) {
  const ref = useRef<THREE.Mesh>(null!)
  const phase = useRef(Math.random() * Math.PI * 2)

  useFrame((state) => {
    if (ref.current) {
      const time = state.clock.elapsedTime
      ref.current.rotation.z = time * rotationSpeed + phase.current
      ref.current.rotation.x = initialRotation[0] + Math.sin(time * 0.5) * 0.1
    }
  })

  return (
    <mesh ref={ref} rotation={initialRotation}>
      <torusGeometry args={[radius, thickness, 16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} />
    </mesh>
  )
}

// Core radius for proximity calculations
const CORE_RADIUS = 1.5

// Bold colors for particles near core
const BOLD_CYAN = new THREE.Color('#0055aa')
const BOLD_PURPLE = new THREE.Color('#6d28d9')
const NORMAL_CYAN = new THREE.Color('#0077cc')
const NORMAL_PURPLE = new THREE.Color('#8b5cf6')

// Energy particle with dynamic size and color based on distance to core
function OrbitingNeuron({ 
  index,
  radius = 2.5, 
  speed = 1, 
  color = '#0077cc',
  onPositionUpdate
}: { 
  index: number
  radius: number
  speed: number
  color: string
  onPositionUpdate: (index: number, pos: THREE.Vector3) => void
}) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const phase = useRef(Math.random() * Math.PI * 2)
  const tilt = useRef(Math.random() * Math.PI)
  const tilt2 = useRef(Math.random() * Math.PI * 0.5)
  const isCyan = color === '#0077cc'
  const tempColor = useRef(new THREE.Color())

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime * speed + phase.current
      
      // More complex orbital path
      const x = Math.cos(t) * radius
      const y = Math.sin(t) * radius * Math.cos(tilt.current) + Math.sin(t * 0.5) * 0.3
      const z = Math.sin(t) * radius * Math.sin(tilt.current) * Math.cos(tilt2.current)
      
      meshRef.current.position.set(x, y, z)
      
      // Calculate distance from core center
      const distFromCore = Math.sqrt(x * x + y * y + z * z)
      const proximityToCore = Math.max(0, 1 - (distFromCore - CORE_RADIUS) / 2)
      
      // Scale particle based on proximity to core (bigger when closer)
      const baseSize = 0.08
      const maxSize = 0.18
      const size = baseSize + proximityToCore * (maxSize - baseSize)
      meshRef.current.scale.setScalar(size / 0.08)
      
      // Lerp color to bolder version when near core
      const normalColor = isCyan ? NORMAL_CYAN : NORMAL_PURPLE
      const boldColor = isCyan ? BOLD_CYAN : BOLD_PURPLE
      tempColor.current.copy(normalColor).lerp(boldColor, proximityToCore)
      
      const mat = meshRef.current.material as THREE.MeshBasicMaterial
      mat.color.copy(tempColor.current)
      
      // Report position for connection lines (no clone — handler uses .copy())
      onPositionUpdate(index, meshRef.current.position)
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.08, 12, 12]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

// Neural connections between particles — imperative buffer updates, no React re-renders
function NeuralConnections({
  positionsRef,
  count,
}: {
  positionsRef: React.RefObject<THREE.Vector3[]>
  count: number
}) {
  const linesRef = useRef<THREE.LineSegments>(null!)
  const maxConnections = (count * (count - 1)) / 2
  const connectionDistance = 2.5

  // Pre-allocate typed arrays once
  const positionArray = useMemo(
    () => new Float32Array(maxConnections * 6),
    [maxConnections],
  )

  useFrame(() => {
    if (!linesRef.current) return
    const positions = positionsRef.current
    if (!positions || positions.length < 2) return

    const geo = linesRef.current.geometry
    const arr = geo.attributes.position.array as Float32Array

    let idx = 0
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const dist = positions[i].distanceTo(positions[j])
        if (dist < connectionDistance && idx < maxConnections) {
          const off = idx * 6
          arr[off] = positions[i].x
          arr[off + 1] = positions[i].y
          arr[off + 2] = positions[i].z
          arr[off + 3] = positions[j].x
          arr[off + 4] = positions[j].y
          arr[off + 5] = positions[j].z
          idx++
        }
      }
    }

    // Zero-out any leftover segments from previous frame
    for (let k = idx * 6; k < arr.length; k++) arr[k] = 0

    geo.attributes.position.needsUpdate = true
    geo.setDrawRange(0, idx * 2)
  })

  return (
    <lineSegments ref={linesRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={maxConnections * 2}
          array={positionArray}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#0077cc" transparent opacity={0.3} />
    </lineSegments>
  )
}

// "Think Inside the Box" — translucent wireframe container
function WireframeBox() {
  const ref = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime
      ref.current.rotation.y = t * 0.08
      ref.current.rotation.x = Math.sin(t * 0.15) * 0.05
    }
  })

  const BOX_SIZE = 5.5

  return (
    <mesh ref={ref}>
      <boxGeometry args={[BOX_SIZE, BOX_SIZE, BOX_SIZE]} />
      <meshBasicMaterial transparent opacity={0} />
      <Edges
        scale={1}
        threshold={15}
        color="#0077cc"
      >
        <meshBasicMaterial transparent opacity={0.15} color="#0077cc" />
      </Edges>
    </mesh>
  )
}

export function MemorySphere() {
  const groupRef = useRef<THREE.Group>(null!)

  // Generate neuron particles data (stable across renders)
  const neurons = useMemo(() => 
    Array.from({ length: 18 }, () => ({
      radius: 1.8 + Math.random() * 1.5,
      speed: 0.3 + Math.random() * 0.4,
      color: Math.random() > 0.5 ? '#0077cc' : '#8b5cf6'
    }))
  , [])

  // Positions stored in a ref — mutated imperatively, never triggers re-renders
  const positionsRef = useRef<THREE.Vector3[]>(neurons.map(() => new THREE.Vector3()))

  const handlePositionUpdate = useCallback((index: number, pos: THREE.Vector3) => {
    positionsRef.current[index].copy(pos)
  }, [])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05
    }
  })

  return (
    <Float 
      speed={1.5} 
      rotationIntensity={0.3} 
      floatIntensity={0.5}
      position={[0, 0, 0]}
    >
      <group ref={groupRef}>
        {/* Main sphere with distort material - memory core */}
        <mesh>
          <sphereGeometry args={[CORE_RADIUS, 64, 64]} />
          <MeshDistortMaterial
            color="#4a90d9"
            roughness={0.2}
            metalness={0.8}
            distort={0.2}
            speed={2}
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* Inner glow layer */}
        <mesh scale={1.05}>
          <sphereGeometry args={[CORE_RADIUS, 32, 32]} />
          <meshBasicMaterial 
            color="#0077cc" 
            transparent 
            opacity={0.12}
          />
        </mesh>

        {/* Outer glow - backside */}
        <mesh scale={1.5}>
          <sphereGeometry args={[CORE_RADIUS, 32, 32]} />
          <meshBasicMaterial 
            color="#0077cc" 
            transparent 
            opacity={0.06}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Purple inner glow */}
        <mesh scale={1.2}>
          <sphereGeometry args={[CORE_RADIUS, 32, 32]} />
          <meshBasicMaterial 
            color="#8b5cf6" 
            transparent 
            opacity={0.04}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Orbital rings */}
        <OrbitalRing 
          radius={2.2} 
          thickness={0.015} 
          color="#0077cc" 
          rotationSpeed={0.4}
          initialRotation={[Math.PI / 2, 0, 0]}
        />
        <OrbitalRing 
          radius={2.5} 
          thickness={0.012} 
          color="#8b5cf6" 
          rotationSpeed={-0.25}
          initialRotation={[Math.PI / 3, Math.PI / 6, 0]}
        />
        <OrbitalRing 
          radius={2.8} 
          thickness={0.01} 
          color="#0077cc" 
          rotationSpeed={0.15}
          initialRotation={[Math.PI / 4, -Math.PI / 4, 0]}
        />

        {/* Orbiting neurons */}
        {neurons.map((n, i) => (
          <OrbitingNeuron 
            key={i}
            index={i}
            radius={n.radius} 
            speed={n.speed} 
            color={n.color}
            onPositionUpdate={handlePositionUpdate}
          />
        ))}

        {/* Neural connections between particles — reads from ref, zero re-renders */}
        <NeuralConnections positionsRef={positionsRef} count={neurons.length} />

        {/* Sparkles around the sphere */}
        <Sparkles 
          count={50}
          scale={6}
          size={2}
          speed={0.4}
          opacity={0.7}
          color="#0077cc"
        />
        <Sparkles 
          count={30}
          scale={5}
          size={1.5}
          speed={0.3}
          opacity={0.6}
          color="#8b5cf6"
        />

        {/* "Think Inside the Box" wireframe container */}
        <WireframeBox />
      </group>
    </Float>
  )
}
