import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Float, Line } from '@react-three/drei'
import * as THREE from 'three'

// Stakeholder node that pulses and hovers
function StakeholderNode({ 
  position, 
  color, 
  size = 0.3,
  label,
  isHovered = false
}: { 
  position: [number, number, number]
  color: string
  size?: number
  label: string
  isHovered?: boolean
}) {
  const ref = useRef<THREE.Group>(null!)
  const meshRef = useRef<THREE.Mesh>(null!)
  const pulsePhase = useRef(Math.random() * Math.PI * 2)
  const baseScale = size

  useFrame((state) => {
    if (meshRef.current) {
      // Pulse effect
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.5 + pulsePhase.current) * 0.1
      const targetScale = isHovered ? baseScale * 1.3 : baseScale * pulse
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      )
    }
  })

  return (
    <Float speed={2} rotationIntensity={0} floatIntensity={0.3}>
      <group ref={ref} position={position}>
        {/* Main sphere */}
        <mesh ref={meshRef}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial 
            color={color} 
            emissive={color}
            emissiveIntensity={isHovered ? 0.5 : 0.2}
            metalness={0.3}
            roughness={0.4}
            transparent
            opacity={0.9}
          />
        </mesh>
        
        {/* Glow layer */}
        <mesh scale={1.3}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={isHovered ? 0.15 : 0.08}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Label */}
        <Text
          position={[0, -1.8, 0]}
          fontSize={0.25}
          color="#2d2a26"
          anchorX="center"
          anchorY="top"
          font="/fonts/Inter-Medium.woff"
          maxWidth={3}
          textAlign="center"
        >
          {label}
        </Text>
      </group>
    </Float>
  )
}

// Axis line with label
function AxisLine({ 
  start, 
  end, 
  label, 
  labelPosition 
}: { 
  start: [number, number, number]
  end: [number, number, number]
  label: string
  labelPosition: [number, number, number]
}) {
  return (
    <>
      <Line
        points={[start, end]}
        color="#8a857c"
        lineWidth={1}
        transparent
        opacity={0.4}
        dashed
        dashSize={0.1}
        gapSize={0.05}
      />
      <Text
        position={labelPosition}
        fontSize={0.2}
        color="#5a564f"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </>
  )
}

// Connection lines between stakeholders
function StakeholderConnection({ 
  from, 
  to, 
  color = '#0077cc',
  animated = true
}: {
  from: [number, number, number]
  to: [number, number, number]
  color?: string
  animated?: boolean
}) {
  const ref = useRef<any>(null!)
  const phase = useRef(Math.random() * Math.PI * 2)

  useFrame((state) => {
    if (ref.current && animated) {
      const opacity = 0.15 + Math.sin(state.clock.elapsedTime * 0.8 + phase.current) * 0.1
      ref.current.material.opacity = opacity
    }
  })

  return (
    <Line
      ref={ref}
      points={[from, to]}
      color={color}
      lineWidth={1}
      transparent
      opacity={0.2}
    />
  )
}

// Data flow particle
function DataParticle({ 
  from, 
  to, 
  color = '#0077cc',
  speed = 1
}: {
  from: [number, number, number]
  to: [number, number, number]
  color?: string
  speed?: number
}) {
  const ref = useRef<THREE.Mesh>(null!)
  const offset = useRef(Math.random())

  useFrame((state) => {
    if (ref.current) {
      const t = ((state.clock.elapsedTime * speed * 0.3 + offset.current) % 1)
      ref.current.position.x = from[0] + (to[0] - from[0]) * t
      ref.current.position.y = from[1] + (to[1] - from[1]) * t
      ref.current.position.z = from[2] + (to[2] - from[2]) * t
      
      // Fade at edges
      const fade = Math.sin(t * Math.PI)
      ref.current.scale.setScalar(0.05 * fade + 0.02)
    }
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </mesh>
  )
}

// Quadrant background
function QuadrantPlane({ 
  position, 
  color, 
  opacity = 0.03 
}: { 
  position: [number, number, number]
  color: string
  opacity?: number
}) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[2.5, 2.5]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} />
    </mesh>
  )
}

export function StakeholderMap() {
  const groupRef = useRef<THREE.Group>(null!)
  
  // Define stakeholder positions on power/interest grid
  const stakeholders = useMemo(() => [
    {
      id: 'subjects',
      label: 'The Subjects\n"Rememberers"',
      position: [1.8, 0.1, -1.5] as [number, number, number], // High Interest, Low Power
      color: '#8b5cf6', // Purple - vulnerable
      size: 0.35
    },
    {
      id: 'preservationists',
      label: 'Preservationists\n"Staff"',
      position: [1.8, 0.1, 1.5] as [number, number, number], // High Interest, High Power
      color: '#0077cc', // Cyan - responsible
      size: 0.45
    },
    {
      id: 'ethics-board',
      label: 'Ethics Board\n"Regulators"',
      position: [-0.5, 0.1, 1.8] as [number, number, number], // Medium Interest, High Power
      color: '#059669', // Green - gatekeepers
      size: 0.4
    },
    {
      id: 'families',
      label: 'Next of Kin\n"Families"',
      position: [1.2, 0.1, 0] as [number, number, number], // High Interest, Medium Power
      color: '#f59e0b', // Gold - customers
      size: 0.38
    }
  ], [])

  // Define connections between stakeholders
  const connections = useMemo(() => [
    { from: stakeholders[0].position, to: stakeholders[1].position, color: '#8b5cf6' }, // Subjects -> Staff
    { from: stakeholders[0].position, to: stakeholders[3].position, color: '#f59e0b' }, // Subjects -> Families
    { from: stakeholders[1].position, to: stakeholders[2].position, color: '#059669' }, // Staff -> Ethics
    { from: stakeholders[3].position, to: stakeholders[1].position, color: '#0077cc' }, // Families -> Staff
  ], [stakeholders])

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle rotation
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Quadrant backgrounds */}
      <QuadrantPlane position={[-1.25, 0, -1.25]} color="#8b5cf6" opacity={0.04} />
      <QuadrantPlane position={[1.25, 0, -1.25]} color="#f59e0b" opacity={0.04} />
      <QuadrantPlane position={[-1.25, 0, 1.25]} color="#059669" opacity={0.04} />
      <QuadrantPlane position={[1.25, 0, 1.25]} color="#0077cc" opacity={0.04} />

      {/* Axis lines */}
      <AxisLine 
        start={[-3, 0, 0]} 
        end={[3, 0, 0]} 
        label="INTEREST →" 
        labelPosition={[3.3, 0, 0]} 
      />
      <AxisLine 
        start={[0, 0, -3]} 
        end={[0, 0, 3]} 
        label="POWER →" 
        labelPosition={[0, 0, 3.3]} 
      />

      {/* Quadrant labels */}
      <Text position={[-2, 0.1, -2.2]} fontSize={0.15} color="#8a857c">
        Low Interest / Low Power
      </Text>
      <Text position={[2, 0.1, -2.2]} fontSize={0.15} color="#8a857c">
        High Interest / Low Power
      </Text>
      <Text position={[-2, 0.1, 2.2]} fontSize={0.15} color="#8a857c">
        Low Interest / High Power
      </Text>
      <Text position={[2, 0.1, 2.2]} fontSize={0.15} color="#8a857c">
        High Interest / High Power
      </Text>

      {/* Stakeholder nodes */}
      {stakeholders.map((s) => (
        <StakeholderNode
          key={s.id}
          position={s.position}
          color={s.color}
          size={s.size}
          label={s.label}
        />
      ))}

      {/* Connection lines */}
      {connections.map((conn, i) => (
        <StakeholderConnection
          key={`conn-${i}`}
          from={conn.from}
          to={conn.to}
          color={conn.color}
        />
      ))}

      {/* Data flow particles */}
      {connections.map((conn, i) => (
        <DataParticle
          key={`particle-${i}`}
          from={conn.from}
          to={conn.to}
          color={conn.color}
          speed={0.8 + i * 0.2}
        />
      ))}

      {/* Ambient lighting for this group */}
      <pointLight position={[0, 3, 0]} intensity={0.3} color="#ffffff" />
    </group>
  )
}
