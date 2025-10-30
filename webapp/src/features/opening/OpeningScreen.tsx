import { useEffect, useState, type ReactNode, FormEvent } from 'react'

import { useSoundscape } from '@/features/audio/SoundscapeProvider'
import { persistSession, loadSession } from '@/features/onboarding/sessionStorage'

import styles from './OpeningScreen.module.css'
import { assetPath } from '@/lib/assets'

type OpeningScreenProps = {
  children: ReactNode
}

export function OpeningScreen({ children }: OpeningScreenProps) {
  // Always show the title page on initial load; dismiss only after Start
  const [dismissed, setDismissed] = useState<boolean>(false)
  const [phase, setPhase] = useState<'form' | 'briefing'>('form')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [prepared, setPrepared] = useState(false)

  const { prime, playUi } = useSoundscape()

  // Prefill from any existing session, but still show the title page
  useEffect(() => {
    const existing = loadSession()
    if (existing) {
      setFullName(existing.fullName)
      setEmail(existing.email)
    }
  }, [])

  useEffect(() => {
    if (dismissed) return
    const onKey = (ev: KeyboardEvent) => {
      if (phase === 'form' && ev.key === 'Enter') {
        void submit()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
    }
  }, [dismissed, phase, fullName, email])

  // Allow other components to request a replay of the opening screen (e.g., Start Over)
  useEffect(() => {
    const onReset = () => {
      setDismissed(false)
    }
    window.addEventListener('ecclesia:opening-reset' as unknown as string, onReset as unknown as EventListener)
    return () => {
      window.removeEventListener('ecclesia:opening-reset' as unknown as string, onReset as unknown as EventListener)
    }
  }, [])

  // Resolve against Vite base (e.g., /Ecclesia/ on GitHub Pages)
  const titleUrl = assetPath('/assets/title.png')

  async function preloadImages(urls: string[], timeoutMs = 800) {
    setStatus('Preparing images…')
    const load = (src: string) =>
      new Promise<void>((resolve) => {
        const img = new Image()
        img.onload = () => resolve()
        img.onerror = () => resolve()
        img.src = assetPath(src)
      })
    const all = Promise.all(urls.map(load))
    await Promise.race([
      all,
      new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
    ])
  }

  async function waitForGameMounted(timeoutMs = 800) {
    setStatus('Starting engine…')
    if (typeof window === 'undefined') return
    let resolved = false
    await new Promise<void>((resolve) => {
      const handler = () => {
        if (resolved) return
        resolved = true
        window.removeEventListener('ecclesia:game-mounted' as unknown as string, handler as unknown as EventListener)
        resolve()
      }
      window.addEventListener('ecclesia:game-mounted' as unknown as string, handler as unknown as EventListener, { once: true })
      window.setTimeout(() => {
        if (resolved) return
        resolved = true
        window.removeEventListener('ecclesia:game-mounted' as unknown as string, handler as unknown as EventListener)
        resolve()
      }, timeoutMs)
    })
  }

  async function waitForSceneReady(timeoutMs = 1200) {
    if (typeof window === 'undefined') return
    let resolved = false
    await new Promise<void>((resolve) => {
      const handler = () => {
        if (resolved) return
        resolved = true
        window.removeEventListener('ecclesia:scene-ready' as unknown as string, handler as unknown as EventListener)
        resolve()
      }
      window.addEventListener('ecclesia:scene-ready' as unknown as string, handler as unknown as EventListener, { once: true })
      window.setTimeout(() => {
        if (resolved) return
        resolved = true
        window.removeEventListener('ecclesia:scene-ready' as unknown as string, handler as unknown as EventListener)
        resolve()
      }, timeoutMs)
    })
  }

  async function waitForAppReady(timeoutMs = 2000) {
    if (typeof window === 'undefined') return
    let resolved = false
    await new Promise<void>((resolve) => {
      const handler = () => {
        if (resolved) return
        resolved = true
        window.removeEventListener('ecclesia:app-ready' as unknown as string, handler as unknown as EventListener)
        resolve()
      }
      window.addEventListener('ecclesia:app-ready' as unknown as string, handler as unknown as EventListener, { once: true })
      window.setTimeout(() => {
        if (resolved) return
        resolved = true
        window.removeEventListener('ecclesia:app-ready' as unknown as string, handler as unknown as EventListener)
        resolve()
      }, timeoutMs)
    })
  }

  async function submit(e?: FormEvent) {
    if (e) e.preventDefault()
    const existing = loadSession()
    const name = fullName.trim()
    const mail = email.trim().toLowerCase()
    // If a session already exists and fields are empty, just continue
    if (existing && !name && !mail) {
      window.dispatchEvent(new Event('ecclesia:session-created'))
      setPhase('briefing')
      prepareInBackground()
      return
    }
    // Otherwise validate and (re)persist
    if (!name) {
      setError('Please enter your full name.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      setError('Please enter a valid email address.')
      return
    }
    setError(null)
    try {
      persistSession({ id: `session-${Date.now()}`, fullName: name, email: mail, status: 'active', startedAt: new Date().toISOString() })
      window.dispatchEvent(new Event('ecclesia:session-created'))
      setPhase('briefing')
      prepareInBackground()
    } catch {
      setError('Failed to start session. Please try again.')
    }
  }

  async function prepareInBackground() {
    // Warm up critical images and wait for game + first scene readiness to avoid white flash
    await preloadImages(['/assets/title.png', '/assets/baptism.png', '/assets/church_being_built.png'])
    await waitForGameMounted(1200)
    await waitForSceneReady(1500)
    await waitForAppReady(2000)
    setStatus('Finalizing…')
    await new Promise<void>((resolve) => {
      const start = Date.now()
      const check = () => {
        const el = document.querySelector('section[aria-label="Community scene"]')
        if (el || Date.now() - start > 1000) resolve()
        else requestAnimationFrame(check)
      }
      check()
    })
    setPrepared(true)
  }

  async function continueFromBriefing() {
    if (!prepared) {
      await prepareInBackground()
    }
    setDismissed(true)
    prime()
    playUi()
  }

  if (dismissed) return <>{children}</>

  return (
    <div className={`${styles.overlay} ${styles.fadeIn}`} role="dialog" aria-modal="true">
      <div className={styles.backdrop} style={{ backgroundImage: `url(${titleUrl})` }} />
      <div className={styles.content}>
        <h1 className={styles.title}>Ecclesia: A Community's Story</h1>
        {phase === 'form' ? (
          <>
            <p className={styles.subtitle}>
              {status ? status : 'Guide a fragile church through centuries of change.'}
            </p>
            <form className={styles.form} onSubmit={submit}>
              <div className={styles.row}>
                <label htmlFor="opening-name">Full name</label>
                <input id="opening-name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g., Sophia Laurent" />
              </div>
              <div className={styles.row}>
                <label htmlFor="opening-email">Email</label>
                <input id="opening-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.edu" />
              </div>
              {error ? <div className={styles.error}>{error}</div> : null}
              <div className={styles.actions}>
                <button className={styles.startButton} type="submit">Start Game</button>
              </div>
            </form>
            <span className={styles.hint}>Press Enter to start</span>
          </>
        ) : (
          <>
            <div className={`${styles.briefingCard} ${styles.briefingEnter}`}>
              <h2>Before You Begin</h2>
              <p><strong>You are</strong> guiding a small Christian community in late antique Southern Gaul.</p>
              <p><strong>Your goal</strong> is to grow to <strong>500 Members</strong> while keeping <strong>Cohesion</strong> above <strong>0</strong> to build a basilica.</p>
              <p><strong>You will be asked</strong> to choose responses to historical dilemmas shaped by the era and imperial policy.</p>
              <ul>
                <li>Choices have uncertain outcomes; history is not predictable.</li>
                <li>Each decision affects <em>Members</em> and <em>Cohesion</em> and is logged in your timeline.</li>
                <li>Brief reflection prompts will invite you to justify key decisions.</li>
                <li>There is no undo; accept the consequences and adapt.</li>
              </ul>
              <div className={styles.continueRow}>
                <button className={styles.startButton} type="button" onClick={continueFromBriefing} disabled={!prepared}>
                  {prepared ? 'Continue' : 'Preparing…'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default OpeningScreen
