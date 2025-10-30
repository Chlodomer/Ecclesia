import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './TutorialOverlay.module.css'

type Step = 1 | 2 | 3 | 4 | 5

function useTutorialActive(): boolean {
  const flag = (import.meta as any).env?.VITE_FEATURE_TUTORIAL
  const sp = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const forced = !!(sp && (sp.has('tutorial') || sp.has('showTutorial')))
  const notSeen = typeof window !== 'undefined' && !window.localStorage.getItem('ecclesia:tutorial-completed')
  return (flag === true || flag === 'true') && (forced || notSeen)
}

function stepSelector(step: Step): string {
  // Target CSS Modules by substring match on the local class name
  switch (step) {
    case 1: return '[class*="timelineStats"]'
    case 2: return '[class*="sessionHeader"]'
    case 3: return '[class*="eventColumn"]'
    case 4: return '[class*="sceneColumn"]'
    case 5: return '[class*="timelineList"]'
  }
}

function useRectForStep(step: Step): DOMRect | null {
  const [rect, setRect] = useState<DOMRect | null>(null)
  useLayoutEffect(() => {
    const el = document.querySelector(stepSelector(step)) as HTMLElement | null
    if (!el) { setRect(null); return }
    const update = () => setRect(el.getBoundingClientRect())
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [step])
  return rect
}

const content: Record<Step, { title: string; body: string; cta?: string }> = {
  1: {
    title: "Your Community's Vital Signs",
    body:
      'Members show your size: reach 500 to build the basilica and win. Cohesion is unity and morale: if it falls to 0, the community collapses.',
    cta: 'Next: The Timeline →',
  },
  2: {
    title: 'The Passage of Time',
    body:
      "Year marks your place in history. Imperial Status is Rome's stance toward Christians—it shapes the events you face.",
    cta: 'Next: Your Choices →',
  },
  3: {
    title: 'Every Decision Shapes History',
    body:
      'Each scenario presents a dilemma from late antique Christian life. Choices have uncertain outcomes—bold decisions can succeed or backfire.',
    cta: 'Next: The Scene →',
  },
  4: {
    title: "Your Community's Place of Worship",
    body:
      'This image evolves as you grow—from a hidden house church to a basilica. The era badge marks the historical period.',
    cta: 'Next: The Timeline →',
  },
  5: {
    title: 'Your Journey Recorded',
    body:
      'Every event is logged here, forming a chronicle. Goal: reach 500 Members, keep Cohesion above 0, and build the basilica. Ready to begin?',
    cta: 'Begin Game →',
  },
}

export function TutorialOverlay() {
  const active = useTutorialActive()
  const [step, setStep] = useState<Step>(1)
  const [renderedStep, setRenderedStep] = useState<Step>(1)
  const [exiting, setExiting] = useState(false)
  const rect = useRectForStep(renderedStep)

  // Wait until the OpeningScreen has dismissed and GameShell mounted
  const [gameReady, setGameReady] = useState(false)
  const [sceneReady, setSceneReady] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return !!(window as any).__ecclesiaSceneReady
  })
  const [openingDismissed, setOpeningDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    const sp = new URLSearchParams(window.location.search)
    return sp.has('skipOpening') || !!(window as any).__ecclesiaOpeningDismissed
  })
  useEffect(() => {
    const onMounted = () => setGameReady(true)
    window.addEventListener('ecclesia:game-mounted', onMounted as any)
    const onScene = () => {
      setSceneReady(true)
      // Seeing the scene implies the game is mounted
      setGameReady(true)
    }
    window.addEventListener('ecclesia:scene-ready', onScene as any)
    const onOpeningDismissed = () => setOpeningDismissed(true)
    window.addEventListener('ecclesia:opening-dismissed', onOpeningDismissed as any)
    return () => {
      window.removeEventListener('ecclesia:game-mounted', onMounted as any)
      window.removeEventListener('ecclesia:scene-ready', onScene as any)
      window.removeEventListener('ecclesia:opening-dismissed', onOpeningDismissed as any)
    }
  }, [])

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.localStorage.setItem('ecclesia:tutorial-completed', 'true')
        setDismissed(true)
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        next()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])

  const [dismissed, setDismissed] = useState(false)
  // Only display after the title page briefing is dismissed (or skipped)
  const show = active && sceneReady && openingDismissed && !dismissed

  const next = () => {
    if (renderedStep === 5) {
      window.localStorage.setItem('ecclesia:tutorial-completed', 'true')
      setDismissed(true)
    } else {
      setExiting(true)
      window.setTimeout(() => {
        setRenderedStep((s) => ((s + 1) as Step))
        setStep((s) => ((s + 1) as Step))
        setExiting(false)
      }, 140)
    }
  }

  const skip = () => {
    window.localStorage.setItem('ecclesia:tutorial-completed', 'true')
    setDismissed(true)
  }

  const tooltipPos = useMemo(() => {
    if (!rect) return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' } as const
    const gap = 16
    const rightSpace = window.innerWidth - (rect.left + rect.width)
    const leftSpace = rect.left
    if (rightSpace >= 360 + gap) {
      return { left: `${rect.left + rect.width + gap}px`, top: `${Math.max(16, rect.top)}px` }
    }
    if (leftSpace >= 360 + gap) {
      return { left: `${Math.max(16, rect.left - (360 + gap))}px`, top: `${Math.max(16, rect.top)}px` }
    }
    return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' } as const
  }, [rect])

  if (!show) return null

  return createPortal(
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Game Tutorial">
      {rect ? (
        <div
          className={styles.spotlight}
          style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
          aria-hidden
        />
      ) : null}

      <div className={styles.tooltip} style={tooltipPos as any}>
        <div className={exiting ? styles.contentExit : styles.contentEnter} key={renderedStep}>
          <h3 className={styles.title}>{content[renderedStep].title}</h3>
          <p className={styles.body}>{content[renderedStep].body}</p>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.primaryBtn} onClick={next}>
            {content[renderedStep].cta}
          </button>
          <button type="button" className={styles.secondaryBtn} onClick={skip}>
            Skip
          </button>
          <span className={styles.dots} aria-hidden>
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} className={`${styles.dot} ${i === renderedStep ? styles.dotActive : ''}`} />
            ))}
          </span>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default TutorialOverlay
