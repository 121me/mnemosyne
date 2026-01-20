import { Suspense, useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { NeuralNetwork } from './components/NeuralNetwork'
import { MemorySphere } from './components/MemorySphere'
import { Effects } from './components/Effects'

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
      
      // Move camera as user scrolls
      targetY.current = -scrollProgress * 4
      targetZ.current = 15 + scrollProgress * 8
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
      state.pointer.x * 0.8, 
      delta * 2
    )
    camera.lookAt(0, targetY.current, 0)
  })

  return null
}

// Main 3D Scene
function Scene() {
  return (
    <>
      <color attach="background" args={['#faf8f5']} />
      <fog attach="fog" args={['#faf8f5', 15, 40]} />
      
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} color="#ffffff" />
      <pointLight position={[10, 10, 10]} intensity={0.4} color="#0077cc" />
      <pointLight position={[-10, -10, -5]} intensity={0.3} color="#8b5cf6" />
      <pointLight position={[0, -5, 5]} intensity={0.2} color="#0077cc" />
      
      <CameraRig />
      
      {/* Neural network particles in background */}
      <NeuralNetwork />
      
      {/* Central memory sphere */}
      <MemorySphere />

      {/* Post-processing effects */}
      <Effects />
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
      { threshold: 0.15 }
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

      {/* MANIFESTO / THE HOOK */}
      <section 
        id="manifesto" 
        ref={setRef('manifesto')} 
        className="section manifesto"
        style={{
          opacity: visible['manifesto'] ? 1 : 0,
          transform: visible['manifesto'] ? 'translateY(0)' : 'translateY(50px)',
          transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="container">
          <div className="glass-card manifesto-card">
            <span className="year-badge">Scenario: January 7, 2030</span>
            <h2>The Archive of Feeling</h2>
            <p>
              For years, we've been archiving <strong>petabytes of human data</strong> every day. 
              Photos, videos, documents—but we realized something terrifying: 
              we were saving the <strong>data</strong>, but losing the <strong>feeling</strong>.
            </p>
            <p style={{ marginTop: '1.5rem' }}>
              In 2026, the concept of a "Memory Market" emerged—a crude idea of trading experiences. 
              But memories shouldn't be a <strong>commodity to be sold</strong>. 
              They are a <strong>heritage to be saved</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* PROCESS MODEL */}
      <section 
        id="process" 
        ref={setRef('process')} 
        className="section process"
        style={{
          opacity: visible['process'] ? 1 : 0,
          transform: visible['process'] ? 'translateY(0)' : 'translateY(50px)',
          transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1) 0.1s'
        }}
      >
        <div className="container">
          <div className="section-header">
            <h2>The Process Model</h2>
            <p>Adapting the "Inside the Box" Methodology</p>
          </div>

          <div className="process-grid">
            {/* Step 1: Extraction */}
            <div 
              className="glass-card process-card"
              style={{
                opacity: visible['process'] ? 1 : 0,
                transform: visible['process'] ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s'
              }}
            >
              <div className="step-number">01</div>
              <span className="role-tag">Role: The Forensic Listener (Human)</span>
              <h3>Extraction</h3>
              <p>
                Deep-dive interviews with the subject. We don't just scan a brain—we collect 
                sensory triggers: the <strong>smell of a specific bakery</strong>, 
                the <strong>texture of a childhood blanket</strong>. 
                This requires high Emotional Intelligence.
              </p>
              <span className="intelligence-tag">Intelligence: Emotional & Interpersonal</span>
            </div>

            {/* Step 2: Synthesis */}
            <div 
              className="glass-card process-card"
              style={{
                opacity: visible['process'] ? 1 : 0,
                transform: visible['process'] ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.35s'
              }}
            >
              <div className="step-number">02</div>
              <span className="role-tag">Role: The Neural Architect (AI Agent)</span>
              <h3>Synthesis</h3>
              <p>
                Procedural generation of 3D environments using <strong>Neural Radiance Fields (NeRFs)</strong> and 
                <strong> Ray Tracing</strong>. The AI calculates the physics of light 
                to recreate the <strong>atmosphere</strong> of the memory, not just the geometry.
              </p>
              <span className="intelligence-tag">Intelligence: Pattern Recognition & Spatial Logic</span>
            </div>

            {/* Step 3: Immersion */}
            <div 
              className="glass-card process-card"
              style={{
                opacity: visible['process'] ? 1 : 0,
                transform: visible['process'] ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.5s'
              }}
            >
              <div className="step-number">03</div>
              <span className="role-tag">Role: The Guide (Human + AI)</span>
              <h3>Immersion</h3>
              <p>
                The subject enters the simulation via <strong>Haptic VR</strong>. They revisit their 
                childhood home or a lost moment of joy. This isn't entertainment—it is 
                <strong> cognitive therapy</strong> providing closure and comfort.
              </p>
              <span className="intelligence-tag">Intelligence: Kinaesthetic & Intrapersonal</span>
            </div>
          </div>
        </div>
      </section>

      {/* ETHICS & IMPACT */}
      <section 
        id="ethics" 
        ref={setRef('ethics')} 
        className="section ethics"
        style={{
          opacity: visible['ethics'] ? 1 : 0,
          transform: visible['ethics'] ? 'translateY(0)' : 'translateY(50px)',
          transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="container">
          <div className="glass-card ethics-card">
            <div className="ethics-layout">
              <div className="ethics-text">
                <h2>Ethics & Impact</h2>
                <p>
                  As we bridge the gap between <strong>Care Work</strong> and <strong>Creative Tech</strong>, 
                  we face serious ethical challenges. As designers in 2030, we must ask difficult questions.
                </p>
              </div>
              
              <div>
                <div className="challenge-item">
                  <h4>Truth vs. Comfort</h4>
                  <p>
                    If the AI "hallucinates" a detail—making the weather sunny in a memory that was actually rainy—is that a lie? 
                    Or is it <strong>therapeutic mercy</strong>? We must decide: are we documentarians or therapists?
                  </p>
                </div>
                
                <div className="challenge-item">
                  <h4>Inequality & Access</h4>
                  <p>
                    We cannot allow high-fidelity memory preservation to become a luxury for the rich. 
                    We operate on a <strong>"Public Stack"</strong> model—open-source archives for educational use 
                    subsidize private therapy sessions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONCLUSION */}
      <section 
        id="conclusion" 
        ref={setRef('conclusion')} 
        className="section conclusion"
        style={{
          opacity: visible['conclusion'] ? 1 : 0,
          transform: visible['conclusion'] ? 'translateY(0)' : 'translateY(50px)',
          transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="container">
          <div className="glass-card conclusion-card">
            <h2>The Future of Memory</h2>
            <p>
              The transformation of labor in the 2030s isn't just about robots taking jobs. 
              It's about humans moving into roles that require <strong>deep empathy</strong>, 
              supported by AI that handles the heavy computational lifting.
            </p>
            <p>
              Mnemosyne is a proposal for that future. A future where we use our 
              <strong> most advanced technology</strong> to protect our <strong>most fragile possession</strong>: 
              <em> our past</em>.
            </p>
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
          transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
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
          dpr={[1, 1.5]}
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
