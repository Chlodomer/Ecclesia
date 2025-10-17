import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'

import {
  baseDeck,
  drawEvent,
  getImperialStatus,
  type EventChoice,
  type EventOutcome,
  type GameEvent,
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
  log: GameLogEntry[]
  eventsResolved: Set<string>
  ending: GameEnding | null
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
  | { type: 'markComplete'; payload: { ending: GameEnding } }

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

      return {
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
    }

    case 'enterCooldown': {
      return {
        ...state,
        phase: 'cooldown',
        cooldownEndsAt: action.payload.endsAt,
      }
    }

    case 'advanceToEvent': {
      return {
        ...state,
        phase: action.payload.event ? 'decision' : 'complete',
        currentEvent: action.payload.event,
        cooldownEndsAt: null,
        resolvedOutcome: null,
        imperialStatus: action.payload.imperialStatus,
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

const initialState: GameEngineState = {
  phase: 'loading',
  year: baseDeck.initialYear,
  imperialStatus: getImperialStatus(baseDeck.initialYear),
  stats: INITIAL_STATS,
  currentEvent: null,
  pendingChoice: null,
  pendingReflectionAnswer: null,
  resolvedOutcome: null,
  cooldownEndsAt: null,
  log: [],
  eventsResolved: new Set(),
  ending: null,
}

export function useGameEngine() {
  const [state, dispatch] = useReducer(gameReducer, initialState)

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
    const updatedStats = applyStatDelta(state.stats, outcome.effects)
    const nextImperial = getImperialStatus(state.year + outcome.yearAdvance)

    dispatch({
      type: 'resolveChoice',
      payload: {
        outcome,
        stats: updatedStats,
        imperialStatus: nextImperial,
        timestamp: new Date().toISOString(),
      },
    })

    if (checkForEnding(updatedStats)) {
      return
    }

    const endsAt = Date.now() + COOLDOWN_MS
    dispatch({ type: 'enterCooldown', payload: { endsAt } })
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

  const cooldownRemainingMs = Math.max(0, (state.cooldownEndsAt ?? 0) - Date.now())

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
