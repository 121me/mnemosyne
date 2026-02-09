import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ═══════════════════════════════════════════
   Layout constants
   ═══════════════════════════════════════════ */
const W = 580
const H = 470
const M = { top: 42, right: 30, bottom: 50, left: 65 }
const PW = W - M.left - M.right
const PH = H - M.top - M.bottom
const CX = M.left + PW / 2
const CY = M.top + PH / 2

/** Interest (0-100) → SVG x */
const toX = (v: number) => M.left + (v / 100) * PW
/** Power (0-100) → SVG y (inverted) */
const toY = (v: number) => M.top + PH - (v / 100) * PH

/* ═══════════════════════════════════════════
   Data types & definitions
   ═══════════════════════════════════════════ */
interface SNode {
  id: string
  name: string
  label: string
  subtitle: string
  status: string
  interest: number
  power: number
  color: string
  labelDir: 'r' | 'l' | 'a' | 'b'
}

const NODES: SNode[] = [
  {
    id: 'infrastructure',
    name: 'Infrastructure Sovereigns',
    label: 'AI / Cloud',
    subtitle: 'AI & Cloud Providers',
    status: 'Invisible / Dominant',
    interest: 12,
    power: 95,
    color: '#ef4444',
    labelDir: 'r',
  },
  {
    id: 'ethics',
    name: 'Cognitive Ethics Board',
    label: 'Ethics Board',
    subtitle: 'Regulatory',
    status: 'Consulted / Gatekeepers',
    interest: 50,
    power: 78,
    color: '#059669',
    labelDir: 'a',
  },
  {
    id: 'staff',
    name: 'The Preservationists',
    label: 'Staff',
    subtitle: 'Mnemosyne Staff',
    status: 'Responsible / Executors',
    interest: 88,
    power: 85,
    color: '#0077cc',
    labelDir: 'a',
  },
  {
    id: 'families',
    name: 'The Next of Kin',
    label: 'Families',
    subtitle: 'Families',
    status: 'Informed / Customers',
    interest: 75,
    power: 48,
    color: '#f59e0b',
    labelDir: 'r',
  },
  {
    id: 'subjects',
    name: 'The Subjects',
    label: 'Subjects',
    subtitle: '"The Rememberers"',
    status: 'Vulnerable / Protected',
    interest: 82,
    power: 15,
    color: '#8b5cf6',
    labelDir: 'r',
  },
]

interface Link {
  from: string
  to: string
  danger?: boolean
}

const LINKS: Link[] = [
  { from: 'subjects', to: 'families' },
  { from: 'subjects', to: 'staff' },
  { from: 'families', to: 'staff' },
  { from: 'staff', to: 'ethics' },
  { from: 'infrastructure', to: 'ethics', danger: true },
  { from: 'infrastructure', to: 'staff', danger: true },
]

const byId = (id: string) => NODES.find((n) => n.id === id)!

/* ═══════════════════════════════════════════
   Quadrant metadata
   ═══════════════════════════════════════════ */
const QUADS = [
  { label: 'MONITOR', x: M.left + PW * 0.25, y: M.top + PH * 0.25 },
  { label: 'MANAGE CLOSELY', x: M.left + PW * 0.75, y: M.top + PH * 0.25 },
  { label: 'MINIMAL EFFORT', x: M.left + PW * 0.25, y: M.top + PH * 0.75 },
  { label: 'KEEP INFORMED', x: M.left + PW * 0.75, y: M.top + PH * 0.75 },
]

/* ═══════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════ */
function curvePath(a: SNode, b: SNode) {
  const x1 = toX(a.interest),
    y1 = toY(a.power)
  const x2 = toX(b.interest),
    y2 = toY(b.power)
  const mx = (x1 + x2) / 2,
    my = (y1 + y2) / 2
  const dx = x2 - x1,
    dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const off = Math.min(30, len * 0.16)
  return `M${x1},${y1} Q${mx + (-dy / len) * off},${my + (dx / len) * off} ${x2},${y2}`
}

function labelAttrs(n: SNode) {
  const x = toX(n.interest),
    y = toY(n.power)
  switch (n.labelDir) {
    case 'r':
      return { x: x + 16, y: y + 4, textAnchor: 'start' as const }
    case 'l':
      return { x: x - 16, y: y + 4, textAnchor: 'end' as const }
    case 'a':
      return { x, y: y - 18, textAnchor: 'middle' as const }
    case 'b':
      return { x, y: y + 24, textAnchor: 'middle' as const }
  }
}

function readablePower(v: number) {
  return v > 90 ? 'Absolute' : v > 65 ? 'High' : v > 35 ? 'Medium' : 'Low'
}
function readableInterest(v: number) {
  return v > 65 ? 'High' : v > 35 ? 'Medium' : 'Low'
}

/* ═══════════════════════════════════════════
   Animation variants (delay-parameterized)
   ═══════════════════════════════════════════ */
const fade = (d: number) => ({
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5, delay: d } },
})

const pop = (d: number) => ({
  hidden: { scale: 0, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 200, damping: 15, delay: d },
  },
})

/* ═══════════════════════════════════════════
   Component
   ═══════════════════════════════════════════ */
export function PowerInterestMatrix() {
  const [hovered, setHovered] = useState<string | null>(null)
  const hovN = hovered ? byId(hovered) : null

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 700, margin: '0 auto 3rem' }}>
      <motion.svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: 'block', overflow: 'visible' }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        {/* ── Defs ── */}
        <defs>
          <filter id="pim-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="pim-clip">
            <rect x={M.left} y={M.top} width={PW} height={PH} rx={14} />
          </clipPath>
          {/* Subtle dot grid */}
          <pattern
            id="pim-dots"
            x={M.left}
            y={M.top}
            width="22"
            height="22"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="11" cy="11" r="0.6" fill="#c5c0b8" opacity="0.35" />
          </pattern>
        </defs>

        {/* ── Plot background ── */}
        <motion.rect
          x={M.left}
          y={M.top}
          width={PW}
          height={PH}
          rx={14}
          fill="#fefdfb"
          stroke="#e8e4de"
          strokeWidth={0.8}
          variants={fade(0)}
        />
        <motion.rect
          x={M.left}
          y={M.top}
          width={PW}
          height={PH}
          rx={14}
          fill="url(#pim-dots)"
          variants={fade(0.1)}
        />

        {/* ── Quadrant fills (clipped) ── */}
        <g clipPath="url(#pim-clip)">
          <motion.rect
            x={M.left}
            y={M.top}
            width={PW / 2}
            height={PH / 2}
            fill="rgba(239,68,68,0.018)"
            variants={fade(0.08)}
          />
          <motion.rect
            x={CX}
            y={M.top}
            width={PW / 2}
            height={PH / 2}
            fill="rgba(0,119,204,0.028)"
            variants={fade(0.12)}
          />
          <motion.rect
            x={M.left}
            y={CY}
            width={PW / 2}
            height={PH / 2}
            fill="rgba(0,0,0,0.008)"
            variants={fade(0.08)}
          />
          <motion.rect
            x={CX}
            y={CY}
            width={PW / 2}
            height={PH / 2}
            fill="rgba(139,92,246,0.022)"
            variants={fade(0.12)}
          />
        </g>

        {/* ── Center dividers ── */}
        <motion.line
          x1={CX}
          y1={M.top + 8}
          x2={CX}
          y2={M.top + PH - 8}
          stroke="#d4d0c8"
          strokeWidth={0.8}
          strokeDasharray="5 4"
          variants={fade(0.2)}
        />
        <motion.line
          x1={M.left + 8}
          y1={CY}
          x2={M.left + PW - 8}
          y2={CY}
          stroke="#d4d0c8"
          strokeWidth={0.8}
          strokeDasharray="5 4"
          variants={fade(0.2)}
        />

        {/* ── Quadrant labels ── */}
        {QUADS.map((q, i) => (
          <motion.text
            key={q.label}
            x={q.x}
            y={q.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#cac5bc"
            fontSize={10}
            fontWeight={600}
            fontFamily="'Instrument Sans', sans-serif"
            letterSpacing="0.1em"
            variants={fade(0.25 + i * 0.04)}
          >
            {q.label}
          </motion.text>
        ))}

        {/* ── Connections ── */}
        {LINKS.map((l, i) => (
          <motion.path
            key={`${l.from}-${l.to}`}
            d={curvePath(byId(l.from), byId(l.to))}
            fill="none"
            stroke={l.danger ? '#ef4444' : '#ccc7be'}
            strokeWidth={l.danger ? 1.4 : 0.9}
            strokeDasharray={l.danger ? '7 4' : '4 3'}
            strokeLinecap="round"
            variants={fade(0.4 + i * 0.06)}
            style={{ opacity: l.danger ? 0.45 : 0.35 }}
          />
        ))}

        {/* ── Nodes ── */}
        {NODES.map((n, i) => {
          const nx = toX(n.interest),
            ny = toY(n.power)
          const active = hovered === n.id
          const lbl = labelAttrs(n)
          return (
            <motion.g
              key={n.id}
              variants={pop(0.65 + i * 0.1)}
              onMouseEnter={() => setHovered(n.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Pulsing ring for Infrastructure */}
              {n.id === 'infrastructure' && (
                <motion.circle
                  cx={nx}
                  cy={ny}
                  r={18}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth={0.7}
                  animate={{ r: [18, 28, 18], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              {/* Glow */}
              <motion.circle
                cx={nx}
                cy={ny}
                r={20}
                fill={n.color}
                animate={{
                  r: active ? 28 : 20,
                  opacity: active ? 0.18 : 0.08,
                }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              />
              {/* Main dot */}
              <motion.circle
                cx={nx}
                cy={ny}
                r={8}
                fill={n.color}
                filter="url(#pim-glow)"
                animate={{ r: active ? 11 : 8 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              />
              {/* Specular highlight */}
              <circle cx={nx - 2} cy={ny - 2.5} r={2.5} fill="white" opacity={0.35} />
              {/* Label */}
              <text
                x={lbl.x}
                y={lbl.y}
                textAnchor={lbl.textAnchor}
                fontSize={11}
                fontWeight={600}
                fontFamily="'Instrument Sans', sans-serif"
                fill={active ? n.color : '#6b6560'}
                style={{ transition: 'fill 0.2s ease' }}
              >
                {n.label}
              </text>
            </motion.g>
          )
        })}

        {/* ── Axis labels ── */}
        <motion.g variants={fade(0.3)}>
          {/* Y-axis */}
          <text
            x={M.left - 22}
            y={M.top + PH / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#9e9890"
            fontSize={9}
            fontWeight={600}
            fontFamily="'Instrument Sans', sans-serif"
            letterSpacing="0.14em"
            transform={`rotate(-90,${M.left - 22},${M.top + PH / 2})`}
          >
            POWER / INFLUENCE
          </text>
          {/* X-axis */}
          <text
            x={M.left + PW / 2}
            y={M.top + PH + 34}
            textAnchor="middle"
            fill="#9e9890"
            fontSize={9}
            fontWeight={600}
            fontFamily="'Instrument Sans', sans-serif"
            letterSpacing="0.14em"
          >
            INTEREST / STAKE
          </text>
          {/* Y-axis range markers */}
          <text
            x={M.left - 6}
            y={M.top + 10}
            textAnchor="end"
            fill="#b5b0a8"
            fontSize={8}
            fontFamily="'Instrument Sans', sans-serif"
          >
            High
          </text>
          <text
            x={M.left - 6}
            y={M.top + PH - 4}
            textAnchor="end"
            fill="#b5b0a8"
            fontSize={8}
            fontFamily="'Instrument Sans', sans-serif"
          >
            Low
          </text>
          {/* X-axis range markers */}
          <text
            x={M.left + 4}
            y={M.top + PH + 16}
            textAnchor="start"
            fill="#b5b0a8"
            fontSize={8}
            fontFamily="'Instrument Sans', sans-serif"
          >
            Low
          </text>
          <text
            x={M.left + PW - 4}
            y={M.top + PH + 16}
            textAnchor="end"
            fill="#b5b0a8"
            fontSize={8}
            fontFamily="'Instrument Sans', sans-serif"
          >
            High
          </text>
          {/* Arrows */}
          <path
            d={`M${M.left - 22},${M.top + 18} L${M.left - 22},${M.top - 2} M${M.left - 25},${M.top + 6} L${M.left - 22},${M.top - 2} L${M.left - 19},${M.top + 6}`}
            fill="none"
            stroke="#0077cc"
            strokeWidth={1.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={`M${M.left + PW - 18},${M.top + PH + 34} L${M.left + PW + 4},${M.top + PH + 34} M${M.left + PW - 5},${M.top + PH + 31} L${M.left + PW + 4},${M.top + PH + 34} L${M.left + PW - 5},${M.top + PH + 37}`}
            fill="none"
            stroke="#0077cc"
            strokeWidth={1.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.g>
      </motion.svg>

      {/* ── Tooltip overlay ── */}
      <AnimatePresence>
        {hovN && (
          <motion.div
            key={hovN.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            style={{
              position: 'absolute',
              left: `${(toX(hovN.interest) / W) * 100}%`,
              top: `${(toY(hovN.power) / H) * 100}%`,
              transform:
                hovN.power > 60
                  ? 'translate(-50%, 24px)'
                  : 'translate(-50%, calc(-100% - 24px))',
              background: 'rgba(255,253,248,0.96)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: `1px solid ${hovN.color}22`,
              borderRadius: 14,
              padding: '0.85rem 1.15rem',
              boxShadow:
                '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
              pointerEvents: 'none' as const,
              zIndex: 20,
              minWidth: 195,
              whiteSpace: 'nowrap' as const,
            }}
          >
            <div
              style={{
                fontFamily: "'Instrument Sans', sans-serif",
                fontWeight: 600,
                fontSize: '0.88rem',
                color: '#2d2a26',
                marginBottom: 2,
              }}
            >
              {hovN.name}
            </div>
            <div
              style={{
                fontSize: '0.72rem',
                color: '#8a857c',
                fontStyle: 'italic',
                marginBottom: 8,
              }}
            >
              {hovN.subtitle}
            </div>
            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: hovN.color,
                marginBottom: 8,
              }}
            >
              {hovN.status}
            </div>
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                fontSize: '0.72rem',
                color: '#5a564f',
              }}
            >
              <span>
                Interest:{' '}
                <strong style={{ color: '#2d2a26' }}>
                  {readableInterest(hovN.interest)}
                </strong>
              </span>
              <span>
                Power:{' '}
                <strong style={{ color: '#2d2a26' }}>
                  {readablePower(hovN.power)}
                </strong>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
