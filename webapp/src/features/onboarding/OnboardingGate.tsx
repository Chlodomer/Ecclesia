import type { FormEvent, ReactNode } from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

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

  return (
    <StudentSessionContext.Provider value={sessionContextValue}>
      <div className={styles.gateContainer}>
        {children}
        {phase !== 'ready' ? (
          <div className={styles.overlay} role="dialog" aria-modal="true">
            <div className={styles.card}>
              {phase === 'form' ? (
                <>
                  <section className={styles.intro}>
                    <h1>Begin Your Ecclesia Session</h1>
                    <p>
                      Welcome. Before guiding the community, log who is taking part. This single
                      submission records your attempt and prepares the end-of-session report.
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
                        onFocus={resetError}
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
                        onFocus={resetError}
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
                      Start my session
                    </button>
                  </form>
                  <p className={styles.notice}>
                    Once your details are submitted, this browser locks the attempt to the recorded
                    student. If you need access reset, contact the instructor. Data is stored locally
                    in <code>{SESSION_STORAGE_KEY}</code>.
                  </p>
                </>
              ) : null}

              {phase === 'resume' && session ? (
                <div className={styles.resumeCard}>
                  <section className={styles.intro}>
                    <h1>Resume Your Session</h1>
                    <p>
                      We found an in-progress attempt. Continue where you left off; once you submit
                      results, this attempt will close.
                    </p>
                  </section>

                  <ul className={styles.sessionDetails}>
                    <li>
                      <strong>Student:</strong> {session.fullName}
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
                      Resume session
                    </button>
                  </div>

                  <p className={styles.notice}>
                    Need an instructor reset? Ask them to clear the stored session for this machine.
                  </p>
                </div>
              ) : null}

              {phase === 'locked' && session ? (
                <div className={styles.lockedMessage}>
                  <section className={styles.intro}>
                    <h1>Session Closed</h1>
                    <p>
                      This browser already submitted a completed Ecclesia session for{' '}
                      <strong>{session.fullName}</strong>.
                    </p>
                  </section>
                  <p className={styles.notice}>
                    To request another attempt, contact your instructor. Clearing browser storage
                    without approval may violate class policy.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </StudentSessionContext.Provider>
  )
}

export type { StudentSession } from './sessionStorage'
