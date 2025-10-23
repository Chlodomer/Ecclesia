import { useEffect, useMemo, useRef, useState } from 'react'

import { useSoundscape } from '@/features/audio/SoundscapeProvider'
import { useCountUp } from '@/hooks/useCountUp'
import { useStudentSession } from '@/features/onboarding/OnboardingGate'

import styles from './GameShell.module.css'
import { useGameEngine } from './state/gameEngine'

function eraKeyFromYear(year: number): 'Founding' | 'Persecution' | 'Imperial' | 'Fading' {
  // foundation: 100–200; persecution: 200–313; imperial: 313–430; fading: 430–500
  if (year < 200) return 'Founding'
  if (year < 313) return 'Persecution'
  if (year < 430) return 'Imperial'
  return 'Fading'
}

export function GameShell() {
  const session = useStudentSession()
  const {
    playEffect,
    playUi,
    effectsEnabled,
    setEffectsEnabled,
    effectsVolume,
    setEffectsVolume,
    themeEnabled,
    setThemeEnabled,
    themeVolume,
    setThemeVolume,
  } = useSoundscape()
  const [textScale, setTextScale] = useState(() => {
    if (typeof window === 'undefined') return 1
    const stored = window.localStorage.getItem('ecclesia:text-scale')
    const parsed = stored ? parseFloat(stored) : 1
    return Number.isFinite(parsed) && parsed >= 1 && parsed <= 1.3 ? parsed : 1
  })
  const {
    state,
    selectChoice,
    setReflectionAnswer,
    resolveChoice,
    reflectionPrompt,
    canSubmitReflection,
    cooldownRemainingMs,
  } = useGameEngine()

  // Signal mount to allow opening overlay to dismiss only when ready
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('ecclesia:game-mounted'))
    }
  }, [])

  // Proactively signal when the first scene image is ready to display
  const sceneReadyAnnouncedRef = useRef(false)

  const {
    stats,
    year,
    imperialStatus,
    currentEvent,
    pendingChoice,
    resolvedOutcome,
    microEventPending,
    microEventRevealed,
    log,
    phase,
    ending,
  } =
    state

  // Scenario SFX disabled; do not play outcome cues
  // useEffect(() => {
  //   if (!resolvedOutcome?.soundEffect) return
  //   playEffect(resolvedOutcome.soundEffect)
  // }, [resolvedOutcome?.id, resolvedOutcome?.soundEffect, playEffect])

  // Play micro-event cue when it reveals during cooldown
  useEffect(() => {
    if (!microEventRevealed) return
    // Play a soft UI click to punctuate the appearance
    playUi()
  }, [microEventRevealed, playUi])

  // Scenario switch sound disabled (less intrusive experience)
  const prevEventIdRef = useRef<string | null>(null)
  useEffect(() => {
    const id = currentEvent?.id ?? null
    if (id) prevEventIdRef.current = id
  }, [currentEvent?.id])

  // Meanwhile overlay visibility and exit timing
  const [showMeanwhile, setShowMeanwhile] = useState(false)
  const [meanwhileExiting, setMeanwhileExiting] = useState(false)
  useEffect(() => {
    if (!microEventRevealed) return
    setShowMeanwhile(true)
    setMeanwhileExiting(false)
    // Hold a bit longer on screen
    const hold = window.setTimeout(() => setMeanwhileExiting(true), 5600)
    const done = window.setTimeout(() => setShowMeanwhile(false), 6100)
    return () => {
      window.clearTimeout(hold)
      window.clearTimeout(done)
    }
  }, [microEventRevealed])

  // Shuffle reflection options per pending choice to avoid correct answer always first
  const [reflectionOrder, setReflectionOrder] = useState<number[] | null>(null)
  useEffect(() => {
    const opts = state.pendingChoice?.reflection?.options
    if (!opts) {
      setReflectionOrder(null)
      return
    }
    const order = opts.map((_, i) => i)
    for (let i = order.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[order[i], order[j]] = [order[j], order[i]]
    }
    setReflectionOrder(order)
  }, [state.pendingChoice?.id])

  // Ensure onboarding theme is faded out once the game shell mounts
  // Do not stop theme on game mount; preserve ongoing music from onboarding unless user toggles it

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.style.setProperty('--app-text-scale', String(textScale))
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('ecclesia:text-scale', String(textScale))
    }
  }, [textScale])

  const handleTextScaleChange = (scale: number) => {
    setTextScale(Math.max(1, Math.min(1.25, Number(scale.toFixed(2)))))
  }

  const statEntries = useMemo(() => {
    const showDelta =
      (phase === 'resolving' || phase === 'cooldown') &&
      (resolvedOutcome?.effects != null || (state.microEventPending?.effects && state.microEventRevealed))

    const base = resolvedOutcome?.effects ?? {}
    const micro = state.microEventRevealed ? state.microEventPending?.effects ?? {} : {}

    const sum = (a: number | undefined, b: number | undefined) => (a ?? 0) + (b ?? 0)
    const deltas = showDelta
      ? {
          members: sum((base as any).members, (micro as any).members),
          cohesion: sum((base as any).cohesion, (micro as any).cohesion),
          resources: sum((base as any).resources, (micro as any).resources),
          influence: sum((base as any).influence, (micro as any).influence),
        }
      : {}

    return [
      { label: 'Members', value: stats.members, delta: showDelta ? (deltas as any).members ?? 0 : null },
      { label: 'Cohesion', value: stats.cohesion, delta: showDelta ? (deltas as any).cohesion ?? 0 : null },
      { label: 'Resources', value: stats.resources, delta: showDelta ? (deltas as any).resources ?? 0 : null },
      { label: 'Influence', value: stats.influence, delta: showDelta ? (deltas as any).influence ?? 0 : null },
    ]
  }, [stats, phase, resolvedOutcome, state.microEventPending?.effects, state.microEventRevealed])

  const recentLog = useMemo(() => [...log].reverse().slice(0, 6), [log])
  const recentReflections = useMemo(
    () =>
      [...log]
        .reverse()
        .filter((entry) => entry.reflectionPrompt)
        .slice(0, 3),
    [log],
  )

  const countdownSeconds = Math.max(0, Math.ceil(cooldownRemainingMs / 1000))

  // Preserve the final event's scene when transitioning to complete
  const lastEventRef = useRef<GameEvent | null>(null)
  if (currentEvent) {
    lastEventRef.current = currentEvent
  }

  const sceneImage =
    currentEvent?.sceneImage ??
    lastEventRef.current?.sceneImage ??
    '/assets/church_being_built.png'
  const sceneTitle =
    currentEvent?.sceneTitle ??
    lastEventRef.current?.sceneTitle ??
    'Basilica Under Construction'
  const sceneCaption =
    currentEvent?.sceneCaption ??
    lastEventRef.current?.sceneCaption ??
    "Timber scaffolds clutch the nave as masons pause for guidance. Another chapter in the community's story is on the way."

  // Backdrop image for the base layer (used for complete screen)
  const backdropImage = sceneImage

  // After we know the current scene image, preload and announce readiness
  useEffect(() => {
    if (sceneReadyAnnouncedRef.current) return
    const src = sceneImage
    if (!src) return
    let done = false
    const img = new Image()
    const announce = () => {
      if (done) return
      done = true
      sceneReadyAnnouncedRef.current = true
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('ecclesia:scene-ready'))
      }
    }
    img.onload = announce
    img.onerror = announce
    img.src = src
    const fallback = window.setTimeout(announce, 1000)
    return () => window.clearTimeout(fallback)
  }, [sceneImage])

  // Choice disabling computed after chapter slide state is known (set below)
  const lastEvent = log.length > 0 ? log[log.length - 1] : null

  // UI era label should always reflect the actual historical year, not the event's era property
  // This ensures timeline accuracy even when events from later eras appear early
  const uiEraKey: 'Founding' | 'Persecution' | 'Imperial' | 'Fading' = useMemo(() => {
    return eraKeyFromYear(year)
  }, [year])

  const eraSummary = useMemo(() => {
    switch (uiEraKey) {
      case 'Founding':
        return {
          label: 'Founding Era',
          briefing: 'Apostolic witness, house churches, and fragile alliances shape daily ministry.',
        }
      case 'Persecution':
        return {
          label: 'Persecution Era',
          briefing: 'Magistrates test loyalty; underground networks and prudent leadership sustain the flock.',
        }
      case 'Imperial':
        return {
          label: 'Imperial Era',
          briefing:
            'Legal worship and patronage expand influence; navigating politics and expectations becomes central.',
        }
      case 'Fading':
        return {
          label: 'The Fading Empire',
          briefing:
            'Imperial structures wane; provincial rule and Visigothic settlement reshape civic and church life.',
        }
    }
  }, [uiEraKey])

  const victoryProgress = Math.min(100, Math.round((stats.members / 500) * 100))
  const cohesionRisk = stats.cohesion <= 30 ? 'At risk of fracture—prioritize unity.' : 'Cohesion stable.'

  // Animated number subcomponent to keep hooks usage valid
  function AnimatedNumber({ value, duration = 600 }: { value: number; duration?: number }) {
    const display = useCountUp(value, duration)
    return <>{display}</>
  }

  // Download final report JSON capturing choices
  function generateReportJson() {
    const data = {
      meta: {
        generatedAt: new Date().toISOString(),
        version: '3.0',
      },
      session: session
        ? { id: session.id, fullName: session.fullName, email: session.email }
        : null,
      outcome: ending,
      stats: { ...stats },
      totalDecisions: log.length,
      choices: log.map((entry) => ({
        timestamp: entry.timestamp,
        year: entry.yearAfter,
        event: entry.eventTitle,
        choice: entry.choiceLabel,
        reflectionPrompt: entry.reflectionPrompt ?? null,
        reflectionAnswer: entry.reflectionAnswer ?? null,
        reflectionCorrect: entry.reflectionCorrect,
      })),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    a.href = url
    a.download = `ecclesia_report_${stamp}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Background crossfade state
  const [prevSceneImage, setPrevSceneImage] = useState<string | null>(null)
  const [bgTransitioning, setBgTransitioning] = useState(false)
  const lastSceneImageRef = useRef<string | null>(null)
  useEffect(() => {
    const last = lastSceneImageRef.current
    if (last && last !== sceneImage) {
      setPrevSceneImage(last)
      setBgTransitioning(true)
      const t = window.setTimeout(() => {
        setPrevSceneImage(null)
        setBgTransitioning(false)
      }, 800)
      lastSceneImageRef.current = sceneImage
      return () => window.clearTimeout(t)
    }
    lastSceneImageRef.current = sceneImage
  }, [sceneImage])

  // Chapter slide for era transitions (movie-style slide)
  const [showEraChapter, setShowEraChapter] = useState(false)
  const [eraChapterKey, setEraChapterKey] = useState(0)
  const lastEraForChapterRef = useRef<string | null>(null)
  useEffect(() => {
    if (!session) return
    // Allow disabling via query flag for debugging
    const sp = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
    const overlaysDisabled = !!(sp && (sp.has('noChapters') || sp.has('noOverlays')))
    if (overlaysDisabled) return

    const currentUiEra = uiEraKey
    const eraChanged = lastEraForChapterRef.current && lastEraForChapterRef.current !== currentUiEra
    // Do not show on first load and do not show if there is no prior gameplay
    if (eraChanged && state.log.length > 0 && phase !== 'loading') {
      lastEraForChapterRef.current = currentUiEra
      setShowEraChapter(true)
      setEraChapterKey((k) => k + 1)
      const total = 2400 // fade in (600), hold (1200), fade out (600)
      const t = window.setTimeout(() => setShowEraChapter(false), total)
      return () => window.clearTimeout(t)
    }
    // Initialize without showing the chapter slide on first load
    if (!lastEraForChapterRef.current && currentUiEra) {
      lastEraForChapterRef.current = currentUiEra
    }
  }, [uiEraKey, session, state.log.length, phase])

  // Climax sequence on final end, then show complete card and closing report
  const [climaxActive, setClimaxActive] = useState(false)
  const [climaxDone, setClimaxDone] = useState(false)
  const [reportVisible, setReportVisible] = useState(false)
  const prevPhaseRef = useRef<string | null>(null)
  useEffect(() => {
    const prev = prevPhaseRef.current
    if (phase === 'complete' && prev !== 'complete') {
      // Entering final state → play short climax, then reveal complete card, then report
      setClimaxActive(true)
      setClimaxDone(false)
      setReportVisible(false)
      const t1 = window.setTimeout(() => {
        setClimaxActive(false)
        setClimaxDone(true)
      }, 1200)
      const t2 = window.setTimeout(() => setReportVisible(true), 2800)
      prevPhaseRef.current = phase
      return () => {
        window.clearTimeout(t1)
        window.clearTimeout(t2)
      }
    }
    prevPhaseRef.current = phase
  }, [phase])

  // Announce when the initial event is fully ready so the opening overlay can safely dismiss
  useEffect(() => {
    if (typeof window === 'undefined') return
    if ((phase === 'decision' || phase === 'confirm' || phase === 'resolving' || phase === 'cooldown') && currentEvent) {
      window.dispatchEvent(new Event('ecclesia:app-ready'))
    }
  }, [phase, currentEvent])

  // Choices are disabled outside decision/confirm; chapter slide blocks via overlay z-index
  const disableChoices = phase !== 'decision' && phase !== 'confirm'

  // Collapsible insights section
  const [insightsOpen, setInsightsOpen] = useState(false)
  const insightsOuterRef = useRef<HTMLDivElement | null>(null)
  const insightsInnerRef = useRef<HTMLElement | null>(null)
  const [insightsHeight, setInsightsHeight] = useState<string | number>(0)

  const toggleInsights = () => {
    const inner = insightsInnerRef.current
    const outer = insightsOuterRef.current
    if (!inner || !outer) {
      setInsightsOpen((v) => !v)
      return
    }
    if (insightsOpen) {
      // closing: set from current pixel height to 0 for smooth collapse
      const current = inner.scrollHeight
      setInsightsHeight(current)
      requestAnimationFrame(() => setInsightsHeight(0))
      setInsightsOpen(false)
    } else {
      // opening: set to content height; on transition end we snap to auto
      const next = inner.scrollHeight
      setInsightsHeight(next)
      setInsightsOpen(true)
    }
  }

  useEffect(() => {
    const inner = insightsInnerRef.current
    const outer = insightsOuterRef.current
    if (!inner || !outer) return
    if (insightsOpen) {
      const next = inner.scrollHeight
      setInsightsHeight(next)
    } else {
      const current = inner.scrollHeight
      setInsightsHeight(current)
      requestAnimationFrame(() => setInsightsHeight(0))
    }
  }, [insightsOpen, recentReflections.length, lastEvent?.timestamp, themeEnabled, effectsEnabled])

  const handleInsightsTransitionEnd = () => {
    if (insightsOpen) {
      setInsightsHeight('auto')
    }
  }

  // Pane hint visibility controls with delayed fade out
  const [contextHintVisible, setContextHintVisible] = useState(false)
  const [interactionHintVisible, setInteractionHintVisible] = useState(false)
  const contextHintTimer = useRef<number | null>(null)
  const interactionHintTimer = useRef<number | null>(null)

  const showContextHint = () => {
    setContextHintVisible(true)
    if (contextHintTimer.current) window.clearTimeout(contextHintTimer.current)
    contextHintTimer.current = window.setTimeout(() => setContextHintVisible(false), 2000)
  }
  const showInteractionHint = () => {
    setInteractionHintVisible(true)
    if (interactionHintTimer.current) window.clearTimeout(interactionHintTimer.current)
    interactionHintTimer.current = window.setTimeout(() => setInteractionHintVisible(false), 2000)
  }
  const hideHints = () => {
    setContextHintVisible(false)
    setInteractionHintVisible(false)
  }
  useEffect(() => {
    return () => {
      if (contextHintTimer.current) window.clearTimeout(contextHintTimer.current)
      if (interactionHintTimer.current) window.clearTimeout(interactionHintTimer.current)
    }
  }, [])

  // Era-themed container class
  const shellClassName = `${styles.shell} ${
    uiEraKey === 'Founding'
      ? styles.eraFounding
      : uiEraKey === 'Persecution'
      ? styles.eraPersecution
      : uiEraKey === 'Imperial'
      ? styles.eraImperial
      : styles.eraFading
  }`

  // Chapter slide replaces previous full-screen era overlay

  // Imperial status hover hint
  function getImperialStatusSummary(status: string): string {
    switch (status) {
      case 'Localized Suspicion':
        return 'No empire-wide policy; scrutiny by local magistrates and neighbors.'
      case 'Localized Persecution':
        return 'Crackdowns vary by province; enforcement depends on local officials.'
      case 'Anxious Tolerance':
        return 'Christian practice is often allowed, but suspicion remains in places.'
      case 'Imperial Favor':
        return 'Official support and patronage bring influence—and new expectations.'
      case 'Provincial Integration':
        return 'As imperial power fades, the church assumes civic roles provincially.'
      default:
        return 'Imperial stance toward Christians during this period.'
    }
  }

  function StatusWithHint({ status }: { status: string }) {
    const [visible, setVisible] = useState(false)
    const timerRef = useRef<number | null>(null)
    const show = () => {
      setVisible(true)
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => setVisible(false), 2000)
    }
    const hide = () => setVisible(false)
    useEffect(() => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }, [])
    return (
      <span
        onMouseEnter={show}
        onMouseMove={show}
        onMouseLeave={hide}
        style={{ position: 'relative', display: 'inline-block' }}
      >
        {status}
        <div className={`${styles.hintBox} ${styles.statusHint} ${visible ? styles.hintBoxVisible : ''}`}>
          {getImperialStatusSummary(status)}
        </div>
      </span>
    )
  }

  return (
    <main className={shellClassName}>
      <div className={styles.primaryGrid}>
        <section
          className={styles.timelineColumn}
          aria-label="Community timeline"
          style={{ position: 'relative' }}
          onMouseEnter={showContextHint}
          onMouseMove={showContextHint}
          onMouseLeave={() => setContextHintVisible(false)}
        >
          <span className={styles.columnTag}>Context</span>
          <div className={`${styles.paneHint} ${contextHintVisible ? styles.paneHintVisible : ''}`}>
            This is where the story unfolds
          </div>
          <header className={styles.sessionHeader}>
            <h1>Ecclesia Cohort</h1>
            <span>
              {session ? `${session.fullName} · ${session.email}` : 'Unregistered observer'}
            </span>
            <span>
              {year} CE · <StatusWithHint status={imperialStatus} />
            </span>
          </header>

          <div className={styles.timelineStats}>
            {statEntries.map((stat) => (
              <div
                className={`${styles.statCard} ${
                  stat.delta != null && stat.delta !== 0 ? styles.statChanged : ''
                }`}
                key={stat.label}
              >
                <span className={styles.statLabel}>{stat.label}</span>
                <span className={styles.statValue}>
                  <AnimatedNumber value={stat.value} />
                  {stat.delta != null && stat.delta !== 0 ? (
                    <span
                      className={`${styles.statDelta} ${
                        stat.delta > 0 ? styles.statDeltaPositive : styles.statDeltaNegative
                      }`}
                    >
                      {stat.delta > 0 ? `+${stat.delta}` : stat.delta}
                    </span>
                  ) : null}
                </span>
              </div>
            ))}
          </div>

          <div>
            <h2 className={styles.panelTitle}>Decisions Logged</h2>
            {recentLog.length === 0 ? (
              <p className={styles.logEmpty}>No choices recorded yet. Begin guiding the community.</p>
            ) : (
              <ul className={styles.timelineList}>
                {recentLog.map((entry) => (
                  <li key={entry.timestamp}>
                    <span className={styles.logEntryTitle}>{entry.eventTitle}</span>
                    <span className={styles.logEntryMeta}>
                      {entry.yearAfter} CE · {entry.choiceLabel}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section
          className={`${styles.sceneColumn} ${phase === 'complete' ? styles.phaseComplete : ''} ${
            showEraChapter ? styles.chapterActive : ''
          }`}
          aria-label="Community scene"
        >
          <div
            className={styles.sceneBackgroundBase}
            style={{ backgroundImage: `url(${backdropImage})` }}
            aria-hidden
          />
          {phase !== 'complete' ? (
            <div
              className={`${styles.sceneBackgrounds} ${bgTransitioning ? styles.sceneBackgroundTransitioning : ''}`}
              aria-hidden
            >
              {prevSceneImage ? (
                <div
                  className={`${styles.sceneBackgroundLayer} ${styles.sceneBackgroundPrevious}`}
                  style={{ backgroundImage: `url(${prevSceneImage})` }}
                />
              ) : null}
              <div
                className={`${styles.sceneBackgroundLayer} ${styles.sceneBackgroundCurrent}`}
                style={{ backgroundImage: `url(${sceneImage})` }}
              />
            </div>
          ) : null}
          <div className={styles.sceneOverlay} />
          {phase !== 'complete' ? (
            <div className={styles.eraOverlay} aria-hidden="true">{eraSummary.label}</div>
          ) : null}
          {!((typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('noOverlays')) || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('noChapters'))) && showEraChapter ? (
            <div className={styles.eraChapterOverlay} role="dialog" aria-live="polite" key={eraChapterKey}>
              <div className={styles.eraChapterSlide}>
                <h3 className={styles.eraChapterTitle}>{eraSummary.label}</h3>
                <p className={styles.eraChapterBrief}>{eraSummary.briefing}</p>
              </div>
            </div>
          ) : null}
          {!(typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('noOverlays')) &&
          showMeanwhile &&
          state.microEventPending ? (
            <div
              className={`${styles.meanwhileOverlay} ${
                meanwhileExiting ? styles.meanwhileExit : styles.meanwhileEnter
              }`}
            >
              <div className={styles.meanwhileCard}>
                <p className={styles.meanwhileTitle}>Meanwhile…</p>
                <p className={styles.meanwhileText}>{state.microEventPending.description}</p>
                {state.microEventPending.effects ? (
                  <div className={styles.meanwhileDeltas}>
                    {[
                      ['Members', state.microEventPending.effects.members ?? 0],
                      ['Cohesion', state.microEventPending.effects.cohesion ?? 0],
                      ['Resources', state.microEventPending.effects.resources ?? 0],
                      ['Influence', state.microEventPending.effects.influence ?? 0],
                    ]
                      .filter(([, v]) => (v as number) !== 0)
                      .map(([label, v]) => (
                        <span
                          key={label as string}
                          className={`${styles.deltaChip} ${
                            (v as number) > 0 ? styles.deltaPlus : styles.deltaMinus
                          }`}
                        >
                          {(v as number) > 0 ? `+${v as number}` : (v as number)} {label as string}
                        </span>
                      ))}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
          {/* Always show scene content, overlay complete card on top */}
          <div className={`${styles.sceneContent} ${styles.fadeIn}`} key={currentEvent?.id ?? phase}>
            <p className={styles.sceneTitle}>{sceneTitle}</p>
            <p className={styles.sceneCaption}>{sceneCaption}</p>
          </div>
          {phase === 'complete' ? (
            <>
              {climaxActive ? (
                <div className={styles.climaxOverlay} aria-hidden="true">
                  <div className={styles.climaxBurst} />
                </div>
              ) : null}
              {climaxDone && !reportVisible ? (
                <div className={styles.completeCard}>
                  <h2 className={styles.completeTitle}>
                    {ending === 'victory' ? 'Basilica Dawn' : 'Community Scattered'}
                  </h2>
                  <p className={styles.completeSummary}>
                    {ending === 'victory'
                      ? 'Your community endures across centuries, anchoring a basilica that welcomes generations of disciples.'
                      : 'Cohesion fell below a sustainable threshold. The fragile community disperses, its story a cautionary tale for future shepherds.'}
                  </p>
                  <button type="button" className={styles.confirmButton} onClick={() => setReportVisible(true)}>
                    View Report
                  </button>
                </div>
              ) : null}
            </>
          ) : null}
        </section>

        <section
          className={styles.eventColumn}
          aria-label="Event decision panel"
          style={{ position: 'relative' }}
          onMouseEnter={showInteractionHint}
          onMouseMove={showInteractionHint}
          onMouseLeave={() => setInteractionHintVisible(false)}
        >
          <span className={styles.columnTag}>Interaction</span>
          <div className={`${styles.paneHint} ${interactionHintVisible ? styles.paneHintVisible : ''}`}>
            This is where you make your choices
          </div>
          {phase === 'loading' ? (
            <div className={styles.loadingState}>
              <span className={styles.spinner} /> Preparing the next era…
            </div>
          ) : currentEvent ? (
            <>
              <div className={styles.eventMeta}>
                <span>{year} CE</span>
                <span>
                  <StatusWithHint status={imperialStatus} />
                </span>
              </div>

              <article className={`${styles.eventCard} ${styles.eventFade}`} key={currentEvent.id}>
                <header>
                  <h3 className={styles.eventHeading}>{currentEvent.title}</h3>
                </header>
                {currentEvent.choices.some((choice) => {
                  const req = (choice as any).requirements
                  if (!req) return false
                  const unmet =
                    (req.resources != null && stats.resources < req.resources) ||
                    (req.influence != null && stats.influence < req.influence) ||
                    (req.cohesion != null && stats.cohesion < req.cohesion) ||
                    (req.tags && req.tags.some((t: string) => !state.tags.has(t))) ||
                    (req.forbiddenTags && req.forbiddenTags.some((t: string) => state.tags.has(t)))
                  return unmet
                }) ? (
                  <p className={styles.notice}>
                    Some options are locked due to current stats or earlier choices. Hover to see why.
                  </p>
                ) : null}
                <p className={styles.eventNarrative}>{currentEvent.narrative}</p>

                {(phase === 'decision' || phase === 'confirm') && (
                  <div className={styles.choiceList}>
                    {currentEvent.choices.map((choice) => {
                      const isActive = pendingChoice?.id === choice.id
                      const meets = (() => {
                        const req = choice.requirements
                        if (!req) return true
                        if (req.resources != null && stats.resources < req.resources) return false
                        if (req.influence != null && stats.influence < req.influence) return false
                        if (req.cohesion != null && stats.cohesion < req.cohesion) return false
                        const tags = state.tags
                        if (req.tags && req.tags.some((t) => !tags.has(t))) return false
                        if (req.anyTags && !req.anyTags.some((t) => tags.has(t))) return false
                        if (req.forbiddenTags && req.forbiddenTags.some((t) => tags.has(t))) return false
                        return true
                      })()
                      const unmetText = (() => {
                        const req = choice.requirements
                        if (!req) return [] as string[]
                        const out: string[] = []
                        if (req.resources != null && stats.resources < req.resources)
                          out.push(`Resources ≥ ${req.resources}`)
                        if (req.influence != null && stats.influence < req.influence)
                          out.push(`Influence ≥ ${req.influence}`)
                        if (req.cohesion != null && stats.cohesion < req.cohesion)
                          out.push(`Cohesion ≥ ${req.cohesion}`)
                        if (req.tags && req.tags.some((t) => !state.tags.has(t))) out.push('Prior action required')
                        if (req.anyTags && !req.anyTags.some((t) => state.tags.has(t))) out.push('One of several prior actions required')
                        if (req.forbiddenTags && req.forbiddenTags.some((t) => state.tags.has(t)))
                          out.push('Blocked by a prior decision')
                        return out
                      })()
                      const handleClick = () => {
                        if (!meets) return
                        selectChoice(choice)
                      }
                      return (
                        <button
                          type="button"
                          className={`${styles.choiceButton} ${isActive ? styles.choiceButtonActive : ''} ${
                            meets ? '' : styles.choiceLocked
                          }`}
                          key={choice.id}
                          onClick={handleClick}
                          disabled={disableChoices || !meets}
                        >
                          <p className={styles.choiceTitle}>{choice.label}</p>
                          {choice.reflection ? (
                            <p className={styles.choiceHint}>{choice.reflection.prompt}</p>
                          ) : (
                            <p className={styles.choiceHint}>Proceed without reflection prompt.</p>
                          )}
                          {!meets && unmetText.length > 0 ? (
                            <p className={styles.lockNote}>
                              Requires: <span className={styles.lockReqList}>{unmetText.join(' · ')}</span>
                            </p>
                          ) : null}
                        </button>
                      )
                    })}
                  </div>
                )}

                {phase === 'confirm' && pendingChoice ? (
                  <div className={styles.reflectionBlock}>
                    <h4>Reflection</h4>
                    {reflectionPrompt ? (
                      <>
                        <p>{reflectionPrompt.prompt}</p>
                        <div className={styles.reflectionOptions}>
                          {(reflectionOrder ?? reflectionPrompt.options.map((_, i) => i)).map(
                            (origIndex, displayIndex) => (
                              <label key={`${origIndex}-${reflectionPrompt.options[origIndex]}`} className={styles.reflectionOption}>
                                <input
                                  type="radio"
                                  name="reflection-option"
                                  value={displayIndex}
                                  checked={state.pendingReflectionAnswer === origIndex}
                                  onChange={() => setReflectionAnswer(origIndex)}
                                />
                                <span>{reflectionPrompt.options[origIndex]}</span>
                              </label>
                            ),
                          )}
                        </div>
                      </>
                    ) : (
                      <p>This decision does not require a reflection response. Confirm to proceed.</p>
                    )}

                    <button
                      type="button"
                      className={styles.confirmButton}
                      disabled={!canSubmitReflection}
                      onClick={resolveChoice}
                    >
                      Confirm decision
                    </button>
                  </div>
                ) : null}

                {phase === 'resolving' && resolvedOutcome ? (
                  <div className={`${styles.outcomeCard} ${styles.outcomeCardReveal}`}>
                    <strong>Outcome</strong>
                    <p>{resolvedOutcome.description}</p>
                  </div>
                ) : null}

                {phase === 'cooldown' && resolvedOutcome ? (
                  <div className={`${styles.outcomeCard} ${styles.outcomeCardReveal}`}>
                    <strong>Outcome</strong>
                    <p>{resolvedOutcome.description}</p>
                    <p className={styles.cooldownNotice}>
                      Next scenario in {countdownSeconds} second{countdownSeconds === 1 ? '' : 's'}…
                    </p>
                  </div>
                ) : null}
              </article>
            </>
          ) : (
            <div className={styles.loadingState}>No further events available.</div>
          )}
        </section>
      </div>

      <div
        className={styles.insightsContainer}
        onMouseEnter={() => setInsightsOpen(true)}
        // Do not auto-close on mouse leave; user closes via toggle
      >
        <div className={styles.insightsHeader}>
          <button
            type="button"
            className={styles.insightsToggle}
            aria-expanded={insightsOpen}
            onClick={toggleInsights}
          >
            <span className={styles.chevron} aria-hidden="true">{insightsOpen ? '<' : '>'}</span>
            {insightsOpen ? 'Hide Insights & Settings' : 'Show Insights & Settings'}
          </button>
        </div>

        <div
          ref={insightsOuterRef}
          className={styles.insightsCollapsible}
          style={{ height: insightsHeight, opacity: insightsOpen ? 1 : 0 }}
          onTransitionEnd={handleInsightsTransitionEnd}
        >
        <section
          ref={insightsInnerRef as any}
          className={styles.insightsBar}
          aria-label="Session insights and controls"
        >
          <div className={`${styles.insightCard} ${styles.eraCard}`}>
            <header className={styles.insightHeader}>
              <h3>Imperial Briefing</h3>
              <span className={styles.eraBadge}>{eraSummary.label}</span>
            </header>
          <p className={styles.insightCopy}>{eraSummary.briefing}</p>
          <div className={styles.insightMeta}>
            <div>
              <strong>Status</strong>
              <p>{imperialStatus}</p>
            </div>
            <div>
              <strong>Victory Progress</strong>
              <p>{victoryProgress}% of 500 members</p>
            </div>
            <div>
              <strong>Cohesion Watch</strong>
              <p>{cohesionRisk}</p>
            </div>
          </div>
          {lastEvent ? (
            <div className={styles.latestOutcome}>
              <strong>Last Outcome</strong>
              <p>
                {lastEvent.eventTitle} — {lastEvent.choiceLabel}
              </p>
            </div>
          ) : null}
        </div>

        <div className={styles.insightCard}>
          <header className={styles.insightHeader}>
            <h3>Reflection Feed</h3>
            <span className={styles.feedHint}>Latest responses</span>
          </header>
          {recentReflections.length === 0 ? (
            <p className={styles.insightCopy}>
              Reflection prompts will appear here once you commit your first decision.
            </p>
          ) : (
            <ul className={styles.reflectionList}>
              {recentReflections.map((entry) => (
                <li key={entry.timestamp} className={styles.reflectionItem}>
                  <div className={styles.reflectionMeta}>
                    <strong>{entry.eventTitle}</strong>
                    <span>{entry.yearAfter} CE</span>
                  </div>
                  <p className={styles.reflectionPrompt}>{entry.reflectionPrompt}</p>
                  <p className={styles.reflectionAnswer}>
                    {entry.reflectionAnswer ?? 'No response recorded.'}
                    {entry.reflectionCorrect === null ? null : (
                      <span
                        className={`${styles.reflectionBadge} ${
                          entry.reflectionCorrect ? styles.reflectionCorrect : styles.reflectionMiss
                        }`}
                      >
                        {entry.reflectionCorrect ? 'Aligned' : 'Revisit'}
                      </span>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={`${styles.insightCard} ${styles.settingsCard}`}>
          <header className={styles.insightHeader}>
            <h3>Session Settings</h3>
            <span className={styles.feedHint}>Audio &amp; text controls</span>
          </header>

          <div className={styles.settingBlock}>
            <div className={styles.settingRow}>
              <label className={styles.switchLabel}>
                <input type="checkbox" checked={false} disabled />
                <span>Theme music (disabled)</span>
              </label>
              <label className={styles.volumeLabel}>
                <span>Level</span>
                <input type="range" min={0} max={100} value={0} disabled />
              </label>
            </div>

            <div className={styles.settingRow}>
              <label className={styles.switchLabel}>
                <input
                  type="checkbox"
                  checked={effectsEnabled}
                  onChange={(event) => setEffectsEnabled(event.target.checked)}
                />
                <span>Scenario cues</span>
              </label>
              <label className={styles.volumeLabel}>
                <span>Level</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(effectsVolume * 100)}
                  onChange={(event) => setEffectsVolume(Number(event.target.value) / 100)}
                />
              </label>
            </div>
          </div>

          <div className={styles.settingBlock}>
            <span className={styles.textSizeLabel}>Text size</span>
            <div className={styles.textSizeButtons}>
              <button
                type="button"
                className={`${styles.textSizeButton} ${textScale === 1 ? styles.buttonActive : ''}`}
                onClick={() => handleTextScaleChange(1)}
              >
                Standard
              </button>
              <button
                type="button"
                className={`${styles.textSizeButton} ${textScale > 1 ? styles.buttonActive : ''}`}
                onClick={() => handleTextScaleChange(1.18)}
              >
                Large
              </button>
            </div>
          </div>
        </div>
        </section>
        </div>
        {(phase === 'complete' && reportVisible) || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('previewFinal')) ? (
          <div className={styles.reportOverlay} role="dialog" aria-modal="true">
            <div className={styles.reportBackdrop} aria-hidden />
            <div className={styles.reportVignette} aria-hidden />
            <div className={styles.reportCard}>
              <h2 className={styles.finalEpithet}>Extra ecclesiam nulla salus.</h2>
              <p className={styles.reportLead}>
                {ending === 'victory'
                  ? 'Across a long march of years, the community endured. Your leadership balanced growth with unity, stewarded scarce resources, and sustained influence amid shifting powers.'
                  : 'Through trials and shifting winds, cohesion faltered. The community’s thread thinned beyond repair, offering sober guidance for those who lead in fragile times.'}
              </p>
              <h3 className={styles.reportTitle}>Closing Report</h3>
              <div className={styles.reportGrid}>
                <div>
                  <strong>Members</strong>
                  <p>{stats.members}</p>
                </div>
                <div>
                  <strong>Cohesion</strong>
                  <p>{stats.cohesion}</p>
                </div>
                <div>
                  <strong>Resources</strong>
                  <p>{stats.resources}</p>
                </div>
                <div>
                  <strong>Influence</strong>
                  <p>{stats.influence}</p>
                </div>
              </div>
              <p className={styles.reportMeta}>Decisions taken: {log.length}</p>
              <p className={styles.reportSummary}>
                {ending === 'victory'
                  ? 'The work of shepherding bore fruit: a resilient body, a house of worship, and a legacy that outlasts the empire’s fortunes.'
                  : 'The story cautions: numbers and patronage cannot substitute for unity. Future cohorts may yet rebuild from these lessons.'}
              </p>
              <div className={styles.reportActions}>
                <button type="button" className={styles.confirmButton} onClick={generateReportJson}>
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        ) : null}

      </div>
    </main>
  )
}
