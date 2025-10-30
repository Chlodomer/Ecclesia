import { useEffect } from 'react'
import { SoundscapeProvider } from '@/features/audio/SoundscapeProvider'
import { GameShell } from '@/features/game/GameShell'
import { OnboardingGate } from '@/features/onboarding/OnboardingGate'
import { OpeningScreen } from '@/features/opening/OpeningScreen'
import { loadSession, persistSession } from '@/features/onboarding/sessionStorage'
import { TutorialOverlay } from '@/features/tutorial/TutorialOverlay'

/**
 * Root application component. Holds global layout and cross-cutting UI chrome.
 * Feature-level modules (e.g., onboarding, gameplay, reports) mount inside this shell.
 */
export function App() {
  const skipOpening =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('skipOpening')

  // If skipping opening, ensure a session exists so the gate resolves immediately
  useEffect(() => {
    if (!skipOpening) return
    const existing = loadSession()
    if (!existing) {
      persistSession({
        id: `session-${Date.now()}`,
        fullName: 'Preview User',
        email: 'preview@example.com',
        status: 'active',
        startedAt: new Date().toISOString(),
      })
      // Signal onboarding listeners
      window.dispatchEvent(new Event('ecclesia:session-created'))
    }
  }, [skipOpening])

  return (
    <div className="app-root">
      <SoundscapeProvider>
        {skipOpening ? (
          <OnboardingGate>
            <GameShell />
            <TutorialOverlay />
          </OnboardingGate>
        ) : (
          <OpeningScreen>
            <OnboardingGate>
              <GameShell />
              <TutorialOverlay />
            </OnboardingGate>
          </OpeningScreen>
        )}
      </SoundscapeProvider>
    </div>
  )
}

export default App
