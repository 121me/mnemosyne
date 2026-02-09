import { Suspense, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { motion, useScroll, useTransform } from 'framer-motion'
import { NeuralNetwork } from './components/NeuralNetwork'
import { MemorySphere } from './components/MemorySphere'
import { PowerInterestMatrix } from './components/PowerInterestMatrix'

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
  },
  {
    id: 'infrastructure',
    name: 'The Infrastructure Sovereigns',
    subtitle: 'AI & Cloud Providers',
    profile: 'The owners of the compute power required for 4D Gaussian Splatting, ray tracing, and worldmaking.',
    attributes: { interest: 'Low', power: 'Absolute' },
    status: 'Invisible / Dominant',
    context: 'They do not care about the memory itself, only the compute cycles. They challenge the open data philosophy by being the only ones capable of monetizing the "Heritage Trust." As AI challenges established practices of open data sharing, these actors effectively undermine the original public value orientation.',
    color: 'red'
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
    </>
  )
}

// ─── Framer-motion animation variants ────────────────────────────────
const EASE_SMOOTH: [number, number, number, number] = [0.4, 0, 0.2, 1]

const sectionVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE_SMOOTH }
  }
}

const staggerContainer = (stagger = 0.1) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger,
      delayChildren: 0.15,
    }
  }
})

const fadeUpItem = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_SMOOTH }
  }
}

const scaleUpItem = {
  hidden: { opacity: 0, scale: 0.92, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 150, damping: 20 }
  }
}

const heroTitle = {
  hidden: { opacity: 0, y: 30, scale: 0.95, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 2, ease: EASE_SMOOTH }
  }
}

const heroSubtitle = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' as const, delay: 1.2 }
  }
}

const heroTagline = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' as const, delay: 1.7 }
  }
}

const scrollPromptVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, delay: 2.5 }
  }
}

const cardHover = {
  y: -6,
  transition: { type: 'spring' as const, stiffness: 300, damping: 20 }
}

const tensionSlideLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: EASE_SMOOTH, delay: 0.2 }
  }
}

const tensionSlideRight = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: EASE_SMOOTH, delay: 0.35 }
  }
}

const tensionDividerPop = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 200, damping: 15, delay: 0.5 }
  }
}

const sectionHeaderVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_SMOOTH }
  }
}

const challengeItem = (i: number) => ({
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: EASE_SMOOTH, delay: 0.3 + i * 0.15 }
  }
})

// HTML Content Overlay
function Content() {
  return (
    <div className="content-layer">
      {/* HERO */}
      <motion.section
        id="hero"
        className="section hero"
        initial="hidden"
        animate="visible"
      >
        <div className="hero-content">
          <motion.h1 variants={heroTitle}>MNEMOSYNE</motion.h1>
          <motion.p className="hero-subtitle" variants={heroSubtitle}>
            The Cognitive Heritage Trust // Est. 2030
          </motion.p>
          <motion.p className="hero-tagline" variants={heroTagline}>
            "Your past, preserved. Not just recorded, but re-lived."
          </motion.p>
        </div>
        <motion.div
          className="scroll-prompt"
          variants={scrollPromptVariants}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        >
          Scroll to Enter
        </motion.div>
      </motion.section>

      {/* MANIFESTO / THE HOOK */}
      <motion.section
        id="manifesto"
        className="section manifesto"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="container">
          <motion.div
            className="glass-card manifesto-card"
            whileHover={cardHover}
          >
            <motion.span
              className="year-badge"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring' as const, stiffness: 200, damping: 15, delay: 0.3 }}
            >
              Scenario: January 7, 2030
            </motion.span>
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
          </motion.div>
        </div>
      </motion.section>

      {/* THE BLACK BOX OF IMMERSION */}
      <motion.section
        id="blackbox"
        className="section blackbox"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <div className="container">
          <motion.div
            className="glass-card blackbox-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            whileHover={cardHover}
          >
            <motion.div
              className="blackbox-badge"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring' as const, stiffness: 200, damping: 15, delay: 0.2 }}
            >
              Think Inside the Box
            </motion.div>
            <h2>The Black Box of Immersion</h2>
            <p>
              We do not just preserve memories; we curate the <strong>parameters of reality</strong>.
              In an era where AI generates professional-grade seamless tiles and worldmaking is automated,
              the "Box" is no longer a constraint—it is a <strong>sanctuary</strong>.
            </p>
            <p style={{ marginTop: '1.5rem' }}>
              It is the only place where the rules of physics (and ethics) are guaranteed.
              As open source software facilitates analysis of textures for physically-based rendering,
              and image generators create what was once reserved for studios—the question becomes:
              <strong> who frames the box, and who is allowed inside?</strong>
            </p>
            <motion.div
              className="blackbox-tensions"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.div className="tension-item" variants={tensionSlideLeft}>
                <div className="tension-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                  </svg>
                </div>
                <div>
                  <h4>Public Heritage Layer</h4>
                  <p>Open-source assets, community archives, lower fidelity—but accessible to all. The "glitch" is the cost of openness.</p>
                </div>
              </motion.div>
              <motion.div className="tension-divider" variants={tensionDividerPop}>vs.</motion.div>
              <motion.div className="tension-item" variants={tensionSlideRight}>
                <div className="tension-icon tension-icon-premium">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h4>Private Premium Layer</h4>
                  <p>Hyper-realistic, ray-traced "Director's Cut"—monetized memory, available only to those who can pay for compute.</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* PROCESS MODEL */}
      <motion.section
        id="process"
        className="section process"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <div className="container">
          <motion.div className="section-header" variants={sectionHeaderVariants}>
            <h2>The Process Model</h2>
            <p>Adapting the "Inside the Box" Methodology</p>
          </motion.div>

          {/* 2x2 grid layout for process steps */}
          <motion.div
            className="process-grid-2x2"
            variants={staggerContainer(0.12)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '2rem',
              marginTop: '2rem'
            }}
          >
            {/* Step 1: Extraction */}
            <motion.div
              className="glass-card process-card"
              variants={scaleUpItem}
              whileHover={cardHover}
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
            </motion.div>

            {/* Step 2: Synthesis */}
            <motion.div
              className="glass-card process-card"
              variants={scaleUpItem}
              whileHover={cardHover}
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
            </motion.div>

            {/* Step 3: Calibration */}
            <motion.div
              className="glass-card process-card"
              variants={scaleUpItem}
              whileHover={cardHover}
            >
              <div className="step-number">03</div>
              <span className="role-tag">Role: The XR Technician (Human + Machine)</span>
              <h3>Calibration</h3>
              <p>
                Aligning the subject's physical limitations with the virtual
                <strong> "Worldmaking" parameters</strong>. Ensuring the "seamless tiles" of
                the generated world do not induce cognitive rejection. This is where
                the <strong>Motion Hub</strong> maps body to memory.
              </p>
              <span className="intelligence-tag">Intelligence: Spatial & Technical Proficiency</span>
            </motion.div>

            {/* Step 4: Immersion */}
            <motion.div
              className="glass-card process-card"
              variants={scaleUpItem}
              whileHover={cardHover}
            >
              <div className="step-number">04</div>
              <span className="role-tag">Role: The Guide (Human + AI)</span>
              <h3>Immersion</h3>
              <p>
                The subject enters the simulation via <strong>Haptic VR</strong>. They revisit their
                childhood home or a lost moment of joy. This isn't entertainment—it is
                <strong> cognitive therapy</strong> providing closure and comfort.
              </p>
              <span className="intelligence-tag">Intelligence: Kinaesthetic & Intrapersonal</span>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* STAKEHOLDER GROUPS */}
      <motion.section
        id="stakeholders"
        className="section stakeholders"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <div className="container">
          <motion.div className="section-header" variants={sectionHeaderVariants}>
            <h2>Stakeholder Ecosystem</h2>
            <p>The Power-Interest Landscape</p>
          </motion.div>

          {/* Power-Interest Matrix — SVG visualization with framer-motion */}
          <PowerInterestMatrix />

          <motion.div
            className="stakeholder-grid"
            variants={staggerContainer(0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {stakeholderGroups.map((group) => (
              <motion.div
                key={group.id}
                className={`glass-card stakeholder-card stakeholder-${group.color}`}
                variants={fadeUpItem}
                whileHover={cardHover}
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
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ETHICAL QUESTIONS - THE HARD 9 */}
      <motion.section
        id="hard-nine"
        className="section hard-nine"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <div className="container">
          <motion.div className="section-header" variants={sectionHeaderVariants}>
            <h2>The "Hard 9"</h2>
            <p>Ethical Questions We Must Answer</p>
          </motion.div>

          <motion.div
            className="questions-grid"
            variants={staggerContainer(0.06)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {ethicalQuestions.map((q) => (
              <motion.div
                key={q.id}
                className="glass-card question-card"
                variants={scaleUpItem}
                whileHover={{ y: -8, scale: 1.02, transition: { type: 'spring' as const, stiffness: 300, damping: 20 } }}
              >
                <div className="question-number">{String(q.id).padStart(2, '0')}</div>
                <h4 className="question-title">{q.title}</h4>
                <p className="question-text">{q.question}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* PERSONAS */}
      <motion.section
        id="personas"
        className="section personas"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <div className="container">
          <motion.div className="section-header" variants={sectionHeaderVariants}>
            <h2>The Personas</h2>
            <p>Human Stories Behind the System</p>
          </motion.div>

          <motion.div
            className="personas-grid"
            variants={staggerContainer(0.15)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {personas.map((persona) => (
              <motion.div
                key={persona.id}
                className={`glass-card persona-card persona-${persona.color}`}
                variants={fadeUpItem}
                whileHover={cardHover}
              >
                <div className="persona-header">
                  <motion.div
                    className={`persona-avatar avatar-${persona.color}`}
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring' as const, stiffness: 200, damping: 15, delay: 0.3 }}
                  >
                    {persona.avatar}
                  </motion.div>
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
                      <motion.div
                        className="stat-fill"
                        initial={{ width: 0 }}
                        whileInView={{ width: persona.power === 'High' ? '90%' : persona.power === 'Medium' ? '60%' : '30%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: EASE_SMOOTH, delay: 0.5 }}
                      />
                    </div>
                    <span className="stat-value">{persona.power}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Interest</span>
                    <div className={`stat-bar bar-${persona.interest.toLowerCase()}`}>
                      <motion.div
                        className="stat-fill"
                        initial={{ width: 0 }}
                        whileInView={{ width: persona.interest === 'High' ? '90%' : persona.interest === 'Medium' ? '60%' : '30%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: EASE_SMOOTH, delay: 0.65 }}
                      />
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
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ETHICS & IMPACT */}
      <motion.section
        id="ethics"
        className="section ethics"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <div className="container">
          <motion.div
            className="glass-card ethics-card"
            whileHover={cardHover}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="ethics-layout">
              <motion.div className="ethics-text" variants={sectionHeaderVariants}>
                <h2>Ethics & Impact</h2>
                <p>
                  As we bridge the gap between <strong>Care Work</strong> and <strong>Creative Tech</strong>,
                  we face serious ethical challenges. As designers in 2030, we must ask difficult questions.
                </p>
              </motion.div>

              <div>
                <motion.div className="challenge-item" variants={challengeItem(0)}>
                  <h4>Truth vs. Comfort</h4>
                  <p>
                    If the AI "hallucinates" a detail—making the weather sunny in a memory that was actually rainy—is that a lie?
                    Or is it <strong>therapeutic mercy</strong>? We must decide: are we documentarians or therapists?
                  </p>
                </motion.div>

                <motion.div className="challenge-item" variants={challengeItem(1)}>
                  <h4>Inequality & Access</h4>
                  <p>
                    We cannot allow high-fidelity memory preservation to become a luxury for the rich.
                    We operate on a <strong>"Public Stack"</strong> model—open-source archives for educational use
                    subsidize private therapy sessions.
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* CONCLUSION */}
      <motion.section
        id="conclusion"
        className="section conclusion"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="container">
          <motion.div
            className="glass-card conclusion-card"
            variants={{
              hidden: { opacity: 0, y: 40, scale: 0.96 },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { duration: 1, ease: EASE_SMOOTH }
              }
            }}
            whileHover={cardHover}
          >
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
          </motion.div>
        </div>
      </motion.section>

      {/* FOOTER */}
      <motion.footer
        id="footer"
        className="section footer"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <div className="container">
          <motion.h3
            className="serif"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            MNEMOSYNE
          </motion.h3>
          <motion.p
            className="footer-locations"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.25 }}
          >
            Saarbrücken • Tokyo • The Cloud
          </motion.p>
          <motion.div
            className="footer-techstack"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <span className="techstack-label">Built on Open Source</span>
            <p className="techstack-list">
              Three.js • React-Three-Fiber • React-Three-Drei • React-Three-Postprocessing • Vite
            </p>
          </motion.div>
          <motion.p
            className="footer-meta"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.55 }}
          >
            HAMLET × IMPULSE × CYANOTYPES — "Think Inside the Box" Hackathon, Saarbrücken Feb 10–12 2026
          </motion.p>
          <motion.p
            className="footer-meta"
            style={{ marginTop: '0.25rem' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.65 }}
          >
            GenAI Lab, HBKsaar — Generative Arts and Design Lab
          </motion.p>
        </div>
      </motion.footer>
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
          }}
          dpr={[1, 1.5]}
          frameloop="always"
          onCreated={({ gl }) => {
            gl.setClearColor('#faf8f5', 1)
          }}
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
