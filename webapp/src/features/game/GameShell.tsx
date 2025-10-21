import { useEffect, useMemo, useRef, useState } from 'react'

import { useSoundscape } from '@/features/audio/SoundscapeProvider'
import { useStudentSession } from '@/features/onboarding/OnboardingGate'

import styles from './GameShell.module.css'
import { useGameEngine } from './state/gameEngine'

function eraKeyFromYear(year: number): 'Founding' | 'Persecution' | 'Imperial' | 'Fading' {
  if (year < 150) return 'Founding'
  if (year < 313) return 'Persecution'
  if (year < 411) return 'Imperial'
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

  // Click when scenarios switch (new event appears)
  const prevEventIdRef = useRef<string | null>(null)
  useEffect(() => {
    const id = currentEvent?.id ?? null
    if (id && prevEventIdRef.current && prevEventIdRef.current !== id) {
      playUi()
    }
    if (id) prevEventIdRef.current = id
  }, [currentEvent?.id, playUi])

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

  const sceneImage = currentEvent?.sceneImage ?? '/assets/church_being_built.png'
  const sceneTitle = currentEvent?.sceneTitle ?? 'Basilica Under Construction'
  const sceneCaption =
    currentEvent?.sceneCaption ??
    "Timber scaffolds clutch the nave as masons pause for guidance. Another chapter in the community's story is on the way."

  const disableChoices = phase !== 'decision' && phase !== 'confirm'
  const lastEvent = log.length > 0 ? log[log.length - 1] : null

  const uiEraKey: 'Founding' | 'Persecution' | 'Imperial' | 'Fading' = useMemo(() => {
    const eventEra = currentEvent?.era ?? null
    if (eventEra === 'founding') return 'Founding'
    if (eventEra === 'crisis') return 'Persecution'
    if (eventEra === 'imperial') return year >= 411 ? 'Fading' : 'Imperial'
    // Fallback to year-derived if no event yet
    return eraKeyFromYear(year)
  }, [currentEvent?.era, year])

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

  // Era transition screen control
  const [showEraTransition, setShowEraTransition] = useState(false)
  const lastEraRef = useRef<string | null>(null)
  useEffect(() => {
    const currentUiEra = uiEraKey
    if (lastEraRef.current && lastEraRef.current !== currentUiEra) {
      setShowEraTransition(true)
      const t = window.setTimeout(() => setShowEraTransition(false), 1400)
      return () => window.clearTimeout(t)
    }
    lastEraRef.current = currentUiEra
  }, [uiEraKey])

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
      {showEraTransition ? (
        <div className={styles.eraTransitionOverlay} role="dialog" aria-live="polite">
          <div className={styles.eraTransitionCard}>
            <h3 className={styles.eraTransitionTitle}>{eraSummary.label}</h3>
          </div>
        </div>
      ) : null}
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
              <div className={styles.statCard} key={stat.label}>
                <span className={styles.statLabel}>{stat.label}</span>
                <span className={styles.statValue}>
                  {stat.value}
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

        <section className={styles.sceneColumn} aria-label="Community scene">
          <div className={styles.sceneBackground} style={{ backgroundImage: `url(${sceneImage})` }} />
          <div className={styles.sceneOverlay} />
          <div className={styles.eraOverlay} aria-hidden="true">
            {eraSummary.label}
          </div>
          {showMeanwhile && state.microEventPending ? (
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
          {phase === 'complete' ? (
            <div className={styles.completeCard}>
              <h2 className={styles.completeTitle}>
                {ending === 'victory' ? 'Basilica Dawn' : 'Community Scattered'}
              </h2>
              <p className={styles.completeSummary}>
                {ending === 'victory'
                  ? 'Your community endures across centuries, anchoring a basilica that welcomes generations of disciples.'
                  : 'Cohesion fell below a sustainable threshold. The fragile community disperses, its story a cautionary tale for future shepherds.'}
              </p>
            </div>
          ) : (
            <div className={`${styles.sceneContent} ${styles.fadeIn}`} key={currentEvent?.id ?? phase}>
              <p className={styles.sceneTitle}>{sceneTitle}</p>
              <p className={styles.sceneCaption}>{sceneCaption}</p>
            </div>
          )}
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
            <div className={styles.loadingState}>Preparing the next era…</div>
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
                <p className={styles.eventNarrative}>{currentEvent.narrative}</p>

                {(phase === 'decision' || phase === 'confirm') && (
                  <div className={styles.choiceList}>
                  {currentEvent.choices.map((choice) => {
                    const isActive = pendingChoice?.id === choice.id
                    const handleClick = () => {
                      // UI sounds frozen; only scenario cues play on outcomes
                      selectChoice(choice)
                    }
                    return (
                      <button
                        type="button"
                        className={`${styles.choiceButton} ${isActive ? styles.choiceButtonActive : ''}`}
                        key={choice.id}
                        onClick={handleClick}
                        disabled={disableChoices && !isActive}
                      >
                          <p className={styles.choiceTitle}>{choice.label}</p>
                          {choice.reflection ? (
                            <p className={styles.choiceHint}>{choice.reflection.prompt}</p>
                          ) : (
                            <p className={styles.choiceHint}>Proceed without reflection prompt.</p>
                          )}
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
                          {reflectionPrompt.options.map((option, index) => (
                            <label key={option} className={styles.reflectionOption}>
                              <input
                                type="radio"
                                name="reflection-option"
                                value={index}
                                checked={state.pendingReflectionAnswer === index}
                                onChange={() => setReflectionAnswer(index)}
                              />
                              <span>{option}</span>
                            </label>
                          ))}
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
                  <div className={styles.outcomeCard}>
                    <strong>Outcome</strong>
                    <p>{resolvedOutcome.description}</p>
                  </div>
                ) : null}

                {phase === 'cooldown' && resolvedOutcome ? (
                  <div className={styles.outcomeCard}>
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
      </div>
    </main>
  )
}
