Ecclesia PRD: Onboarding Experience
---

### **Product Requirements Document: First-Time Player Tutorial**
### *Guided Introduction Without Disruption*

**Version:** 1.0
**Date:** January 30, 2025
**Author:** Yaniv Fox
**Status:** Specification
**Parent Documents:** Ecclesia_PRD.md (v1.0), Ecclesia_PRD_3.0.md (v3.0)

---

## 1.0 Executive Summary

### 1.1 Purpose of This Document
This PRD specifies a **60-90 second interactive tutorial** that introduces first-time players to *Ecclesia*'s core mechanics, UI elements, and objectives. The onboarding experience must feel like a natural extension of the game's late antique aesthetic—seamless, unobtrusive, and respectful of the player's time.

### 1.2 Design Philosophy
**"Show, Don't Tell"**
Rather than frontloading static instruction screens, the onboarding guides players *through* their first meaningful interaction with the game. Players learn by doing, with just-in-time contextual guidance that fades into the background once understood.

**Core Principles:**
1. **Non-Blocking:** Players can skip or dismiss at any time
2. **Contextual:** Information appears exactly when it's relevant
3. **Integrated:** Uses the game's existing visual language (overlays, parchment cards, era accents)
4. **Brief:** 60-90 seconds total, with ~15 seconds per step
5. **Persistent Clarity:** Does not interfere with game state or choices

### 1.3 Success Criteria
- ✅ First-time players understand the 4 core UI regions within 30 seconds
- ✅ Players grasp the choice → outcome → consequence loop by their first decision
- ✅ Onboarding can be dismissed at any point without penalty
- ✅ Zero impact on game pacing or existing functionality
- ✅ Visual aesthetic indistinguishable from the main game

---

## 2.0 Onboarding Flow: The Guided First Turn

### 2.1 Entry Trigger
The onboarding sequence begins **immediately after the opening screen dismisses** and before the first event card is fully revealed. It activates only for:
- First-time players (no prior session in localStorage)
- OR players who explicitly request "Show Tutorial" from settings

**Technical Detection:**
```typescript
const showOnboarding =
  !localStorage.getItem('ecclesia:tutorial-completed') ||
  userSettings.forceTutorial === true
```

### 2.2 The Five-Step Sequence

The tutorial is structured as **5 sequential steps**, each highlighting a specific UI region with a semi-transparent overlay and a contextual tooltip. Players advance by clicking "Next" or the highlighted region itself.

---

#### **Step 1: Welcome & Community Stats** (15 seconds)
**Focus Region:** Timeline Column → Stat Cards (Members & Cohesion)

**Visual Treatment:**
- Dim all other UI regions with `background: rgba(0, 0, 0, 0.6)`
- Spotlight the stat card area with a glowing border (`box-shadow: 0 0 20px rgba(201, 93, 46, 0.5)`)
- Display a parchment-styled tooltip anchored to the right of the stats

**Tooltip Content:**
```
╔═══════════════════════════════════════╗
║  YOUR COMMUNITY'S VITAL SIGNS        ║
╠═══════════════════════════════════════╣
║                                       ║
║  👥 MEMBERS                          ║
║  Your community's size. Reach 500    ║
║  to build the basilica and win.      ║
║                                       ║
║  🔗 COHESION                         ║
║  Unity and morale. If this reaches   ║
║  zero, your community collapses.     ║
║                                       ║
║  Watch these closely—every choice    ║
║  will shift both numbers.            ║
║                                       ║
╚═══════════════════════════════════════╝
         [Next: The Timeline →]
```

**Styling:**
```css
.tutorialTooltip {
  background: linear-gradient(135deg, #f9f7f1 0%, #f4f0e6 100%);
  border: 2px solid var(--color-bark);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  font-family: var(--font-serif);
  color: var(--color-text);
  max-width: 360px;
  animation: tooltip-fade-in 420ms ease both;
}

@keyframes tooltip-fade-in {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

---

#### **Step 2: The Historical Context** (12 seconds)
**Focus Region:** Timeline Column → Year & Imperial Status

**Visual Treatment:**
- Spotlight shifts upward to the session header (Year + Imperial Status)
- Tooltip repositions to align with the year display

**Tooltip Content:**
```
╔═══════════════════════════════════════╗
║  THE PASSAGE OF TIME                 ║
╠═══════════════════════════════════════╣
║                                       ║
║  📅 YEAR: Your place in history.     ║
║  The game spans 400 years, from      ║
║  the apostolic era to the fading     ║
║  empire.                             ║
║                                       ║
║  🏛️ IMPERIAL STATUS: Rome's stance  ║
║  toward Christians. This shapes the  ║
║  events you'll face—persecution,     ║
║  tolerance, or patronage.            ║
║                                       ║
╚═══════════════════════════════════════╝
       [Next: Your Choices →]
```

---

#### **Step 3: Event Card & Choices** (18 seconds)
**Focus Region:** Event Column → Event Card + Choice Buttons

**Visual Treatment:**
- Spotlight the entire event column
- Tooltip appears to the left of the event card

**Tooltip Content:**
```
╔═══════════════════════════════════════╗
║  EVERY DECISION SHAPES HISTORY       ║
╠═══════════════════════════════════════╣
║                                       ║
║  Each SCENARIO presents a dilemma    ║
║  drawn from late antique Christian   ║
║  life: heresy, persecution, charity, ║
║  or intrigue.                        ║
║                                       ║
║  Your CHOICES have uncertain         ║
║  outcomes. A bold decision might     ║
║  succeed—or backfire. History is     ║
║  unpredictable.                      ║
║                                       ║
║  Choose wisely. Once you decide,     ║
║  there is no going back.             ║
║                                       ║
╚═══════════════════════════════════════╝
       [Next: The Scene →]
```

---

#### **Step 4: The Living Scene** (10 seconds)
**Focus Region:** Scene Column → Background Image & Era Badge

**Visual Treatment:**
- Spotlight the scene column
- Tooltip appears centered above the scene

**Tooltip Content:**
```
╔═══════════════════════════════════════╗
║  YOUR COMMUNITY'S PLACE OF WORSHIP   ║
╠═══════════════════════════════════════╣
║                                       ║
║  This image evolves as you grow—     ║
║  from a hidden house church to a     ║
║  grand basilica.                     ║
║                                       ║
║  The ERA BADGE shows your current    ║
║  historical period. Each era brings  ║
║  new challenges and opportunities.   ║
║                                       ║
╚═══════════════════════════════════════╝
       [Next: The Timeline →]
```

---

#### **Step 5: The Timeline & Victory Path** (15 seconds)
**Focus Region:** Timeline Column → Recent Log

**Visual Treatment:**
- Spotlight returns to the timeline column, focusing on the log section
- Tooltip appears to the right

**Tooltip Content:**
```
╔═══════════════════════════════════════╗
║  YOUR JOURNEY RECORDED               ║
╠═══════════════════════════════════════╣
║                                       ║
║  Every event you face is logged      ║
║  here, creating a chronicle of       ║
║  your community's story.             ║
║                                       ║
║  YOUR GOAL:                          ║
║  • Reach 500 Members                 ║
║  • Keep Cohesion above 0             ║
║  • Build the basilica                ║
║                                       ║
║  Ready to begin? The choice is       ║
║  yours.                              ║
║                                       ║
╚═══════════════════════════════════════╝
          [Begin Game →]
```

---

### 2.3 Interaction Model

**Advancing Through Steps:**
- Primary: Click "Next" button in tooltip
- Secondary: Click the highlighted region itself
- Skip All: Press `Esc` key at any time

**Progress Indicator:**
A subtle dot navigation appears at the bottom of each tooltip:
```
  ● ○ ○ ○ ○   (Step 1 of 5)
  ○ ● ○ ○ ○   (Step 2 of 5)
```

**Completion:**
Once Step 5 is completed, the overlay fades out over 600ms, and normal gameplay begins. The completion is recorded:
```typescript
localStorage.setItem('ecclesia:tutorial-completed', 'true')
```

---

## 3.0 Visual Design Specifications

### 3.1 Spotlight Overlay System

**Dimming Layer:**
```css
.tutorialOverlay {
  position: fixed;
  inset: 0;
  z-index: 900;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  animation: overlay-fade-in 420ms ease both;
  pointer-events: none;
}

.tutorialOverlay.interactive {
  pointer-events: auto;
}
```

**Spotlight Region:**
```css
.tutorialSpotlight {
  position: absolute;
  border-radius: var(--radius-lg);
  box-shadow:
    0 0 0 4px rgba(201, 93, 46, 0.4),
    0 0 40px 20px rgba(201, 93, 46, 0.2),
    inset 0 0 0 2px rgba(255, 255, 255, 0.3);
  pointer-events: auto;
  transition: all 600ms cubic-bezier(0.4, 0, 0.2, 1);
  animation: spotlight-pulse 2.5s ease-in-out infinite;
}

@keyframes spotlight-pulse {
  0%, 100% {
    box-shadow:
      0 0 0 4px rgba(201, 93, 46, 0.4),
      0 0 40px 20px rgba(201, 93, 46, 0.2),
      inset 0 0 0 2px rgba(255, 255, 255, 0.3);
  }
  50% {
    box-shadow:
      0 0 0 4px rgba(201, 93, 46, 0.6),
      0 0 60px 30px rgba(201, 93, 46, 0.3),
      inset 0 0 0 2px rgba(255, 255, 255, 0.4);
  }
}
```

### 3.2 Tooltip Positioning

**Dynamic Anchoring:**
Tooltips position themselves based on available screen space:
- Default: 24px offset from highlighted region
- Fallback: Centered if screen width < 1200px

**Arrow Indicator:**
A small parchment-colored arrow points from the tooltip to the highlighted region:
```css
.tutorialTooltip::after {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
  /* Arrow direction and size calculated dynamically based on position */
}
```

### 3.3 Typography & Content Style

**Tooltip Headings:**
```css
.tutorialTooltip h3 {
  font-family: var(--font-display);
  font-size: 0.9rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-bark);
  margin: 0 0 var(--space-sm) 0;
  border-bottom: 1px solid rgba(111, 79, 54, 0.2);
  padding-bottom: var(--space-xs);
}
```

**Body Text:**
```css
.tutorialTooltip p {
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0 0 var(--space-sm) 0;
  color: var(--color-text);
}

.tutorialTooltip p:last-of-type {
  margin-bottom: 0;
}
```

**Emphasis (Stats, Key Terms):**
```css
.tutorialTooltip strong {
  color: var(--color-bark);
  font-weight: 600;
  letter-spacing: 0.04em;
}
```

---

## 4.0 Technical Implementation

### 4.1 State Management

**Tutorial State Hook:**
```typescript
type TutorialStep = 1 | 2 | 3 | 4 | 5 | null

function useTutorialState() {
  const [step, setStep] = useState<TutorialStep>(() => {
    if (localStorage.getItem('ecclesia:tutorial-completed')) return null
    return 1
  })

  const advance = () => {
    if (step === null) return
    if (step === 5) {
      setStep(null)
      localStorage.setItem('ecclesia:tutorial-completed', 'true')
      return
    }
    setStep((step + 1) as TutorialStep)
  }

  const skip = () => {
    setStep(null)
    localStorage.setItem('ecclesia:tutorial-completed', 'true')
  }

  return { step, advance, skip }
}
```

### 4.2 Spotlight Region Calculation

**Automatic Bounding Box Detection:**
```typescript
function getSpotlightBounds(step: TutorialStep): DOMRect | null {
  const selectors: Record<TutorialStep, string> = {
    1: '.timelineStats',
    2: '.sessionHeader',
    3: '.eventColumn',
    4: '.sceneColumn',
    5: '.timelineList',
  }

  const selector = step !== null ? selectors[step] : null
  if (!selector) return null

  const element = document.querySelector(selector)
  return element?.getBoundingClientRect() ?? null
}
```

### 4.3 Accessibility Considerations

**Keyboard Navigation:**
- `Tab`: Focus the "Next" button
- `Enter` / `Space`: Advance to next step
- `Esc`: Skip tutorial entirely

**Screen Reader Support:**
```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="tutorial-title"
  aria-describedby="tutorial-content"
>
  <div id="tutorial-title" className="sr-only">
    Game Tutorial: Step {step} of 5
  </div>
  <div id="tutorial-content">
    {/* Tooltip content */}
  </div>
</div>
```

**Reduced Motion:**
```css
@media (prefers-reduced-motion: reduce) {
  .tutorialOverlay,
  .tutorialTooltip,
  .tutorialSpotlight {
    animation: none !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 5.0 Integration with Existing Game Flow

### 5.1 Minimal Disruption Strategy

**Game Engine Pausing:**
The tutorial does NOT pause the game engine or alter game state. Instead:
- The first event card is rendered but **choices are disabled** during Steps 1-4
- Once Step 5 completes, choices become interactive
- The cooldown timer does not start until the tutorial is dismissed

**Visual Integration:**
- Tutorial overlays render in a separate React portal (`z-index: 900`)
- Game UI remains fully rendered beneath the overlay (no unmounting)
- Scene transitions and animations continue normally in the background

### 5.2 Re-Accessing the Tutorial

**Settings Panel Option:**
```tsx
<label>
  <input type="checkbox" checked={showTutorial} onChange={toggleTutorial} />
  Show tutorial on next game
</label>
```

**Manual Trigger:**
A "Help" button in the game header opens a condensed version of the tutorial as a dismissible overlay (without forced step-by-step progression).

---

## 6.0 Copy: Full Tooltip Text

### Step 1: Community Stats
**Heading:** YOUR COMMUNITY'S VITAL SIGNS

**Body:**
👥 **MEMBERS**
Your community's size. Reach **500** to build the basilica and win.

🔗 **COHESION**
Unity and morale. If this reaches **zero**, your community collapses.

Watch these closely—every choice will shift both numbers.

---

### Step 2: Historical Context
**Heading:** THE PASSAGE OF TIME

**Body:**
📅 **YEAR:** Your place in history. The game spans 400 years, from the apostolic era to the fading empire.

🏛️ **IMPERIAL STATUS:** Rome's stance toward Christians. This shapes the events you'll face—persecution, tolerance, or patronage.

---

### Step 3: Event Card & Choices
**Heading:** EVERY DECISION SHAPES HISTORY

**Body:**
Each **SCENARIO** presents a dilemma drawn from late antique Christian life: heresy, persecution, charity, or intrigue.

Your **CHOICES** have uncertain outcomes. A bold decision might succeed—or backfire. History is unpredictable.

Choose wisely. Once you decide, there is no going back.

---

### Step 4: The Living Scene
**Heading:** YOUR COMMUNITY'S PLACE OF WORSHIP

**Body:**
This image evolves as you grow—from a hidden house church to a grand basilica.

The **ERA BADGE** shows your current historical period. Each era brings new challenges and opportunities.

---

### Step 5: The Timeline & Victory Path
**Heading:** YOUR JOURNEY RECORDED

**Body:**
Every event you face is logged here, creating a chronicle of your community's story.

**YOUR GOAL:**
- Reach **500 Members**
- Keep **Cohesion** above 0
- Build the **basilica**

Ready to begin? The choice is yours.

---

## 7.0 Alternative Onboarding: Quick Reference Card

For players who skip the tutorial, a **persistent help icon** (❓) appears in the top-right corner. Clicking it reveals a condensed "Quick Reference" overlay:

```
╔════════════════════════════════════════════════════╗
║  ECCLESIA: QUICK REFERENCE                        ║
╠════════════════════════════════════════════════════╣
║                                                    ║
║  GOAL: Reach 500 Members + Build Basilica         ║
║  LOSE: Cohesion drops to 0                        ║
║                                                    ║
║  👥 Members: Community size (primary score)       ║
║  🔗 Cohesion: Unity & morale (health bar)         ║
║  📅 Year: Your place in history                   ║
║  🏛️ Imperial Status: Rome's stance on Christians  ║
║                                                    ║
║  ⚠️ Choices have uncertain outcomes—weigh risks! ║
║                                                    ║
╚════════════════════════════════════════════════════╝
```

---

## 8.0 Testing & Success Metrics

### 8.1 Usability Testing Checklist

**Clarity:**
- [ ] 9/10 first-time players correctly identify Members vs. Cohesion after Step 1
- [ ] 8/10 players understand win/loss conditions after Step 5
- [ ] Players can articulate the "choice → outcome → consequence" loop

**Pacing:**
- [ ] Tutorial completes in 60-90 seconds for engaged players
- [ ] No player reports feeling "stuck" or "lost" during tutorial
- [ ] Skip rate < 20% (indicating tutorial is valuable, not annoying)

**Integration:**
- [ ] Tutorial does not interfere with game state or first event display
- [ ] Visual aesthetic feels seamless (players don't perceive it as "external" UI)
- [ ] No bugs when skipping mid-sequence

### 8.2 Post-Launch Adjustments

**Metrics to Monitor:**
- Tutorial completion rate (target: 80%+)
- Skip rate by step (if Step 3+ has high skip rate, content may be redundant)
- First-game failure rate (if > 40%, tutorial may not be teaching effectively)

**Iteration Plan:**
- If skip rate > 30%, reduce to 3 steps (Stats, Choices, Goal)
- If completion rate < 70%, add subtle animations to draw attention
- If failure rate remains high, add a "Learn More" link to expanded guide

---

## 9.0 Implementation Timeline

| Phase | Task | Duration | Owner |
|-------|------|----------|-------|
| **Phase 1** | Copy finalization & review | 2 hours | Product |
| **Phase 2** | CSS styling (tooltips, overlays, spotlights) | 3 hours | Frontend |
| **Phase 3** | React components (`TutorialOverlay`, `TutorialTooltip`) | 4 hours | Frontend |
| **Phase 4** | State management hook & spotlight calculations | 2 hours | Frontend |
| **Phase 5** | Integration with GameShell & testing | 3 hours | Full Stack |
| **Phase 6** | Accessibility audit (keyboard nav, screen readers) | 2 hours | Frontend |
| **Phase 7** | Playtesting & iteration | 4 hours | Team |

**Total Estimated Time:** 20 hours (~2.5 days for one developer)

---

## 10.0 Conclusion

### 10.1 Summary

This onboarding PRD specifies a **5-step, 60-90 second interactive tutorial** that:
1. Introduces core UI regions (stats, timeline, choices, scene)
2. Explains win/loss conditions clearly
3. Uses the game's existing visual language (parchment overlays, era accents, fade animations)
4. Can be skipped or dismissed without penalty
5. Does not disrupt game pacing or functionality

### 10.2 Design Rationale

Rather than frontloading a static "how to play" screen, this onboarding **embeds guidance into the first turn**. Players learn by seeing the actual game interface, with just-in-time contextual help that fades into the background once understood.

The design respects the game's educational mission: players are students engaging with historical material, not children who need hand-holding. The tutorial is **concise, dignified, and skippable**—perfectly aligned with *Ecclesia*'s tone.

---

**Document Status:** Ready for implementation
**Next Steps:** Copy review → CSS mockups → React component build → Playtesting

---

*This document extends Ecclesia_PRD.md (v1.0) and Ecclesia_PRD_3.0.md and should be read alongside the original design specifications.*
