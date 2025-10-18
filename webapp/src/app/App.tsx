import { SoundscapeProvider } from '@/features/audio/SoundscapeProvider'
import { GameShell } from '@/features/game/GameShell'
import { OnboardingGate } from '@/features/onboarding/OnboardingGate'

/**
 * Root application component. Holds global layout and cross-cutting UI chrome.
 * Feature-level modules (e.g., onboarding, gameplay, reports) mount inside this shell.
 */
export function App() {
  return (
    <div className="app-root">
      <SoundscapeProvider>
        <OnboardingGate>
          <GameShell />
        </OnboardingGate>
      </SoundscapeProvider>
    </div>
  )
}

export default App
