import type { FormEvent, ReactNode } from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { useSoundscape } from '@/features/audio/SoundscapeProvider'

import styles from './OnboardingGate.module.css'
import { assetPath } from '@/lib/assets'
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
  // Auto-ready when a session exists (no resume screen)
  return 'ready'
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

  // Listen for session creation from the opening screen
  useEffect(() => {
    const onCreated = () => {
      const latest = loadSession()
      if (latest) {
        setStoredSession(latest)
        setHasUnlocked(true)
      }
    }
    window.addEventListener('ecclesia:session-created' as unknown as string, onCreated as unknown as EventListener)
    return () => {
      window.removeEventListener('ecclesia:session-created' as unknown as string, onCreated as unknown as EventListener)
    }
  }, [])

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

    // UI sounds frozen; keep silent here
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
    // UI sounds frozen; keep silent here
    setHasUnlocked(true)
  }

  const session = storedSession

  const { prime, playEffect } = useSoundscape()
  const lastPhaseRef = useRef<Phase | null>(null)

  useEffect(() => {
    // Theme music disabled globally; no onboarding music behavior
    lastPhaseRef.current = phase
  }, [phase])

  const handlePrime = useCallback(() => {
    prime()
  }, [prime])

  return (
    <StudentSessionContext.Provider value={sessionContextValue}>
      <div className={styles.gateContainer}>
        {children}
        {phase === 'locked' ? (
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
                  style={{ backgroundImage: `url(${assetPath('/assets/procession.png')})` }}
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
                {session ? (
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
