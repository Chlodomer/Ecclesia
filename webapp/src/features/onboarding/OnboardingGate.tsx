import type { FormEvent, ReactNode } from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { useSoundscape } from '@/features/audio/SoundscapeProvider'

import styles from './OnboardingGate.module.css'
import {
  type StudentSession,
  loadSession,
  persistSession,
  SESSION_STORAGE_KEY,
} from './sessionStorage'

type Phase = 'form' | 'resume' | 'locked' | 'ready'

type OnboardingGateProps = {
  children: ReactNode
}

type StudentSessionContextValue = StudentSession | null

const StudentSessionContext = createContext<StudentSessionContextValue>(null)

export function useStudentSession() {
  return useContext(StudentSessionContext)
}

function useInitialPhase(session: StudentSession | null): Phase {
  if (!session) return 'form'
  if (session.status === 'completed') return 'locked'
  return 'resume'
}

function generateSessionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `session-${Date.now()}`
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export function OnboardingGate({ children }: OnboardingGateProps) {
  const initialSession = useMemo(() => loadSession(), [])
  const [storedSession, setStoredSession] = useState<StudentSession | null>(initialSession)
  const [hasUnlocked, setHasUnlocked] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setSessionAndPersist = useCallback((session: StudentSession) => {
    persistSession(session)
    setStoredSession(session)
  }, [])

  const phase: Phase = useMemo(() => {
    if (hasUnlocked) return 'ready'
    return useInitialPhase(storedSession)
  }, [hasUnlocked, storedSession])

  useEffect(() => {
    if (phase === 'ready' && storedSession?.status === 'active') {
      setSessionAndPersist(storedSession)
    }
  }, [phase, storedSession, setSessionAndPersist])

  const sessionContextValue = useMemo<StudentSessionContextValue>(() => {
    if (phase === 'ready') {
      return storedSession
    }
    return null
  }, [phase, storedSession])

  const resetError = () => setError(null)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    resetError()

    const trimmedName = fullName.trim()
    const trimmedEmail = email.trim().toLowerCase()

    if (!trimmedName) {
      setError('Please enter your full name.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    setIsSubmitting(true)

    try {
      const newSession: StudentSession = {
        id: generateSessionId(),
        fullName: trimmedName,
        email: trimmedEmail,
        status: 'active',
        startedAt: new Date().toISOString(),
      }

      setSessionAndPersist(newSession)
      setHasUnlocked(true)
      setFullName('')
      setEmail('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResume = () => {
    if (!storedSession) return
    setHasUnlocked(true)
  }

  const session = storedSession

  const { playTheme, stopTheme, prime } = useSoundscape()

  useEffect(() => {
    if (phase !== 'ready') {
      playTheme()
      return () => {
        stopTheme()
      }
    }
    stopTheme()
  }, [phase, playTheme, stopTheme])

  const handlePrime = useCallback(() => {
    prime()
  }, [prime])

  return (
    <StudentSessionContext.Provider value={sessionContextValue}>
      <div className={styles.gateContainer}>
        {children}
        {phase !== 'ready' ? (
          <div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            onPointerDownCapture={handlePrime}
            onKeyDownCapture={handlePrime}
          >
            <div className={styles.card}>
              <aside className={styles.heroPanel}>
                <div
                  className={styles.heroArt}
                  role="presentation"
                  aria-hidden="true"
                  style={{ backgroundImage: 'url(/assets/procession.png)' }}
                />
                <div className={styles.heroCopy}>
                  <p className={styles.heroEyebrow}>Ecclesia: A Community's Story</p>
                  <h1 className={styles.heroTitle}>Chronicle the rise of a fragile church.</h1>
                  <p className={styles.heroLead}>
                    Record your presence, then guide a late antique community through persecution,
                    charity, and imperial intrigue. Every decision writes a new chapter.
                  </p>
                  <ul className={styles.heroList}>
                    <li>Log your identity for assessment credit.</li>
                    <li>Navigate moral dilemmas with uncertain outcomes.</li>
                    <li>Leave with a reflection report for seminar discussion.</li>
                  </ul>
                </div>
              </aside>
              <section className={styles.cardContent}>
                {phase === 'form' ? (
                  <>
                    <section className={styles.intro}>
                      <h2>Begin Your Ecclesia Session</h2>
                      <p>
                        Add your details to create a session token on this device. This locks your
                        attempt so the report maps back to you.
                      </p>
                    </section>
                    <form className={styles.form} onSubmit={onSubmit}>
                      <div className={styles.field}>
                        <label htmlFor="fullName">Full name</label>
                        <input
                          id="fullName"
                          name="fullName"
                          type="text"
                        autoComplete="name"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        onFocus={() => {
                          resetError()
                          handlePrime()
                        }}
                        placeholder="e.g., Sophia Laurent"
                        required
                      />
                    </div>

                      <div className={styles.field}>
                        <label htmlFor="email">Email</label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        onFocus={() => {
                          resetError()
                          handlePrime()
                        }}
                        placeholder="name@example.edu"
                        required
                      />
                    </div>

                      {error ? <div className={styles.error}>{error}</div> : null}

                      <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isSubmitting}
                        data-testid="submit-onboarding"
                      >
                        Enter the chronicle
                      </button>
                    </form>
                    <p className={styles.notice}>
                      Data persists locally in <code>{SESSION_STORAGE_KEY}</code>. To reset, clear
                      browser storage or ask your instructor.
                    </p>
                  </>
                ) : null}

                {phase === 'resume' && session ? (
                  <div className={styles.resumeCard}>
                    <section className={styles.intro}>
                      <h2>Resume Your Chronicle</h2>
                      <p>
                        We found an active session on this device. Confirm these details to return
                        to the moment you last guided the community.
                      </p>
                    </section>

                    <ul className={styles.sessionDetails}>
                      <li>
                        <strong>Name:</strong> {session.fullName}
                      </li>
                      <li>
                        <strong>Email:</strong> {session.email}
                      </li>
                      <li>
                        <strong>Started:</strong> {formatDate(session.startedAt)}
                      </li>
                    </ul>

                    <div className={styles.resumeActions}>
                      <button type="button" className={styles.resumeButton} onClick={handleResume}>
                        Rejoin session
                      </button>
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={() => setStoredSession(null)}
                      >
                        Start over
                      </button>
                    </div>
                  </div>
                ) : null}

                {phase === 'locked' && session ? (
                  <div className={styles.lockedMessage}>
                    <strong>Session Locked</strong>
                    <p>
                      This browser already submitted a completed Ecclesia session for{' '}
                      <strong>{session.fullName}</strong>. Request a reset from your instructor if
                      you need another attempt.
                    </p>
                  </div>
                ) : null}
              </section>
            </div>
          </div>
        ) : null}
      </div>
    </StudentSessionContext.Provider>
  )
}

export type { StudentSession } from './sessionStorage'
