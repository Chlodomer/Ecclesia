import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'

import {
  baseDeck,
  drawEvent,
  drawMicroEvent,
  drawMicroEventForResources,
  getImperialStatus,
  type EventChoice,
  type EventOutcome,
  type GameEvent,
  type MicroEvent,
  type ReflectionPrompt,
  type StatDelta,
} from '@/content/eventDeck'
import { pickWeightedOption } from '@/lib/random'

type GamePhase = 'loading' | 'decision' | 'confirm' | 'resolving' | 'cooldown' | 'complete'

export type GameStats = {
  members: number
  cohesion: number
  resources: number
  influence: number
}

export type GameEnding = 'victory' | 'collapse'

export type GameLogEntry = {
  timestamp: string
  eventId: string
  eventTitle: string
  choiceId: string
  choiceLabel: string
  reflectionPrompt: string | null
  reflectionAnswer: string | null
  reflectionCorrect: boolean | null
  outcomeId: string
  outcomeDescription: string
  statsAfter: GameStats
  yearAfter: number
  imperialStatusAfter: string
}

type GameEngineState = {
  phase: GamePhase
  year: number
  imperialStatus: string
  stats: GameStats
  currentEvent: GameEvent | null
  pendingChoice: EventChoice | null
  pendingReflectionAnswer: number | null
  resolvedOutcome: EventOutcome | null
  cooldownEndsAt: number | null
  microEventPending: MicroEvent | null
  microEventRevealAt: number | null
  microEventRevealed: boolean
  microEventHistory: string[]
  log: GameLogEntry[]
  eventsResolved: Set<string>
  ending: GameEnding | null
  tags: Set<string>
}

type GameEngineAction =
  | { type: 'initialize'; payload: { event: GameEvent; year: number } }
  | { type: 'selectChoice'; payload: { choice: EventChoice } }
  | { type: 'setReflectionAnswer'; payload: { answerIndex: number } }
  | {
      type: 'resolveChoice'
      payload: { outcome: EventOutcome; timestamp: string; stats: GameStats; imperialStatus: string }
    }
  | { type: 'enterCooldown'; payload: { endsAt: number } }
  | {
      type: 'advanceToEvent'
      payload: { event: GameEvent | null; year: number; imperialStatus: string }
    }
  | { type: 'scheduleMicroEvent'; payload: { micro: MicroEvent; revealAt: number } }
  | { type: 'revealMicroEvent' }
  | { type: 'markComplete'; payload: { ending: GameEnding } }
  | { type: 'applyTags'; payload: { add?: string[]; remove?: string[] } }

const INITIAL_STATS: GameStats = {
  members: 48,
  cohesion: 70,
  resources: 35,
  influence: 20,
}

const WIN_TARGET = 500
const LOSS_THRESHOLD = 0
const COOLDOWN_MS = import.meta.env.MODE === 'test' ? 150 : 6500

function applyStatDelta(stats: GameStats, delta: StatDelta): GameStats {
  return {
    members: Math.max(0, stats.members + (delta.members ?? 0)),
    cohesion: Math.max(0, Math.min(100, stats.cohesion + (delta.cohesion ?? 0))),
    resources: Math.max(0, Math.min(100, stats.resources + (delta.resources ?? 0))),
    influence: Math.max(0, Math.min(100, stats.influence + (delta.influence ?? 0))),
  }
}

function getMembersGrowthFactor(year: number): number {
  if (year < 160) return 1.0
  if (year < 313) return 1.25
  if (year < 380) return 1.5
  return 2.1
}

function gameReducer(state: GameEngineState, action: GameEngineAction): GameEngineState {
  switch (action.type) {
    case 'initialize': {
      return {
        ...state,
        phase: 'decision',
        currentEvent: action.payload.event,
        year: action.payload.year,
        imperialStatus: getImperialStatus(action.payload.year),
      }
    }

    case 'selectChoice': {
      return {
        ...state,
        phase: 'confirm',
        pendingChoice: action.payload.choice,
        pendingReflectionAnswer: null,
      }
    }

    case 'setReflectionAnswer': {
      return {
        ...state,
        pendingReflectionAnswer: action.payload.answerIndex,
      }
    }

    case 'resolveChoice': {
      if (!state.currentEvent || !state.pendingChoice) return state

      const entry: GameLogEntry = {
        timestamp: action.payload.timestamp,
        eventId: state.currentEvent.id,
        eventTitle: state.currentEvent.title,
        choiceId: state.pendingChoice.id,
        choiceLabel: state.pendingChoice.label,
        reflectionPrompt: state.pendingChoice.reflection?.prompt ?? null,
        reflectionAnswer:
          state.pendingChoice.reflection && state.pendingReflectionAnswer != null
            ? state.pendingChoice.reflection.options[state.pendingReflectionAnswer] ?? null
            : null,
        reflectionCorrect:
          state.pendingChoice.reflection && state.pendingReflectionAnswer != null
            ? state.pendingChoice.reflection.correctIndex === state.pendingReflectionAnswer
            : null,
        outcomeId: action.payload.outcome.id,
        outcomeDescription: action.payload.outcome.description,
        statsAfter: action.payload.stats,
        yearAfter: state.year + action.payload.outcome.yearAdvance,
        imperialStatusAfter: action.payload.imperialStatus,
      }

      const updatedResolved = new Set(state.eventsResolved)
      updatedResolved.add(state.currentEvent.id)

      const nextState: GameEngineState = {
        ...state,
        phase: 'resolving',
        stats: action.payload.stats,
        year: state.year + action.payload.outcome.yearAdvance,
        imperialStatus: action.payload.imperialStatus,
        resolvedOutcome: action.payload.outcome,
        log: [...state.log, entry],
        eventsResolved: updatedResolved,
        pendingChoice: null,
        pendingReflectionAnswer: null,
      }

      return nextState
    }

    case 'enterCooldown': {
      return {
        ...state,
        phase: 'cooldown',
        cooldownEndsAt: action.payload.endsAt,
        microEventRevealed: false,
      }
    }

    case 'advanceToEvent': {
      return {
        ...state,
        phase: action.payload.event ? 'decision' : 'complete',
        currentEvent: action.payload.event,
        cooldownEndsAt: null,
        resolvedOutcome: null,
        microEventPending: null,
        microEventRevealAt: null,
        microEventRevealed: false,
        imperialStatus: action.payload.imperialStatus,
      }
    }

    case 'applyTags': {
      const next = new Set(state.tags)
      for (const t of action.payload.add ?? []) next.add(t)
      for (const t of action.payload.remove ?? []) next.delete(t)
      return { ...state, tags: next }
    }

    case 'scheduleMicroEvent': {
      return {
        ...state,
        microEventPending: action.payload.micro,
        microEventRevealAt: action.payload.revealAt,
        microEventRevealed: false,
      }
    }

    case 'revealMicroEvent': {
      if (!state.microEventPending) return state
      const nextStats = applyStatDelta(state.stats, state.microEventPending.effects)
      const nextHistory = [...state.microEventHistory, state.microEventPending.id].slice(-20)
      return {
        ...state,
        stats: nextStats,
        microEventRevealed: true,
        microEventHistory: nextHistory,
      }
    }

    case 'markComplete': {
      return {
        ...state,
        phase: 'complete',
        ending: action.payload.ending,
        currentEvent: null,
        cooldownEndsAt: null,
      }
    }

    default:
      return state
  }
}

// Debug helper: skip to specific event number via URL param ?skipTo=22
function getDebugInitialState(): GameEngineState {
  if (typeof window === 'undefined') return getDefaultInitialState()

  const params = new URLSearchParams(window.location.search)
  const skipTo = parseInt(params.get('skipTo') || '0', 10)

  if (!skipTo || skipTo <= 0) return getDefaultInitialState()

  // Simulate progress through events
  const allEventIds = baseDeck.events.map(e => e.id)
  const resolvedCount = Math.min(skipTo - 1, allEventIds.length - 1)
  const eventsResolved = new Set(allEventIds.slice(0, resolvedCount))

  // Set year to late game (Fading era)
  const year = 450

  // Set stats to viable late-game values
  const stats: GameStats = {
    members: 380,
    cohesion: 65,
    resources: 45,
    influence: 60,
  }

  return {
    phase: 'loading',
    year,
    imperialStatus: getImperialStatus(year),
    stats,
    currentEvent: null,
    pendingChoice: null,
    pendingReflectionAnswer: null,
    resolvedOutcome: null,
    cooldownEndsAt: null,
    microEventPending: null,
    microEventRevealAt: null,
    microEventRevealed: false,
    microEventHistory: [],
    log: [],
    eventsResolved,
    ending: null,
    tags: new Set<string>(),
  }
}

function getDefaultInitialState(): GameEngineState {
  return {
    phase: 'loading',
    year: baseDeck.initialYear,
    imperialStatus: getImperialStatus(baseDeck.initialYear),
    stats: INITIAL_STATS,
    currentEvent: null,
    pendingChoice: null,
    pendingReflectionAnswer: null,
    resolvedOutcome: null,
    cooldownEndsAt: null,
    microEventPending: null,
    microEventRevealAt: null,
    microEventRevealed: false,
    microEventHistory: [],
    log: [],
    eventsResolved: new Set(),
    ending: null,
    tags: new Set<string>(),
  }
}

const initialState: GameEngineState = getDebugInitialState()

export function useGameEngine() {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const [nowTick, setNowTick] = useState(() => Date.now())

  const cooldownTimer = useRef<number | null>(null)

  useEffect(() => {
    if (state.phase === 'loading') {
      const firstEvent = drawEvent(baseDeck, {
        currentYear: state.year,
        eventsResolved: state.eventsResolved,
      })
      if (firstEvent) {
        dispatch({ type: 'initialize', payload: { event: firstEvent, year: state.year } })
      } else {
        dispatch({ type: 'markComplete', payload: { ending: 'victory' } })
      }
    }
  }, [state.phase, state.eventsResolved, state.year])

  const checkForEnding = useCallback(
    (stats: GameStats) => {
      if (stats.cohesion <= LOSS_THRESHOLD || stats.members <= LOSS_THRESHOLD) {
        dispatch({ type: 'markComplete', payload: { ending: 'collapse' } })
        return true
      }

      if (stats.members >= WIN_TARGET) {
        dispatch({ type: 'markComplete', payload: { ending: 'victory' } })
        return true
      }

      return false
    },
    [dispatch],
  )

  const selectChoice = useCallback((choice: EventChoice) => {
    dispatch({ type: 'selectChoice', payload: { choice } })
  }, [])

  const setReflectionAnswer = useCallback((answerIndex: number) => {
    dispatch({ type: 'setReflectionAnswer', payload: { answerIndex } })
  }, [])

  const resolveChoice = useCallback(() => {
    const current = state.currentEvent
    const choice = state.pendingChoice
    if (!current || !choice) return

    const outcome = pickWeightedOption(choice.outcomes, Math.random)
    // Scale members growth by era so reaching 500 is achievable within a session
    const factor = getMembersGrowthFactor(state.year)
    const scaled: StatDelta = {
      ...outcome.effects,
      members: Math.round((outcome.effects.members ?? 0) * factor),
    }
    const updatedStats = applyStatDelta(state.stats, scaled)
    // Ensure time progresses meaningfully per event; larger steps in later eras
    const minStep = state.year < 200 ? 3 : state.year < 313 ? 6 : state.year < 430 ? 10 : 15
    const effectiveAdvance = Math.max(outcome.yearAdvance, minStep)
    const adjustedOutcome: EventOutcome = { ...outcome, yearAdvance: effectiveAdvance }
    const nextImperial = getImperialStatus(state.year + effectiveAdvance)

    dispatch({
      type: 'resolveChoice',
      payload: {
        outcome: adjustedOutcome,
        stats: updatedStats,
        imperialStatus: nextImperial,
        timestamp: new Date().toISOString(),
      },
    })

    // Apply any tag changes from the outcome
    dispatch({
      type: 'applyTags',
      payload: { add: outcome.addTags, remove: outcome.removeTags },
    })

    if (checkForEnding(updatedStats)) {
      return
    }

    // Check if there are more events before entering cooldown
    // This ensures a smooth transition to the end screen on the final event
    const nextEventAvailable = drawEvent(
      baseDeck,
      {
        currentYear: state.year + effectiveAdvance,
        eventsResolved: new Set([...state.eventsResolved, state.currentEvent.id]),
      },
      Date.now(),
    )

    if (!nextEventAvailable) {
      // No more events - show outcome briefly, then transition to victory screen
      // Wait 2.5 seconds to let user read the final outcome
      setTimeout(() => {
        dispatch({ type: 'markComplete', payload: { ending: 'victory' } })
      }, 2500)
      return
    }

    const endsAt = Date.now() + COOLDOWN_MS
    dispatch({ type: 'enterCooldown', payload: { endsAt } })

    // Schedule a micro-event to reveal midway through cooldown (bias toward donations if low on resources)
    let micro = drawMicroEventForResources(
      updatedStats.resources,
      state.year,
      Date.now(),
      Array.from(state.microEventHistory),
    )
    // Avoid immediate repetition of recent micro-events
    let guard = 0
    while (state.microEventHistory.includes(micro.id) && guard < 4) {
      micro = drawMicroEvent(Date.now() + guard)
      guard += 1
    }
    const revealAt = Date.now() + Math.max(1200, Math.floor(COOLDOWN_MS * 0.5))
    dispatch({ type: 'scheduleMicroEvent', payload: { micro, revealAt } })
  }, [state.currentEvent, state.pendingChoice, state.stats, state.year, checkForEnding])

  const advanceAfterCooldown = useCallback(() => {
    const nextEvent = drawEvent(
      baseDeck,
      {
        currentYear: state.year,
        eventsResolved: state.eventsResolved,
      },
      Date.now(),
    )

    if (!nextEvent) {
      dispatch({ type: 'markComplete', payload: { ending: 'victory' } })
      return
    }

    dispatch({
      type: 'advanceToEvent',
      payload: {
        event: nextEvent,
        year: state.year,
        imperialStatus: getImperialStatus(state.year),
      },
    })
  }, [state.year, state.eventsResolved])

  useEffect(() => {
    if (state.phase !== 'cooldown' || !state.cooldownEndsAt) {
      if (cooldownTimer.current) {
        window.clearTimeout(cooldownTimer.current)
        cooldownTimer.current = null
      }
      return
    }

    const remaining = state.cooldownEndsAt - Date.now()
    if (remaining <= 0) {
      advanceAfterCooldown()
      return
    }

    cooldownTimer.current = window.setTimeout(advanceAfterCooldown, remaining)

    return () => {
      if (cooldownTimer.current) {
        window.clearTimeout(cooldownTimer.current)
      }
    }
  }, [state.phase, state.cooldownEndsAt, advanceAfterCooldown])

  useEffect(() => {
    if (state.phase !== 'cooldown' || !state.cooldownEndsAt) {
      setNowTick(Date.now())
      return
    }

    setNowTick(Date.now())
    const interval = window.setInterval(() => {
      setNowTick(Date.now())
    }, 250)

    return () => {
      window.clearInterval(interval)
    }
  }, [state.phase, state.cooldownEndsAt])

  // Schedule a one-shot timer to reveal the micro-event at the planned time
  useEffect(() => {
    if (
      state.phase !== 'cooldown' ||
      !state.microEventPending ||
      !state.microEventRevealAt ||
      state.microEventRevealed
    ) {
      return
    }
    const delay = Math.max(0, state.microEventRevealAt - Date.now())
    const id = window.setTimeout(() => {
      dispatch({ type: 'revealMicroEvent' })
    }, delay)
    return () => {
      window.clearTimeout(id)
    }
  }, [state.phase, state.microEventPending, state.microEventRevealAt, state.microEventRevealed])

  // Reveal micro-event once reveal time passes
  useEffect(() => {
    if (
      state.phase === 'cooldown' &&
      state.microEventPending &&
      state.microEventRevealAt &&
      !state.microEventRevealed &&
      Date.now() >= state.microEventRevealAt
    ) {
      dispatch({ type: 'revealMicroEvent' })
    }
  }, [state.phase, state.microEventPending, state.microEventRevealAt, state.microEventRevealed])

  const cooldownRemainingMs = Math.max(0, (state.cooldownEndsAt ?? 0) - nowTick)

  const helpers = useMemo(() => {
    const requireReflection = state.pendingChoice?.reflection != null
    const reflectionPrompt: ReflectionPrompt | null = state.pendingChoice?.reflection ?? null
    const canSubmitReflection = !requireReflection || state.pendingReflectionAnswer != null
    return {
      selectChoice,
      setReflectionAnswer,
      resolveChoice,
      canSubmitReflection,
      reflectionPrompt,
      cooldownRemainingMs,
    }
  }, [
    state.pendingChoice,
    state.pendingReflectionAnswer,
    selectChoice,
    setReflectionAnswer,
    resolveChoice,
    cooldownRemainingMs,
  ])

  return {
    state,
    ...helpers,
  }
}
