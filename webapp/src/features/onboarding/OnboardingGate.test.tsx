import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { OnboardingGate } from './OnboardingGate'
import { SESSION_STORAGE_KEY } from './sessionStorage'

describe('OnboardingGate', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('collects student identity before revealing the experience', async () => {
    const user = userEvent.setup()

    render(
      <OnboardingGate>
        <div>Gameplay ready</div>
      </OnboardingGate>,
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Full name/i), 'Marcus Historicus')
    await user.type(screen.getByLabelText(/Email/i), 'marcus@example.edu')
    await user.click(screen.getByTestId('submit-onboarding'))

    await waitFor(() => {
      expect(screen.getByText(/Gameplay ready/i)).toBeInTheDocument()
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    const stored = window.localStorage.getItem(SESSION_STORAGE_KEY)
    expect(stored).toMatch(/marcus@example\.edu/)
  })

  it('offers to resume when an active session already exists', async () => {
    const existing = {
      id: 'session-1',
      fullName: 'Claudia of Arles',
      email: 'claudia@example.edu',
      status: 'active',
      startedAt: new Date('2025-01-01T10:00:00Z').toISOString(),
    }
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(existing))

    const user = userEvent.setup()

    render(
      <OnboardingGate>
        <div>Gameplay ready</div>
      </OnboardingGate>,
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByText(/Resume Your Session/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Resume session/i }))

    await waitFor(() => {
      expect(screen.getByText(/Gameplay ready/i)).toBeInTheDocument()
    })
  })

  it('locks the experience once a session is marked completed', () => {
    const completed = {
      id: 'session-1',
      fullName: 'Lucius',
      email: 'lucius@example.edu',
      status: 'completed',
      startedAt: new Date('2025-01-01T10:00:00Z').toISOString(),
    }
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(completed))

    render(
      <OnboardingGate>
        <div>Gameplay ready</div>
      </OnboardingGate>,
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByText(/Session Closed/i)).toBeInTheDocument()
  })
})
