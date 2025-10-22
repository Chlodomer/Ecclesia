import { useEffect, useState, type ReactNode, FormEvent } from 'react'

import { useSoundscape } from '@/features/audio/SoundscapeProvider'
import { persistSession, loadSession } from '@/features/onboarding/sessionStorage'

import styles from './OpeningScreen.module.css'

type OpeningScreenProps = {
  children: ReactNode
}

export function OpeningScreen({ children }: OpeningScreenProps) {
  // Always show the title page on initial load; dismiss only after Start
  const [dismissed, setDismissed] = useState<boolean>(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

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
      if (ev.key === 'Enter') {
        void submit()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
    }
  }, [dismissed, fullName, email])

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

  // Serve directly from Vite public assets
  const titleUrl = '/assets/title.png'

  async function submit(e?: FormEvent) {
    if (e) e.preventDefault()
    const existing = loadSession()
    const name = fullName.trim()
    const mail = email.trim().toLowerCase()
    // If a session already exists and fields are empty, just continue
    if (existing && !name && !mail) {
      window.dispatchEvent(new Event('ecclesia:session-created'))
      setDismissed(true)
      prime()
      playUi()
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
      setDismissed(true)
      prime()
      playUi()
    } catch {
      setError('Failed to start session. Please try again.')
    }
  }

  if (dismissed) return <>{children}</>

  return (
    <div className={`${styles.overlay} ${styles.fadeIn}`} role="dialog" aria-modal="true">
      <div className={styles.backdrop} style={{ backgroundImage: `url(${titleUrl})` }} />
      <div className={styles.content}>
        <h1 className={styles.title}>Ecclesia: A Community's Story</h1>
        <p className={styles.subtitle}>Guide a fragile church through centuries of change.</p>
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
      </div>
    </div>
  )
}

export default OpeningScreen
