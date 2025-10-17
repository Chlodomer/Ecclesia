import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { GameShell } from './GameShell'

describe('GameShell interactive loop', () => {
  it('renders the first event and allows selecting a choice', async () => {
    render(<GameShell />)

    expect(await screen.findByText(/Who Joins the Table/i)).toBeInTheDocument()
    expect(screen.getByText(/Merchants from Massilia/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Keep the celebration private/i })).toBeInTheDocument()
  })

  it('resolves a choice after answering the reflection prompt', async () => {
    const user = userEvent.setup({ delay: null })

    render(<GameShell />)

    await screen.findByText(/Who Joins the Table/i)

    await user.click(screen.getByRole('button', { name: /Keep the celebration private/i }))
    await user.click(screen.getByLabelText(/They fear syncretism/i))
    await user.click(screen.getByRole('button', { name: /Confirm decision/i }))

    await waitFor(() => {
      expect(screen.getByText(/Outcome/i)).toBeInTheDocument()
    })

  })

  it('logs decisions into the timeline after resolution', async () => {
    const user = userEvent.setup({ delay: null })

    render(<GameShell />)
    await screen.findByText(/Who Joins the Table/i)

    await user.click(screen.getByRole('button', { name: /Accept the offer/i }))
    await user.click(screen.getByLabelText(/Imperial agents may notice/i))
    await user.click(screen.getByRole('button', { name: /Confirm decision/i }))

    await waitFor(() => {
      expect(screen.getByText(/Outcome/i)).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText(/Decisions Logged/i)).toBeInTheDocument()
      expect(screen.getByText(/Who Joins the Table/i)).toBeInTheDocument()
    })

  })
})
