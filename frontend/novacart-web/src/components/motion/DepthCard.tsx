import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import type { PointerEvent, ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function DepthCard({ children, className, intensity = 5 }: { children: ReactNode; className?: string; intensity?: number }) {
  const reduceMotion = useReducedMotion()
  const rotateXRaw = useMotionValue(0)
  const rotateYRaw = useMotionValue(0)
  const glowX = useMotionValue(50)
  const glowY = useMotionValue(50)
  const rotateX = useSpring(rotateXRaw, { stiffness: 180, damping: 24, mass: .6 })
  const rotateY = useSpring(rotateYRaw, { stiffness: 180, damping: 24, mass: .6 })
  const spotlight = useMotionTemplate`radial-gradient(circle at ${glowX}% ${glowY}%, rgba(223,255,54,.16), transparent 38%)`

  function move(event: PointerEvent<HTMLDivElement>) {
    if (reduceMotion || event.pointerType !== 'mouse') return
    const bounds = event.currentTarget.getBoundingClientRect()
    const px = (event.clientX - bounds.left) / bounds.width
    const py = (event.clientY - bounds.top) / bounds.height
    rotateXRaw.set((.5 - py) * intensity)
    rotateYRaw.set((px - .5) * intensity)
    glowX.set(px * 100)
    glowY.set(py * 100)
  }

  function reset() { rotateXRaw.set(0); rotateYRaw.set(0); glowX.set(50); glowY.set(50) }

  return <motion.div onPointerMove={move} onPointerLeave={reset} style={{ rotateX, rotateY, transformPerspective: 1100, transformStyle: 'preserve-3d' }} className={cn('group relative will-change-transform', className)}><motion.div aria-hidden="true" style={{ background: spotlight }} className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 mix-blend-screen transition-opacity duration-300 group-hover:opacity-100" />{children}</motion.div>
}

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduceMotion = useReducedMotion()
  return <motion.div initial={reduceMotion ? false : { opacity: 0, y: 28, filter: 'blur(8px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={{ once: true, amount: .16 }} transition={{ duration: .65, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>{children}</motion.div>
}
