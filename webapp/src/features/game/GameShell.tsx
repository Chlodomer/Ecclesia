import { useEffect, useMemo, useState } from 'react'

import { useSoundscape } from '@/features/audio/SoundscapeProvider'
import { useStudentSession } from '@/features/onboarding/OnboardingGate'

import styles from './GameShell.module.css'
import { useGameEngine } from './state/gameEngine'

export function GameShell() {
  const session = useStudentSession()
  const {
    playEffect,
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
    log,
    phase,
    ending,
  } =
    state

  useEffect(() => {
    if (!resolvedOutcome?.soundEffect) return
    playEffect(resolvedOutcome.soundEffect)
  }, [resolvedOutcome?.id, resolvedOutcome?.soundEffect, playEffect])

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

  const statEntries = useMemo(
    () => {
      const showDelta =
        (phase === 'resolving' || phase === 'cooldown') && resolvedOutcome?.effects != null
      const deltas = showDelta ? resolvedOutcome?.effects ?? {} : {}
      return [
        {
          label: 'Members',
          value: stats.members,
          delta: showDelta ? deltas?.members ?? 0 : null,
        },
        {
          label: 'Cohesion',
          value: stats.cohesion,
          delta: showDelta ? deltas?.cohesion ?? 0 : null,
        },
        {
          label: 'Resources',
          value: stats.resources,
          delta: showDelta ? deltas?.resources ?? 0 : null,
        },
        {
          label: 'Influence',
          value: stats.influence,
          delta: showDelta ? deltas?.influence ?? 0 : null,
        },
      ]
    },
    [stats, phase, resolvedOutcome],
  )

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

  const eraSummary = useMemo(() => {
    if (year < 150) {
      return {
        label: 'Founding Era',
        briefing: 'Missionary journeys, house churches, and fragile alliances define daily ministry.',
      }
    }
    if (year < 250) {
      return {
        label: 'Localized Persecution',
        briefing:
          'Magistrates test loyalty while believers nurture underground networks and mobile liturgies.',
      }
    }
    if (year < 313) {
      return {
        label: 'Anxious Tolerance',
        briefing:
          'Christian influence grows, yet imperial suspicion lingers; diplomacy and prudence are vital.',
      }
    }
    if (year < 380) {
      return {
        label: 'Imperial Favor',
        briefing:
          'Patronage and public worship expand opportunity, but new politics and expectations emerge.',
      }
    }
    return {
      label: 'Provincial Integration',
      briefing:
        'The church now stewards civic life—balancing charity, orthodoxy, and imperial responsibility.',
    }
  }, [year])

  const victoryProgress = Math.min(100, Math.round((stats.members / 500) * 100))
  const cohesionRisk = stats.cohesion <= 30 ? 'At risk of fracture—prioritize unity.' : 'Cohesion stable.'

  return (
    <main className={styles.shell}>
      <div className={styles.primaryGrid}>
        <section className={styles.timelineColumn} aria-label="Community timeline">
          <header className={styles.sessionHeader}>
            <h1>Ecclesia Cohort</h1>
            <span>
              {session ? `${session.fullName} · ${session.email}` : 'Unregistered observer'}
            </span>
            <span>
              {year} CE · {imperialStatus}
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
            <div className={styles.sceneContent}>
              <p className={styles.sceneTitle}>{sceneTitle}</p>
              <p className={styles.sceneCaption}>{sceneCaption}</p>
            </div>
          )}
        </section>

        <section className={styles.eventColumn} aria-label="Event decision panel">
          {phase === 'loading' ? (
            <div className={styles.loadingState}>Preparing the next era…</div>
          ) : currentEvent ? (
            <>
              <div className={styles.eventMeta}>
                <span>{year} CE</span>
                <span>{imperialStatus}</span>
              </div>

              <article className={styles.eventCard}>
                <header>
                  <h3 className={styles.eventHeading}>{currentEvent.title}</h3>
                </header>
                <p className={styles.eventNarrative}>{currentEvent.narrative}</p>

                {(phase === 'decision' || phase === 'confirm') && (
                  <div className={styles.choiceList}>
                  {currentEvent.choices.map((choice) => {
                    const isActive = pendingChoice?.id === choice.id
                    const handleClick = () => {
                      if (pendingChoice?.id !== choice.id) {
                        playEffect('ui')
                      }
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

      <section className={styles.insightsBar} aria-label="Session insights and controls">
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
                <input
                  type="checkbox"
                  checked={themeEnabled}
                  onChange={(event) => setThemeEnabled(event.target.checked)}
                />
                <span>Theme music</span>
              </label>
              <label className={styles.volumeLabel}>
                <span>Level</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(themeVolume * 100)}
                  onChange={(event) => setThemeVolume(Number(event.target.value) / 100)}
                />
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
    </main>
  )
}
