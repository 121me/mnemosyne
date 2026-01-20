import { Suspense, useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { NeuralNetwork } from './components/NeuralNetwork'
import { MemorySphere } from './components/MemorySphere'

// Camera rig that responds to scroll and mouse
function CameraRig() {
  const { camera } = useThree()
  const targetY = useRef(0)
  const targetZ = useRef(15)
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const scrollProgress = scrollY / maxScroll
      
      // Move camera back as user scrolls
      targetY.current = -scrollProgress * 3
      targetZ.current = 15 + scrollProgress * 5
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useFrame((state, delta) => {
    // Smooth camera movement
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY.current, delta * 2)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ.current, delta * 2)
    
    // Subtle mouse parallax
    camera.position.x = THREE.MathUtils.lerp(
      camera.position.x, 
      state.pointer.x * 0.5, 
      delta * 2
    )
    camera.lookAt(0, targetY.current, 0)
  })

  return null
}

// Main 3D Scene - simplified, no post-processing
function Scene() {
  return (
    <>
      <color attach="background" args={['#f5f5f7']} />
      <fog attach="fog" args={['#f5f5f7', 15, 35]} />
      
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} color="#ffffff" />
      <pointLight position={[10, 10, 10]} intensity={0.4} color="#0066cc" />
      <pointLight position={[-10, -10, -5]} intensity={0.3} color="#8e44ad" />
      
      <CameraRig />
      
      {/* Neural network particles in background */}
      <NeuralNetwork />
      
      {/* Central memory sphere */}
      <MemorySphere />
    </>
  )
}

// HTML Content Overlay
function Content() {
  const [visible, setVisible] = useState<Record<string, boolean>>({})
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target.id) {
            setVisible((prev) => ({
              ...prev,
              [entry.target.id]: entry.isIntersecting
            }))
          }
        })
      },
      { threshold: 0.2 }
    )

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const setRef = (id: string) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el
  }

  return (
    <div className="content-layer">
      {/* HERO */}
      <section 
        id="hero" 
        ref={setRef('hero')} 
        className="section hero"
      >
        <div className="hero-content">
          <h1>MNEMOSYNE</h1>
          <p className="hero-subtitle">The Cognitive Heritage Trust // Est. 2030</p>
          <p className="hero-tagline">"Your past, preserved. Not just recorded, but re-lived."</p>
        </div>
        <div className="scroll-prompt">Scroll to Enter</div>
      </section>

      {/* MANIFESTO */}
      <section 
        id="manifesto" 
        ref={setRef('manifesto')} 
        className="section manifesto"
        style={{
          opacity: visible['manifesto'] ? 1 : 0,
          transform: visible['manifesto'] ? 'translateY(0)' : 'translateY(40px)',
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="container">
          <div className="glass-card manifesto-card">
            <span className="year-badge">Scenario: January 7, 2030</span>
            <h2>The Archive of Feeling</h2>
            <p>
              In the late 2020s, we realized that while we were archiving <strong>data</strong>, we were losing <strong>context</strong>. 
              The "Memory Market" of 2026 was a crude concept of trading experiences. By 2030, we evolved. 
              We don't sell memories; we save them. Mnemosyne is a reaction against the "flatness" of digital archives. 
              We use spatial computing to grant dignity to the aging and the forgotten.
            </p>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section 
        id="process" 
        ref={setRef('process')} 
        className="section process"
        style={{
          opacity: visible['process'] ? 1 : 0,
          transform: visible['process'] ? 'translateY(0)' : 'translateY(40px)',
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.1s'
        }}
      >
        <div className="container">
          <div className="section-header">
            <h2>The Process Model</h2>
            <p>Adapting 'Inside the Box' Methodology</p>
          </div>

          <div className="process-grid">
            {/* Step 1 */}
            <div 
              className="glass-card process-card"
              style={{
                transitionDelay: '0.2s'
              }}
            >
              <div className="step-number">01</div>
              <span className="role-tag">Role: The Forensic Listener (Human)</span>
              <h3>Extraction</h3>
              <p>
                Deep-dive interviews with the subject. We collect audio recordings, 
                old photographs, and crucial sensory descriptors (smells, textures) 
                to establish an emotional baseline.
              </p>
              <span className="intelligence-tag">Intelligence: Emotional & Interpersonal</span>
            </div>

            {/* Step 2 */}
            <div 
              className="glass-card process-card"
              style={{
                transitionDelay: '0.35s'
              }}
            >
              <div className="step-number">02</div>
              <span className="role-tag">Role: The Neural Architect (AI Agent)</span>
              <h3>Synthesis</h3>
              <p>
                Procedural generation of 3D environments. Using Neural Radiance Fields (NeRFs) 
                and Ray Tracing to fill in visual gaps. The AI calculates the physics of light 
                to recreate the "feeling" of the memory.
              </p>
              <span className="intelligence-tag">Intelligence: Pattern Recognition & Spatial Logic</span>
            </div>

            {/* Step 3 */}
            <div 
              className="glass-card process-card"
              style={{
                transitionDelay: '0.5s'
              }}
            >
              <div className="step-number">03</div>
              <span className="role-tag">Role: The Guide (Human + AI)</span>
              <h3>Immersion</h3>
              <p>
                The subject enters the simulation via Haptic VR. They revisit their 
                childhood home or a lost moment of joy. The goal is not just viewing, 
                but cognitive therapy and emotional closure.
              </p>
              <span className="intelligence-tag">Intelligence: Kinaesthetic & Intrapersonal</span>
            </div>
          </div>
        </div>
      </section>

      {/* ETHICS */}
      <section 
        id="ethics" 
        ref={setRef('ethics')} 
        className="section ethics"
        style={{
          opacity: visible['ethics'] ? 1 : 0,
          transform: visible['ethics'] ? 'translateY(0)' : 'translateY(40px)',
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="container">
          <div className="glass-card ethics-card">
            <div className="ethics-layout">
              <div className="ethics-text">
                <h2>Ethics & Impact</h2>
                <p>
                  As we bridge the gap between <strong>Care Work</strong> and <strong>Creative Tech</strong>, 
                  we face new challenges. The "Coder" is no longer isolated; they are a custodian of human history.
                </p>
              </div>
              
              <div>
                <div className="challenge-item">
                  <h4>Truth vs. Comfort</h4>
                  <p>
                    If the AI "hallucinates" a detail that makes the memory happier but less accurate, 
                    do we keep it? We prioritize <strong>Integrity</strong> over entertainment.
                  </p>
                </div>
                
                <div className="challenge-item">
                  <h4>Inequality & Access</h4>
                  <p>
                    Will rich people buy "happier" childhoods? We operate on a <strong>"Public Stack"</strong> model—open-source 
                    archives for educational use subsidize private therapy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer 
        id="footer"
        ref={setRef('footer')} 
        className="section footer"
        style={{
          opacity: visible['footer'] ? 1 : 0,
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="container">
          <h3 className="serif">MNEMOSYNE</h3>
          <p className="footer-locations">Saarbrücken • Tokyo • The Cloud</p>
          <p className="footer-meta">GenAILab 2030 Submission • Jan 21 Checkpoint</p>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <>
      {/* 3D Canvas - Fixed background */}
      <div className="canvas-container">
        <Canvas
          camera={{ position: [0, 0, 15], fov: 60 }}
          gl={{ 
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: true
          }}
          dpr={1}
          frameloop="always"
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>

      {/* HTML Content overlay */}
      <Content />
    </>
  )
}
