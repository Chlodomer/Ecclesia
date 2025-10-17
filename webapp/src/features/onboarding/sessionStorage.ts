export type SessionStatus = 'active' | 'completed'

export type StudentSession = {
  id: string
  fullName: string
  email: string
  status: SessionStatus
  startedAt: string
}

export const SESSION_STORAGE_KEY = 'ecclesia.studentSession'

export function loadSession(): StudentSession | null {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as StudentSession
    if (!parsed?.id || !parsed?.fullName || !parsed?.email) {
      return null
    }

    return parsed
  } catch (error) {
    console.warn('Failed to parse stored session', error)
    return null
  }
}

export function persistSession(session: StudentSession) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

export function markSessionCompleted() {
  const session = loadSession()
  if (!session) return

  const updated: StudentSession = { ...session, status: 'completed' }
  persistSession(updated)
}
