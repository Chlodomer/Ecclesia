import { useEffect, useRef, useState } from 'react'

export function useCountUp(target: number, duration: number = 600) {
  const [count, setCount] = useState<number>(target)
  const prevTargetRef = useRef<number>(target)

  useEffect(() => {
    if (target === prevTargetRef.current) return

    const start = prevTargetRef.current
    const change = target - start
    const startTime = Date.now()

    let raf: number | null = null

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(start + change * eased))

      if (progress < 1) {
        raf = requestAnimationFrame(animate)
      } else {
        prevTargetRef.current = target
      }
    }

    // Respect reduced motion
    const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      setCount(target)
      prevTargetRef.current = target
      return
    }

    raf = requestAnimationFrame(animate)
    return () => {
      if (raf) cancelAnimationFrame(raf)
    }
  }, [target, duration])

  return count
}

