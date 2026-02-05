import { Suspense, useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { NeuralNetwork } from './components/NeuralNetwork'
import { MemorySphere } from './components/MemorySphere'
import { Effects } from './components/Effects'
// StakeholderMap 3D component available but using CSS grid visualization instead

// Stakeholder data
const stakeholderGroups = [
  {
    id: 'subjects',
    name: 'The Subjects',
    subtitle: '"The Rememberers"',
    profile: 'Elderly individuals (75+) and early-stage dementia patients.',
    attributes: { interest: 'High', power: 'Low' },
    status: 'Vulnerable / Protected',
    context: 'They provide the raw data (memories) but often lack the technical literacy or cognitive capacity to control how it is processed. They rely entirely on the trust framework.',
    color: 'purple'
  },
  {
    id: 'preservationists',
    name: 'The Preservationists',
    subtitle: 'Mnemosyne Staff',
    profile: '"Forensic Listeners" (Human interviewers) and "Neural Architects" (AI supervisors).',
    attributes: { interest: 'High', power: 'High' },
    status: 'Responsible / Executors',
    context: 'They hold the keys to the "Truth." They make the invisible decisions on whether to render a memory as it was (rainy, sad) or as the patient needs it to be (sunny, comforting).',
    color: 'cyan'
  },
  {
    id: 'ethics',
    name: 'Cognitive Ethics Board',
    subtitle: 'Regulatory',
    profile: 'Neuro-rights advocates, medical ethicists, and government auditors.',
    attributes: { interest: 'Medium', power: 'High' },
    status: 'Consulted / Gatekeepers',
    context: 'Concerned with the "Public Stack." They ensure the open-source archives aren\'t exploited for commercial data mining and that the "Therapeutic Mercy" edits don\'t cross into historical revisionism.',
    color: 'green'
  },
  {
    id: 'families',
    name: 'The Next of Kin',
    subtitle: 'Families',
    profile: 'Adult children or guardians of the subjects.',
    attributes: { interest: 'High', power: 'Medium' },
    status: 'Informed / Customers',
    context: 'They often pay for the "Synthesis" sessions. They have a conflict of interest: they want their loved ones to be happy (Comfort), but often demand historical accuracy for family records (Truth).',
    color: 'gold'
  }
]

// Ethical questions data
const ethicalQuestions = [
  {
    id: 1,
    title: 'The "Sunny Day" Paradox',
    question: 'If the AI "hallucinates" sunlight in a memory that was historically rainy to comfort a dementia patient, is that a therapeutic act of mercy or a violation of their life\'s truth?'
  },
  {
    id: 2,
    title: 'Consent by Proxy',
    question: 'Who owns the rights to a reconstructed memory when the subject can no longer legally consent? The subject, the paying family member, or the Mnemosyne Trust?'
  },
  {
    id: 3,
    title: 'The "Public Stack" Inequality',
    question: 'If the wealthy get hyper-realistic, ray-traced "Premium Nostalgia" while the poor get low-poly, generic assets from the open-source stack, are we creating a class divide in the dignity of death?'
  },
  {
    id: 4,
    title: 'Collateral Privacy',
    question: 'When we reconstruct a user\'s wedding day from 1985, we inadvertently simulate guests who are still alive but didn\'t consent to be "resurrected" in VR. Do they have a right to be blurred out?'
  },
  {
    id: 5,
    title: 'Addiction to the Past',
    question: 'If the simulation is warmer, kinder, and brighter than the cold reality of a 2030 nursing home, what prevents users from refusing to leave the "Immersion" phase?'
  },
  {
    id: 6,
    title: 'The Listener\'s Burden',
    question: '"Forensic Listeners" absorb the trauma, grief, and secrets of thousands of dying people. What is the psychological cost of being a professional vessel for other people\'s pain?'
  },
  {
    id: 7,
    title: 'Algorithmic Bias in Nostalgia',
    question: 'Does the Anamnese reconstruction engine, built on 4D Gaussian Splatting, default to Western-centric lighting and architectural norms when filling in the "visual gaps" of a memory from a non-Western culture?'
  },
  {
    id: 8,
    title: 'Data Inheritance',
    question: 'When the subject passes away, does the 3D memory asset become public domain (Educational use) immediately, or does it remain a private family heirloom?'
  },
  {
    id: 9,
    title: 'The Definition of Self',
    question: 'If Mnemosyne successfully externalizes our memories onto servers, are we reducing the human soul to a file format?'
  }
]

// Personas data
const personas = [
  {
    id: 'elara',
    name: 'Elara Vance',
    age: 82,
    role: 'The Subject',
    occupation: 'Retired Architect / Dementia Patient',
    power: 'Low',
    interest: 'High',
    status: 'Vulnerable',
    education: 'M.Arch (1975). Struggling with aphasia.',
    pain: 'Fears that forgetting her late husband\'s face means losing him a second time. Finds 2D photos flat and unconvincing.',
    gain: 'To stand inside her first studio apartment one last time. To feel the spatial volume of her past.',
    frustrations: 'The "fog" in her head. When people correct her stories. Being treated like a child.',
    goal: 'To have one moment of perfect clarity before the end.',
    color: 'purple',
    avatar: 'E'
  },
  {
    id: 'julian',
    name: 'Julian K.',
    age: 34,
    role: 'The Preservationist',
    occupation: 'Lead Forensic Listener',
    power: 'High',
    interest: 'High',
    status: 'Responsible',
    education: 'PhD in Oral History & Psychology.',
    pain: '"Empathy Fatigue." Suffers from vicarious trauma. Feels guilty when he approves an AI "hallucination" to calm a patient.',
    gain: 'Believes he is saving human culture from extinction. Sees himself as a curator of the soul.',
    frustrations: 'Families who demand "happy endings" for traumatic memories. The limits of the Anamnese reconstruction engine (4D Gaussian Splatting).',
    goal: 'To create the perfect "Synthesis"—a memory indistinguishable from reality, yet safe for the user.',
    color: 'cyan',
    avatar: 'J'
  },
  {
    id: 'aris',
    name: 'Dr. Aris Thorne',
    age: 55,
    role: 'The Regulator',
    occupation: 'Chair of Cognitive Ethics Board',
    power: 'High',
    interest: 'High',
    status: 'Consulted',
    education: 'Law & Bio-Ethics.',
    pain: 'Watching tech companies turn elderly care into a subscription model. The legal gray area of "memory ownership."',
    gain: 'Establishing the "Cognitive Bill of Rights." Protecting vulnerable data from being sold to advertisers.',
    frustrations: 'The speed of AI development vs. the slowness of legislation. Mnemosyne\'s "black box" algorithms.',
    goal: 'Ensure Mnemosyne remains a "Trust" and doesn\'t become a "Market."',
    color: 'green',
    avatar: 'A'
  },
  {
    id: 'zoe',
    name: 'Zoe Chen',
    age: 27,
    role: 'The Skeptic',
    occupation: 'Tech Investigative Journalist',
    power: 'High',
    interest: 'High',
    status: 'Informed',
    education: 'BA in Digital Anthropology.',
    pain: 'Seeing the "Public Stack" users get glitchy, low-res memories while the rich get "Director\'s Cuts."',
    gain: 'Breaking the story on how "Therapeutic Mercy" is actually just rewriting history to be more palatable.',
    frustrations: 'The PR spin of "saving heritage." The difficulty of verifying if a reconstructed memory is true.',
    goal: 'To expose the glitches in the system. To ask: "Is a fake happy memory better than a real sad one?"',
    color: 'gold',
    avatar: 'Z'
  }
]

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

          {/* Horizontal grid layout for side-by-side presentation */}
          <div
            className="process-row"
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '2rem',
              justifyContent: 'center',
              alignItems: 'stretch',
              marginTop: '2rem'
            }}
          >
            {/* Step 1: Extraction */}
            <div
              className="glass-card process-card"
              style={{
                flex: 1,
                opacity: visible['process'] ? 1 : 0,
                transform: visible['process'] ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s',
                minWidth: 0
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
                flex: 1,
                opacity: visible['process'] ? 1 : 0,
                transform: visible['process'] ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.35s',
                minWidth: 0
              }}
            >
              <div className="step-number">02</div>
              <span className="role-tag">Role: The Neural Architect (AI Agent)</span>
              <h3>Synthesis</h3>
              <p>
                Procedural generation of 3D environments using <strong>4D Gaussian Splatting</strong> and
                <strong> Ray Tracing</strong>. The Anamnese reconstruction engine calculates the physics of light
                to recreate the <strong>atmosphere</strong> of the memory, not just the geometry.
              </p>
              <span className="intelligence-tag">Intelligence: Pattern Recognition & Spatial Logic</span>
            </div>

            {/* Step 3: Immersion */}
            <div
              className="glass-card process-card"
              style={{
                flex: 1,
                opacity: visible['process'] ? 1 : 0,
                transform: visible['process'] ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.5s',
                minWidth: 0
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

      {/* STAKEHOLDER GROUPS */}
      <section 
        id="stakeholders" 
        ref={setRef('stakeholders')} 
        className="section stakeholders"
        style={{
          opacity: visible['stakeholders'] ? 1 : 0,
          transform: visible['stakeholders'] ? 'translateY(0)' : 'translateY(50px)',
          transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="container">
          <div className="section-header">
            <h2>Stakeholder Ecosystem</h2>
            <p>The Power-Interest Landscape</p>
          </div>

          {/* Power-Interest Matrix Visualization */}
          <div 
            className="power-interest-matrix"
            style={{
              opacity: visible['stakeholders'] ? 1 : 0,
              transform: visible['stakeholders'] ? 'scale(1)' : 'scale(0.95)',
              transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1) 0.2s'
            }}
          >
            <div className="matrix-grid">
              {/* Axis labels */}
              <div className="axis-label axis-y">
                <span>POWER / INFLUENCE</span>
                <span className="axis-arrow">↑</span>
              </div>
              <div className="axis-label axis-x">
                <span>INTEREST / STAKE</span>
                <span className="axis-arrow">→</span>
              </div>
              
              {/* Quadrants */}
              <div className="quadrant quadrant-tl">
                <span className="quadrant-label">Monitor</span>
              </div>
              <div className="quadrant quadrant-tr">
                <span className="quadrant-label">Manage Closely</span>
              </div>
              <div className="quadrant quadrant-bl">
                <span className="quadrant-label">Minimal Effort</span>
              </div>
              <div className="quadrant quadrant-br">
                <span className="quadrant-label">Keep Informed</span>
              </div>
              
              {/* Stakeholder nodes positioned on grid */}
              <div className="matrix-node node-subjects" title="The Subjects">
                <div className="node-dot dot-purple" />
                <span className="node-label">Subjects</span>
              </div>
              <div className="matrix-node node-preservationists" title="Preservationists">
                <div className="node-dot dot-cyan" />
                <span className="node-label">Staff</span>
              </div>
              <div className="matrix-node node-ethics" title="Ethics Board">
                <div className="node-dot dot-green" />
                <span className="node-label">Ethics Board</span>
              </div>
              <div className="matrix-node node-families" title="Families">
                <div className="node-dot dot-gold" />
                <span className="node-label">Families</span>
              </div>

              {/* Connection lines (SVG) */}
              <svg className="matrix-connections" viewBox="0 0 100 100" preserveAspectRatio="none">
                <line x1="75" y1="75" x2="75" y2="25" className="connection-line line-purple" />
                <line x1="75" y1="75" x2="60" y2="50" className="connection-line line-gold" />
                <line x1="75" y1="25" x2="40" y2="25" className="connection-line line-cyan" />
                <line x1="60" y1="50" x2="75" y2="25" className="connection-line line-gold" />
              </svg>
            </div>
          </div>

          <div className="stakeholder-grid">
            {stakeholderGroups.map((group, index) => (
              <div 
                key={group.id}
                className={`glass-card stakeholder-card stakeholder-${group.color}`}
                style={{
                  opacity: visible['stakeholders'] ? 1 : 0,
                  transform: visible['stakeholders'] ? 'translateY(0)' : 'translateY(30px)',
                  transition: `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${0.3 + index * 0.1}s`
                }}
              >
                <div className={`stakeholder-indicator indicator-${group.color}`} />
                <div className="stakeholder-header">
                  <h3>{group.name}</h3>
                  <span className="stakeholder-subtitle">{group.subtitle}</span>
                </div>
                <p className="stakeholder-profile">{group.profile}</p>
                <div className="stakeholder-attributes">
                  <span className="attribute">
                    <span className="attr-label">Interest:</span>
                    <span className={`attr-value value-${group.attributes.interest.toLowerCase()}`}>
                      {group.attributes.interest}
                    </span>
                  </span>
                  <span className="attribute">
                    <span className="attr-label">Power:</span>
                    <span className={`attr-value value-${group.attributes.power.toLowerCase()}`}>
                      {group.attributes.power}
                    </span>
                  </span>
                </div>
                <div className={`status-badge status-${group.color}`}>
                  {group.status}
                </div>
                <p className="stakeholder-context">{group.context}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ETHICAL QUESTIONS - THE HARD 9 */}
      <section 
        id="hard-nine" 
        ref={setRef('hard-nine')} 
        className="section hard-nine"
        style={{
          opacity: visible['hard-nine'] ? 1 : 0,
          transform: visible['hard-nine'] ? 'translateY(0)' : 'translateY(50px)',
          transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="container">
          <div className="section-header">
            <h2>The "Hard 9"</h2>
            <p>Ethical Questions We Must Answer</p>
          </div>

          <div className="questions-grid">
            {ethicalQuestions.map((q, index) => (
              <div 
                key={q.id}
                className="glass-card question-card"
                style={{
                  opacity: visible['hard-nine'] ? 1 : 0,
                  transform: visible['hard-nine'] ? 'translateY(0)' : 'translateY(30px)',
                  transition: `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${0.05 + index * 0.05}s`
                }}
              >
                <div className="question-number">{String(q.id).padStart(2, '0')}</div>
                <h4 className="question-title">{q.title}</h4>
                <p className="question-text">{q.question}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PERSONAS */}
      <section 
        id="personas" 
        ref={setRef('personas')} 
        className="section personas"
        style={{
          opacity: visible['personas'] ? 1 : 0,
          transform: visible['personas'] ? 'translateY(0)' : 'translateY(50px)',
          transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="container">
          <div className="section-header">
            <h2>The Personas</h2>
            <p>Human Stories Behind the System</p>
          </div>

          <div className="personas-grid">
            {personas.map((persona, index) => (
              <div 
                key={persona.id}
                className={`glass-card persona-card persona-${persona.color}`}
                style={{
                  opacity: visible['personas'] ? 1 : 0,
                  transform: visible['personas'] ? 'translateY(0)' : 'translateY(30px)',
                  transition: `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${0.1 + index * 0.1}s`
                }}
              >
                <div className="persona-header">
                  <div className={`persona-avatar avatar-${persona.color}`}>
                    {persona.avatar}
                  </div>
                  <div className="persona-identity">
                    <h3>{persona.name} <span className="persona-age">({persona.age})</span></h3>
                    <span className="persona-role">{persona.role}</span>
                    <span className="persona-occupation">{persona.occupation}</span>
                  </div>
                </div>

                <div className="persona-stats">
                  <div className="stat">
                    <span className="stat-label">Power</span>
                    <div className={`stat-bar bar-${persona.power.toLowerCase()}`}>
                      <div className="stat-fill" />
                    </div>
                    <span className="stat-value">{persona.power}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Interest</span>
                    <div className={`stat-bar bar-${persona.interest.toLowerCase()}`}>
                      <div className="stat-fill" />
                    </div>
                    <span className="stat-value">{persona.interest}</span>
                  </div>
                </div>

                <div className={`persona-status status-${persona.color}`}>
                  Status: <strong>{persona.status}</strong>
                </div>

                <div className="persona-details">
                  <div className="detail-item">
                    <span className="detail-icon">🎓</span>
                    <span className="detail-text">{persona.education}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">💔</span>
                    <div className="detail-content">
                      <span className="detail-label">Pain Point</span>
                      <span className="detail-text">{persona.pain}</span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">✨</span>
                    <div className="detail-content">
                      <span className="detail-label">Gain</span>
                      <span className="detail-text">{persona.gain}</span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">😤</span>
                    <div className="detail-content">
                      <span className="detail-label">Frustrations</span>
                      <span className="detail-text">{persona.frustrations}</span>
                    </div>
                  </div>
                </div>

                <div className="persona-goal">
                  <span className="goal-label">Goal</span>
                  <p>{persona.goal}</p>
                </div>
              </div>
            ))}
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
