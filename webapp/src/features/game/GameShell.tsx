import { useMemo } from 'react'

import { useStudentSession } from '@/features/onboarding/OnboardingGate'

import styles from './GameShell.module.css'
import { useGameEngine } from './state/gameEngine'

export function GameShell() {
  const session = useStudentSession()
  const {
    state,
    selectChoice,
    setReflectionAnswer,
    resolveChoice,
    reflectionPrompt,
    canSubmitReflection,
    cooldownRemainingMs,
  } = useGameEngine()

  const { stats, year, imperialStatus, currentEvent, pendingChoice, resolvedOutcome, log, phase, ending } =
    state

  const statEntries = useMemo(
    () => [
      { label: 'Members', value: stats.members },
      { label: 'Cohesion', value: `${stats.cohesion}` },
      { label: 'Resources', value: `${stats.resources}` },
      { label: 'Influence', value: `${stats.influence}` },
    ],
    [stats],
  )

  const recentLog = useMemo(() => [...log].reverse().slice(0, 6), [log])

  const countdownSeconds = Math.ceil(cooldownRemainingMs / 1000)

  const sceneImage = currentEvent?.sceneImage ?? '/assets/church_being_built.png'
  const sceneTitle = currentEvent?.sceneTitle ?? 'Basilica Under Construction'
  const sceneCaption =
    currentEvent?.sceneCaption ??
    'Timber scaffolds clutch the nave as masons pause for guidance. Another chapter in the community’s story is on the way.'

  const disableChoices = phase !== 'decision' && phase !== 'confirm'

  return (
    <main className={styles.shell}>
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
              <span className={styles.statValue}>{stat.value}</span>
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
                    return (
                      <button
                        type="button"
                        className={`${styles.choiceButton} ${isActive ? styles.choiceButtonActive : ''}`}
                        key={choice.id}
                        onClick={() => selectChoice(choice)}
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
    </main>
  )
}
