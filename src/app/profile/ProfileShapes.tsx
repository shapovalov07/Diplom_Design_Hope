'use client'

import { useEffect, useRef } from 'react'

type Point = { x: number; y: number }

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export default function ProfileShapes() {
  const circleRef = useRef<HTMLDivElement | null>(null)
  const glowRef = useRef<HTMLDivElement | null>(null)
  const squareRef = useRef<HTMLDivElement | null>(null)
  const stripeRef = useRef<HTMLDivElement | null>(null)

  const circleTarget = useRef<Point>({ x: 0, y: 0 })
  const glowTarget = useRef<Point>({ x: 0, y: 0 })
  const squareTarget = useRef<Point>({ x: 0, y: 0 })

  const circleCurrent = useRef<Point>({ x: 0, y: 0 })
  const glowCurrent = useRef<Point>({ x: 0, y: 0 })
  const squareCurrent = useRef<Point>({ x: 0, y: 0 })
  const stripeCurrent = useRef<Point>({ x: 0, y: 0 })
  const frame = useRef<number | null>(null)

  useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    const ease = 0.14

    const update = () => {
      const circleX = circleCurrent.current.x + (circleTarget.current.x - circleCurrent.current.x) * ease
      const circleY = circleCurrent.current.y + (circleTarget.current.y - circleCurrent.current.y) * ease
      circleCurrent.current = { x: circleX, y: circleY }

      const glowX = glowCurrent.current.x + (glowTarget.current.x - glowCurrent.current.x) * ease
      const glowY = glowCurrent.current.y + (glowTarget.current.y - glowCurrent.current.y) * ease
      glowCurrent.current = { x: glowX, y: glowY }

      const squareX = squareCurrent.current.x + (squareTarget.current.x - squareCurrent.current.x) * ease
      const squareY = squareCurrent.current.y + (squareTarget.current.y - squareCurrent.current.y) * ease
      squareCurrent.current = { x: squareX, y: squareY }

      const stripeX = stripeCurrent.current.x + (circleCurrent.current.x - stripeCurrent.current.x) * 0.08
      stripeCurrent.current = { x: stripeX, y: 0 }

      if (circleRef.current) {
        circleRef.current.style.transform = `translate3d(${circleX}px, ${circleY}px, 0)`
      }
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${glowX}px, ${glowY}px, 0)`
      }
      if (squareRef.current) {
        squareRef.current.style.transform = `translate3d(${squareX}px, ${squareY}px, 0)`
      }
      if (stripeRef.current) {
        stripeRef.current.style.transform = `translate3d(${stripeX}px, 0, 0)`
      }

      frame.current = window.requestAnimationFrame(update)
    }

    frame.current = window.requestAnimationFrame(update)

    const handleMove = (event: MouseEvent) => {
      const applyRepel = (
        element: HTMLDivElement | null,
        targetRef: { current: Point },
        radius: number,
        strength: number,
      ) => {
        if (!element) return

        const rect = element.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const dx = event.clientX - centerX
        const dy = event.clientY - centerY
        const distance = Math.hypot(dx, dy)

        if (distance > radius || distance === 0) {
          targetRef.current = { x: 0, y: 0 }
          return
        }

        const force = (1 - distance / radius) * strength
        const nx = dx / distance
        const ny = dy / distance

        targetRef.current = {
          x: clamp(-nx * force, -strength, strength),
          y: clamp(-ny * force, -strength, strength),
        }
      }

      applyRepel(circleRef.current, circleTarget, 260, 18)
      applyRepel(glowRef.current, glowTarget, 320, 24)
      applyRepel(squareRef.current, squareTarget, 180, 12)
    }

    window.addEventListener('mousemove', handleMove)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      if (frame.current) window.cancelAnimationFrame(frame.current)
    }
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        ref={stripeRef}
        className="absolute inset-y-0 left-0 hidden w-16 bg-[repeating-linear-gradient(to_bottom,rgba(0,0,0,0.08)_0_3px,transparent_3px_9px)] opacity-40 md:block"
      />
      <div
        ref={circleRef}
        className="absolute -top-20 right-[-120px] h-[320px] w-[320px] rounded-full border border-black/10 bg-white/40 will-change-transform"
      />
      <div
        ref={glowRef}
        className="absolute left-[-120px] top-24 h-[320px] w-[320px] rounded-full bg-[#B5292A]/10 blur-3xl will-change-transform"
      />
      <div
        ref={squareRef}
        className="absolute bottom-12 right-16 hidden h-24 w-24 rotate-6 rounded-2xl border border-black/10 bg-white/70 will-change-transform md:block"
      />
    </div>
  )
}
