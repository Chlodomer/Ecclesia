Ecclesia PRD 2.0
---

### **Product Requirements Document 2.0: Dynamic Gameplay Systems**
### *Strategic Depth Without Complexity*

**Version:** 2.0
**Date:** October 21, 2025
**Author:** Yaniv Fox
**Status:** Design Specification
**Parent Document:** Ecclesia_PRD.md (v1.0)

---

## 1.0 Executive Summary

### 1.1 Purpose of This Document
This PRD extends the original *Ecclesia: A Community's Story* design (v1.0) by addressing player feedback that the core gameplay loop feels static. While the educational narrative framework and 30-40 minute session duration remain unchanged, we introduce three complementary systems that create strategic depth, long-term consequences, and dynamic rhythm without adding cognitive load or extending play time.

### 1.2 Design Philosophy
The original PRD prioritizes **narrative immersion over complex resource management**. PRD 2.0 maintains this philosophy by making existing systems (Resources, Influence) feel meaningful rather than adding new mechanics. These enhancements transform the game from a linear card-reading experience into a dynamic strategic narrative where:

1. **Past choices echo forward** (Tags & Carry-Over Effects)
2. **Strategic planning matters** (Resource & Influence Gates)
3. **The world feels alive between decisions** (Micro-Events)

### 1.3 Target Audience & Educational Impact
- **Unchanged**: University/high school students studying Late Antiquity
- **Enhanced Learning Goals**:
  - Understanding scarcity and political capital in historical decision-making
  - Recognizing long-term consequences of theological/political choices
  - Appreciating the unpredictable, dynamic nature of historical processes

---

## 2.0 System Overview

### 2.1 The Three Pillars

| System | Primary Goal | Gameplay Impact | Educational Value |
|--------|--------------|-----------------|-------------------|
| **Resource & Influence Gates** | Make secondary stats strategically meaningful | Some choices require thresholds (e.g., "Borrow funds" needs Influence ≥40) | Models political capital, material scarcity |
| **Persistent Tags** | Create narrative continuity across events | Past decisions unlock/lock future events and apply ongoing effects | Shows historical path-dependency |
| **Micro-Events** | Fill cooldown periods with dynamic flavor | Random short events during 6.5s cooldown add surprise | Illustrates unpredictable historical forces |

### 2.2 Integration with Existing Systems
These systems layer onto the existing game engine without disrupting core mechanics:

```typescript
// EXISTING (unchanged)
type GameStats = {
  members: number      // Primary win condition metric
  cohesion: number     // Primary loss condition metric (0-100)
  resources: number    // Currently cosmetic (0-100)
  influence: number    // Currently cosmetic (0-100)
}

// NEW (additions)
type GameEngineState = {
  // ... existing fields
  tags: Set<string>                    // Persistent tags from past choices
  permanentEffects: PermanentEffect[]  // Ongoing stat modifiers
  microEventQueue: MicroEvent[]        // Queued micro-events for cooldown
}
```

---

## 3.0 System 1: Resource & Influence Gates

### 3.1 Core Concept
**Problem**: Resources (0-100) and Influence (0-100) currently fluctuate but don't affect decision availability. Players ignore these stats.

**Solution**: Certain choices require minimum thresholds. If requirements aren't met, the choice is **visible but locked** with an explanation.

### 3.2 Mechanical Specification

#### 3.2.1 Data Structure Extension
```typescript
type EventChoice = {
  id: string
  label: string
  reflection: ReflectionPrompt | null
  outcomes: WeightedOption<EventOutcome>[]

  // NEW: Optional requirements
  requirements?: {
    resources?: number    // Minimum resources (0-100)
    influence?: number    // Minimum influence (0-100)
    tags?: string[]       // Required tags from past events
    forbiddenTags?: string[]  // Blocked if these tags exist
  }
}
```

#### 3.2.2 Threshold Guidelines
| Stat Range | Threshold Tier | Use Cases |
|------------|----------------|-----------|
| 20-30 | Low | Basic charity, minor construction |
| 40-50 | Medium | Political negotiation, significant building projects |
| 60-70 | High | Imperial petitions, major theological statements |
| 80+ | Elite | Rare, high-stakes options (synods, relic acquisition) |

#### 3.2.3 UI/UX Specification

**Locked Choice Appearance**:
```
┌─────────────────────────────────────────────────┐
│ 🔒 Borrow funds and accelerate construction    │ [GRAYED OUT]
│                                                  │
│ Requires: Influence ≥40 (Current: 28)           │ [RED TEXT]
│                                                  │
│ "Creditors demand political assurances before   │
│  extending loans. Build your reputation first." │ [FLAVOR TEXT]
└─────────────────────────────────────────────────┘
```

**Player Feedback Messages**:
- "Build influence with local magistrates before attempting this."
- "Your depleted resources prevent this option. Focus on charity to replenish stores."
- "This path requires the trust earned from sheltering refugees previously."

### 3.3 Application to Existing Events

#### 3.3.1 Founding Era (112-160 AD)
**Event: "Who Joins the Table?" (Agape Feast)**
- Choice A: "Keep celebration private" → No requirements
- Choice B: "Accept merchant offer and bless feast openly" → **Requires: Influence ≥25**
  - *Rationale*: Public religious gatherings need social standing to avoid magistrate interference

**Event: "Torchlit Vigil" (Pentecost Procession)**
- Choice A: "Approve full public procession" → **Requires: Cohesion ≥60, Influence ≥30**
  - *Rationale*: Risky public witness needs unified community and civic tolerance
- Choice B: "Keep vigil inside courtyard" → No requirements
- Choice C: "Split the assembly" → **Requires: Resources ≥25**
  - *Rationale*: Dual events need logistics (torches, guards)

#### 3.3.2 Crisis Era (160-313 AD)
**Event: "Summoned Before the Magistrate"**
- Choice A: "Appear together and defend" → **Requires: Cohesion ≥50**
  - *Rationale*: United testimony needs internal trust
- Choice B: "Send deacon delegation with gifts" → **Requires: Resources ≥30**
  - *Rationale*: Oil jars and goods cost material wealth
- Choice C: "Scatter and hide" → No requirements (desperation move)

**Event: "Fever in the Forum" (Plague)**
- Choice A: "Convert hall into infirmary" → **Requires: Resources ≥35**
  - *Rationale*: Medical supplies, volunteers need material base
- Choice B: "Seal hall and quarantine" → No requirements
- Choice C: "Dispatch herbalists citywide" → **Requires: Resources ≥40, Influence ≥35**
  - *Rationale*: Expensive, needs civic trust to avoid sorcery accusations

**Event: "Sanctuary in Flames"**
- Choice A: "Rapid rebuild with artisans" → **Requires: Resources ≥40**
  - *Rationale*: Stone, timber, labor costs
- Choice B: "Petition governor for protection" → **Requires: Influence ≥45**
  - *Rationale*: Imperial appeals need political capital
- Choice C: "Scatter into house churches" → No requirements

#### 3.3.3 Imperial Era (313-450 AD)
**Event: "Bacaudae Uprising" (Peasant Rebellion)**
- Choice A: "Condemn uprising and champion Rome" → **Requires: Influence ≥35**
  - *Rationale*: Public political stance needs established voice
- Choice B: "Fund relief for all victims" → **Requires: Resources ≥50**
  - *Rationale*: Expensive universal charity
- Choice C: "Shelter families quietly" → No requirements

**Event: "Queues at the Granary" (Famine)**
- Choice A: "Restrict to baptized citizens" → No requirements
- Choice B: "Feed all who come until stores dry" → **Requires: Resources ≥45**
  - *Rationale*: Open table needs significant grain reserves
- Choice C: "Create shared ledger with curiales" → **Requires: Influence ≥40**
  - *Rationale*: Civic partnership needs political legitimacy

**Event: "Stone and Song" (Basilica Construction)**
- Choice A: "Borrow funds to accelerate" → **Requires: Influence ≥50, Resources ≥30**
  - *Rationale*: Creditors need assurance, some capital required
- Choice B: "Advance at community's pace" → **Requires: Cohesion ≥55**
  - *Rationale*: Volunteer labor needs sustained morale
- Choice C: "Pause construction for schools" → **Requires: Resources ≥35**
  - *Rationale*: Redirecting funds still costs money

### 3.4 Strategic Gameplay Impact

#### 3.4.1 Player Decision Framework (Before)
```
EVENT → "Which choice feels right narratively?" → SELECT → OUTCOME
```

#### 3.4.2 Player Decision Framework (After)
```
EVENT → Check stat thresholds
      → "Can I afford this choice?"
      → "Should I save resources for later?"
      → Weigh risk vs. stat management
      → SELECT (from available options)
      → OUTCOME
```

#### 3.4.3 Educational Alignment
**Historical Concept**: Political capital and material resources constrained early Christian communities.
- Bishops couldn't petition emperors without established influence
- Charitable works required functioning supply networks
- Public witness risked persecution without civic standing

**Student Learning**: "Why can't I just choose the 'best' option?" → Understanding historical constraints and strategic sequencing.

---

## 4.0 System 2: Persistent Tags & Carry-Over Effects

### 4.1 Core Concept
**Problem**: Every event exists in a vacuum. Sheltering refugees, excommunicating heretics, or building infirmaries has no lasting impact beyond immediate stat changes.

**Solution**: Choices apply **tags** (string identifiers) that:
1. Unlock future events (narrative branching)
2. Lock certain events (path exclusivity)
3. Apply permanent ongoing effects (e.g., "+2 cohesion per turn from community memory")

### 4.2 Mechanical Specification

#### 4.2.1 Tag Categories
| Category | Purpose | Example Tags |
|----------|---------|--------------|
| **Theological** | Track doctrinal stances | `orthodox-strict`, `heterodox-tolerant`, `gnostic-compromised` |
| **Political** | Track civic relationships | `imperial-ally`, `imperial-fugitive`, `patron-elite`, `patron-poor` |
| **Institutional** | Track buildings/programs | `has-infirmary`, `has-school`, `has-basilica-foundation` |
| **Reputation** | Track public perception | `merciful-reputation`, `coward-reputation`, `zealot-reputation` |
| **Crisis Memory** | Track past traumas | `survived-plague`, `survived-arson`, `survived-schism` |

#### 4.2.2 Data Structures
```typescript
type EventOutcome = {
  id: string
  description: string
  effects: StatDelta
  yearAdvance: number
  soundEffect?: SoundCue

  // NEW: Tag and permanent effect system
  tagsApplied?: string[]        // Tags added on this outcome
  tagsRemoved?: string[]        // Tags removed (e.g., "lost-refuge" removes "has-refuge")
  permanentEffect?: PermanentEffect  // Ongoing stat modifier
}

type PermanentEffect = {
  id: string
  label: string                // e.g., "Infirmary Memorial"
  description: string          // Flavor text shown in UI
  statModifier: StatDelta      // Applied every turn/event
  duration?: 'permanent' | { turns: number }  // How long it lasts
}

type GameEngineState = {
  // ... existing fields
  tags: Set<string>                    // All active tags
  permanentEffects: PermanentEffect[]  // All active ongoing effects
}
```

#### 4.2.3 Tag Application Example
```typescript
// Event: "Fever in the Forum" → Choice A: "Convert hall into infirmary"
{
  id: 'plague-infirmary-a',
  description: 'Deacons wash wounds and bury the dead. Some fall ill, yet city folk marvel at your mercy.',
  effects: { cohesion: 6, members: 8, resources: -10 },
  yearAdvance: 3,
  soundEffect: 'violence',

  // NEW
  tagsApplied: ['has-infirmary', 'merciful-reputation'],
  permanentEffect: {
    id: 'infirmary-memorial',
    label: 'Infirmary Legacy',
    description: 'Citizens remember your charity during the plague.',
    statModifier: { cohesion: 2 },  // +2 cohesion every turn
    duration: 'permanent'
  }
}
```

### 4.3 Tag-Driven Event Unlocks

#### 4.3.1 New Events Unlocked by Tags

**EVENT: "Grateful Families Return"** (Imperial Era, 330+ AD)
*Requires Tag*: `merciful-reputation` (from plague infirmary or refugee shelter)
```
NARRATIVE: "Families you sheltered during the crisis return, now prosperous
merchants. They offer to fund a new wing of your church."

CHOICE A: Accept their patronage
  → OUTCOME: +20 resources, +6 members, apply tag 'patron-merchant-class'

CHOICE B: Thank them but maintain independence
  → OUTCOME: +8 cohesion, apply tag 'independent-church'
```

---

**EVENT: "Marcus's Rival Church"** (Crisis Era, 180+ AD)
*Requires Tag*: `gnostic-excommunicated` (from harsh response to Gnostic Poet)
```
NARRATIVE: "Marcus has founded a rival community downriver, drawing away
artisans with his dualist hymns. Families ask whether to maintain contact."

CHOICE A: Forbid all interaction with the schismatics
  → OUTCOME: -15 members, +10 cohesion, apply tag 'sectarian-hardline'

CHOICE B: Allow social ties but preach against their doctrine
  → OUTCOME: -8 cohesion, +5 influence (seen as tolerant by magistrates)
```

---

**EVENT: "Imperial Auditors Visit the Infirmary"** (Imperial Era, 325+ AD)
*Requires Tag*: `has-infirmary`
```
NARRATIVE: "Constantine's agents inspect your charitable works. They ask
whether your institution will accept imperial funding in exchange for
quarterly reports."

CHOICE A: Accept funding with oversight
  → OUTCOME: +30 resources, -6 cohesion, apply tag 'imperial-partner'

CHOICE B: Decline to preserve autonomy
  → OUTCOME: +12 cohesion, apply tag 'independent-church'
```

---

**EVENT: "The Widow's Bequest"** (All Eras, 150+ AD)
*Requires Tag*: `merciful-reputation` OR `patron-poor`
```
NARRATIVE: "A wealthy widow, moved by your care for the destitute, bequeaths
her villa to the church upon her death. Distant relatives contest the will."

CHOICE A: Fight the legal claim with hired rhetoricians
  → OUTCOME (60%): +40 resources, -10 influence (seen as greedy)
  → OUTCOME (40%): -15 resources (legal fees), -5 cohesion

CHOICE B: Negotiate a settlement with the family
  → OUTCOME: +20 resources, +5 influence, apply tag 'legal-compromise'

CHOICE C: Decline the bequest to avoid scandal
  → OUTCOME: +15 cohesion, apply tag 'ascetic-reputation'
```

#### 4.3.2 Events Locked by Tags

**EVENT: "Petition the Governor"** (Crisis Era)
*Forbidden Tag*: `imperial-fugitive`
- If the tag exists, this event never appears in the deck
- Players who fled persecution cannot later appeal to Rome

**EVENT: "Synod of Nicaea Invitation"** (Imperial Era, 325 AD)
*Forbidden Tag*: `gnostic-compromised`
- Heterodox churches aren't invited to imperial councils

### 4.4 Permanent Effects Examples

| Effect ID | Label | Trigger Event | Stat Modifier | Duration |
|-----------|-------|---------------|---------------|----------|
| `infirmary-legacy` | Infirmary Memorial | Built infirmary during plague | +2 cohesion | Permanent |
| `refugee-bonds` | Refugee Gratitude | Sheltered Bacaudae families | +1 members every 3 turns | Permanent |
| `schism-scar` | Memory of Division | Failed to prevent schism | -3 cohesion | 5 events |
| `imperial-subsidy` | Constantine's Patronage | Accepted imperial funding | +5 resources | Until 400 AD |
| `martyr-shrine` | Martyr's Witness | Built shrine to executed presbyter | +4 cohesion, +2 influence | Permanent |
| `orphan-school` | Charity School | Funded education for poor | +3 members every 4 turns | Permanent |

### 4.5 UI/UX Display

#### 4.5.1 Active Tags Panel
**Location**: Bottom of "Context" column (timeline view)
```
┌─────────────────────────────────────┐
│ COMMUNITY MEMORY                     │
├─────────────────────────────────────┤
│ 🏥 Infirmary Legacy                 │
│    → +2 Cohesion ongoing            │
│                                      │
│ 🤝 Merciful Reputation              │
│    → Unlocks gratitude events       │
│                                      │
│ ⛪ Basilica Foundation              │
│    → Progress toward victory        │
└─────────────────────────────────────┘
```

#### 4.5.2 Outcome Text Enhancement
```
BEFORE: "The gathering deepens trust. A few curious onlookers drift away,
         but the flock feels anchored."
         [+8 cohesion, -3 members]

AFTER:  "The gathering deepens trust. A few curious onlookers drift away,
         but the flock feels anchored. Elders establish a tradition of
         private Easter vigils that will sustain the community for decades."
         [+8 cohesion, -3 members]
         [PERMANENT: +2 cohesion ongoing (Vigil Tradition)]
         [TAG: 'orthodox-formation']
```

### 4.6 Educational Impact

**Historical Concept**: Path-dependency in institutional development
- Early Christian communities diverged based on crisis responses (martyrdom vs. apostasy)
- Theological stances (rigorist vs. laxist) shaped century-long trajectories
- Material choices (accepting patronage) created lasting power structures

**Student Learning**:
- "Why does the game remember my plague response 50 years later?"
- Understanding how historical institutions encode past decisions
- Recognizing long-term consequences of theological/political choices

---

## 5.0 System 3: Micro-Events During Cooldown

### 5.1 Core Concept
**Problem**: The 6.5-second cooldown between events feels like dead time. Players wait passively for the next scenario.

**Solution**: During cooldown, a brief **micro-event** appears—1-2 sentences of historical flavor with a small stat change. These simulate the unpredictable background forces of history.

### 5.2 Mechanical Specification

#### 5.2.1 Data Structure
```typescript
type MicroEvent = {
  id: string
  text: string                    // 1-2 sentence narrative snippet
  effects: StatDelta              // Small stat changes (-5 to +5)
  era?: 'founding' | 'crisis' | 'imperial' | 'visigothic'  // Era restriction
  weight: number                  // Probability weight
  requiresTags?: string[]         // Only appears if tags present
  forbiddenTags?: string[]        // Never appears if tags present
}
```

#### 5.2.2 Timing & Frequency
- **When**: Appears 2 seconds into the 6.5s cooldown
- **Duration**: Visible for 4 seconds, then fades
- **Frequency**: 70% chance per cooldown (30% chance of silence for pacing)

#### 5.2.3 Balance Guidelines
| Impact Level | Stat Change Range | Use Cases |
|--------------|-------------------|-----------|
| **Trivial** | ±1-2 | Weather, minor social interactions |
| **Small** | ±3-4 | Converts, minor crises, rumors |
| **Notable** | ±5 | Rare windfalls, unexpected setbacks |

**Hard Cap**: Micro-events NEVER change stats by more than ±5 to prevent randomness from dominating strategy.

### 5.3 Micro-Event Library

#### 5.3.1 Founding Era (112-160 AD)

**Positive Micro-Events**
```javascript
{
  id: 'founding-convert-merchant',
  text: 'A grain merchant, moved by your baptism ceremony, joins the community.',
  effects: { members: 2, resources: 3 },
  era: 'founding',
  weight: 5
}

{
  id: 'founding-artisan-donation',
  text: 'A grateful artisan repairs the baptistery roof at no cost.',
  effects: { resources: 4 },
  era: 'founding',
  weight: 4
}

{
  id: 'founding-synagogue-dialogue',
  text: 'A rabbi invites your presbyter to debate scripture, fostering mutual respect.',
  effects: { influence: 3 },
  era: 'founding',
  weight: 3
}

{
  id: 'founding-wedding-celebrated',
  text: 'Two catechumens marry in the church, drawing curious neighbors.',
  effects: { members: 2, cohesion: 2 },
  era: 'founding',
  weight: 5
}
```

**Neutral/Flavor Micro-Events**
```javascript
{
  id: 'founding-pagan-festival',
  text: 'The city celebrates Saturnalia. Your community quietly fasts during the revelry.',
  effects: {},
  era: 'founding',
  weight: 3
}

{
  id: 'founding-traveling-apostle',
  text: 'A traveling apostle from Massilia passes through, sharing news from distant churches.',
  effects: { cohesion: 1 },
  era: 'founding',
  weight: 4
}
```

**Negative Micro-Events**
```javascript
{
  id: 'founding-rumor-atheism',
  text: 'A tavern-keeper spreads rumors that Christians are atheists who refuse the gods.',
  effects: { influence: -3 },
  era: 'founding',
  weight: 4
}

{
  id: 'founding-family-apostasy',
  text: 'A prominent family quietly returns to temple worship, unsettled by persecution rumors.',
  effects: { members: -2, cohesion: -2 },
  era: 'founding',
  weight: 3
}

{
  id: 'founding-tax-collector-visit',
  text: 'An imperial tax collector scrutinizes the community's property records.',
  effects: { resources: -3 },
  era: 'founding',
  weight: 4
}
```

#### 5.3.2 Crisis Era (160-313 AD)

**Positive Micro-Events**
```javascript
{
  id: 'crisis-underground-network',
  text: 'A courier arrives from Lyon with letters of encouragement and a small purse.',
  effects: { cohesion: 3, resources: 4 },
  era: 'crisis',
  weight: 4
}

{
  id: 'crisis-magistrate-sympathizer',
  text: 'A sympathetic magistrate quietly warns your deacons of an upcoming raid.',
  effects: { influence: 4 },
  era: 'crisis',
  weight: 3
}

{
  id: 'crisis-martyr-testimony',
  text: 'News spreads of a presbyter's courageous testimony under torture. Catechumens weep and pray.',
  effects: { cohesion: 4 },
  era: 'crisis',
  weight: 5
}
```

**Negative Micro-Events**
```javascript
{
  id: 'crisis-informant-betrayal',
  text: 'An informant betrays a house church location. Families flee to the countryside.',
  effects: { members: -4, cohesion: -3 },
  era: 'crisis',
  weight: 4
}

{
  id: 'crisis-mob-violence',
  text: 'A mob stones a Christian merchant in the forum. His widow seeks refuge.',
  effects: { cohesion: -3, resources: -2 },
  era: 'crisis',
  weight: 5
}

{
  id: 'crisis-plague-outbreak',
  text: 'Fever claims three deacons in a single week. The flock mourns.',
  effects: { cohesion: -4 },
  era: 'crisis',
  weight: 3
}

{
  id: 'crisis-apostate-panic',
  text: 'An elder publicly renounces the faith to save his family. Whispers of betrayal spread.',
  effects: { cohesion: -5 },
  era: 'crisis',
  weight: 2
}
```

**Tag-Conditional Micro-Events**
```javascript
{
  id: 'crisis-infirmary-plague-death',
  text: 'The plague returns. Two volunteers fall ill tending the sick in your infirmary.',
  effects: { members: -2, cohesion: -2 },
  era: 'crisis',
  weight: 3,
  requiresTags: ['has-infirmary']
}

{
  id: 'crisis-schism-reconciliation-attempt',
  text: 'A delegation from the rival church asks to discuss reunion. Hope flickers.',
  effects: { cohesion: 2 },
  era: 'crisis',
  weight: 2,
  requiresTags: ['has-schism']
}
```

#### 5.3.3 Imperial Era (313-450 AD)

**Positive Micro-Events**
```javascript
{
  id: 'imperial-constantine-edict',
  text: 'News of Constantine's Edict of Milan reaches Arles. Believers openly weep with relief.',
  effects: { cohesion: 5, influence: 4 },
  era: 'imperial',
  weight: 1  // Very rare, historically specific
}

{
  id: 'imperial-senator-baptism',
  text: 'A retired senator requests baptism, bringing his extensive household.',
  effects: { members: 5, influence: 4 },
  era: 'imperial',
  weight: 3
}

{
  id: 'imperial-pilgrimage-revenue',
  text: 'Pilgrims visiting your shrine leave offerings of oil and coin.',
  effects: { resources: 5 },
  era: 'imperial',
  weight: 4,
  requiresTags: ['has-shrine']
}

{
  id: 'imperial-council-invitation',
  text: 'Your bishop receives an invitation to a regional synod. Prestige grows.',
  effects: { influence: 4 },
  era: 'imperial',
  weight: 4
}
```

**Neutral Micro-Events**
```javascript
{
  id: 'imperial-basilica-scaffolding',
  text: 'Work crews raise scaffolding on the basilica. Passersby stop to watch.',
  effects: {},
  era: 'imperial',
  weight: 3,
  requiresTags: ['has-basilica-foundation']
}

{
  id: 'imperial-theological-debate',
  text: 'Two presbyters debate Arianism over wine. The conversation grows heated but civil.',
  effects: { cohesion: 1 },
  era: 'imperial',
  weight: 4
}
```

**Negative Micro-Events**
```javascript
{
  id: 'imperial-arian-pressure',
  text: 'An Arian bishop arrives from the north, demanding your community reconsider Nicaea.',
  effects: { cohesion: -3, influence: -2 },
  era: 'imperial',
  weight: 3
}

{
  id: 'imperial-tax-burden',
  text: 'The imperial grain tax increases sharply. Your diaconate struggles to feed the poor.',
  effects: { resources: -4 },
  era: 'imperial',
  weight: 5
}

{
  id: 'imperial-corruption-scandal',
  text: 'A deacon is accused of embezzling relief funds. The trial damages your reputation.',
  effects: { cohesion: -4, influence: -3 },
  era: 'imperial',
  weight: 2
}

{
  id: 'imperial-barbarian-raid-rumor',
  text: 'Rumors of Gothic raiders north of the Rhine unsettle merchant donors.',
  effects: { resources: -3 },
  era: 'imperial',
  weight: 4
}
```

#### 5.3.4 Visigothic/Fading Empire Era (400-507 AD)
*(For future implementation when post-imperial scenarios are added)*

```javascript
{
  id: 'visigoth-arian-coexistence',
  text: 'A Visigothic Arian priest proposes sharing your church building. Tension simmers.',
  effects: { cohesion: -3, influence: 2 },
  era: 'visigothic',
  weight: 5
}

{
  id: 'visigoth-roman-identity-crisis',
  text: 'Young members debate whether to learn Gothic or cling to Latin liturgy.',
  effects: { cohesion: -2 },
  era: 'visigothic',
  weight: 4
}

{
  id: 'visigoth-bishop-civic-authority',
  text: 'With no magistrate, citizens ask your bishop to arbitrate a property dispute.',
  effects: { influence: 4 },
  era: 'visigothic',
  weight: 5
}
```

### 5.4 Weighting System

#### 5.4.1 Base Probability by Stat Levels
Certain micro-events become more/less likely based on current stats:

| Stat Condition | Adjusted Micro-Events |
|----------------|----------------------|
| Resources < 20 | 2x weight for "donation received" events |
| Resources > 70 | 2x weight for "tax burden" / "corruption" events |
| Cohesion < 30 | 2x weight for "apostasy" / "schism" events |
| Cohesion > 80 | 2x weight for "convert testimony" / "wedding" events |
| Influence < 20 | 0.5x weight for "imperial summons" events |
| Influence > 70 | 2x weight for "political request" events |

#### 5.4.2 Era-Specific Pools
```typescript
function selectMicroEvent(era: Era, tags: Set<string>, stats: GameStats): MicroEvent | null {
  // 30% chance of no micro-event (silence for pacing)
  if (Math.random() < 0.3) return null

  // Filter by era and tags
  const pool = MICRO_EVENTS.filter(event =>
    (!event.era || event.era === era) &&
    (!event.requiresTags || event.requiresTags.every(tag => tags.has(tag))) &&
    (!event.forbiddenTags || !event.forbiddenTags.some(tag => tags.has(tag)))
  )

  // Adjust weights based on stats
  const weighted = pool.map(event => ({
    ...event,
    adjustedWeight: calculateAdjustedWeight(event, stats)
  }))

  // Pick weighted random
  return pickWeightedOption(weighted, Math.random)
}
```

### 5.5 UI/UX Display

#### 5.5.1 Cooldown Micro-Event Overlay
**Location**: Appears as a subtle notification overlay in the "Scene" (center) column during cooldown

```
┌──────────────────────────────────────────────────────┐
│                    [Scene Image]                      │
│                                                        │
│  ┌──────────────────────────────────────────┐        │
│  │ 📜 A merchant family joins after          │        │
│  │    witnessing your charity work.          │        │
│  │                                            │        │
│  │    +3 Members  +2 Resources               │        │
│  └──────────────────────────────────────────┘        │
│                                                        │
│            [Fades after 4 seconds]                    │
└──────────────────────────────────────────────────────┘
```

**Animation**:
1. Slide in from bottom at 2s into cooldown
2. Visible for 4 seconds
3. Fade out with gentle opacity transition
4. Stats update with small "+3" animation

#### 5.5.2 Micro-Event Log (Optional)
For players who want to review, add to "Insights" panel:
```
┌─────────────────────────────────────┐
│ RECENT HAPPENINGS                    │
├─────────────────────────────────────┤
│ • Merchant family joined (+3 👥)    │
│ • Tax collector visit (-3 📦)       │
│ • Wedding celebrated (+2 🔗)        │
└─────────────────────────────────────┘
```

### 5.6 Educational Impact

**Historical Concept**: Contingency and structural forces
- History isn't just "great decisions"—it's plagues, rumors, weather, chance encounters
- Small background forces accumulate into large trends
- Agency exists within constraints of unpredictable systems

**Student Learning**:
- "Why did my resources suddenly drop?"
- Understanding historical unpredictability
- Recognizing that even with perfect planning, chance matters
- Appreciating the difference between controllable (event choices) and uncontrollable (micro-events) forces

---

## 6.0 Implementation Guidance

### 6.1 Development Phases

#### Phase 1: Resource & Influence Gates (Estimated: 3-4 hours)
**Files to Modify**:
- `webapp/src/content/eventDeck.ts` - Add `requirements` to 11 existing events
- `webapp/src/features/game/state/gameEngine.ts` - Add requirement validation logic
- `webapp/src/features/game/GameShell.tsx` - Update UI to show locked choices

**Testing**:
- Verify locked choices display correctly
- Test stat threshold edge cases (exactly 40 vs. 39)
- Confirm flavor text renders properly

#### Phase 2: Persistent Tags (Estimated: 4-6 hours)
**Files to Modify**:
- `webapp/src/content/eventDeck.ts` - Add tags to 11 existing event outcomes
- `webapp/src/features/game/state/gameEngine.ts` - Add tag state management
- `webapp/src/features/game/GameShell.tsx` - Add "Community Memory" UI panel
- Create 4-6 new tag-unlocked events

**Testing**:
- Verify tags persist across events
- Test tag-conditional event filtering
- Confirm permanent effects apply correctly

#### Phase 3: Micro-Events (Estimated: 3-4 hours)
**Files to Create**:
- `webapp/src/content/microEvents.ts` - Library of 30+ micro-events

**Files to Modify**:
- `webapp/src/features/game/state/gameEngine.ts` - Micro-event queue and selection
- `webapp/src/features/game/GameShell.tsx` - Cooldown overlay UI

**Testing**:
- Verify timing (2s delay, 4s visibility)
- Test weighting system with various stat combinations
- Confirm stat changes don't exceed ±5 cap

### 6.2 Type Definitions Summary

```typescript
// eventDeck.ts additions
type EventChoice = {
  // ... existing fields
  requirements?: {
    resources?: number
    influence?: number
    tags?: string[]
    forbiddenTags?: string[]
  }
}

type EventOutcome = {
  // ... existing fields
  tagsApplied?: string[]
  tagsRemoved?: string[]
  permanentEffect?: PermanentEffect
}

type PermanentEffect = {
  id: string
  label: string
  description: string
  statModifier: StatDelta
  duration?: 'permanent' | { turns: number }
}

// microEvents.ts (new file)
type MicroEvent = {
  id: string
  text: string
  effects: StatDelta
  era?: 'founding' | 'crisis' | 'imperial' | 'visigothic'
  weight: number
  requiresTags?: string[]
  forbiddenTags?: string[]
}

// gameEngine.ts additions
type GameEngineState = {
  // ... existing fields
  tags: Set<string>
  permanentEffects: PermanentEffect[]
  lastMicroEvent?: MicroEvent
  microEventVisible: boolean
}
```

### 6.3 Data Migration
**Backward Compatibility**: All three systems are opt-in. Existing events work without modification:
- Events without `requirements` remain universally available
- Events without `tagsApplied` don't modify tag state
- Micro-events are additive, don't affect existing events

**Gradual Rollout**: Can implement systems independently:
1. Ship gates first (immediate strategic depth)
2. Add tags next (narrative continuity)
3. Add micro-events last (polish/juice)

---

## 7.0 Playtesting & Balance

### 7.1 Key Metrics to Monitor

| Metric | Target | Concern |
|--------|--------|---------|
| % of playthroughs with ≥1 locked choice | 60-80% | Too low = gates don't matter |
| Average tags acquired per playthrough | 4-7 tags | Too low = system underused |
| Average permanent effects active at endgame | 2-4 effects | Too high = game becomes trivial |
| Micro-events per playthrough | 8-15 events | Too high = overwhelming |

### 7.2 Balance Concerns

**Issue**: Resource/Influence gates too restrictive → Players always locked out
- **Solution**: Ensure 2/3 choices in each event are ungated
- **Solution**: Early events provide stat-building opportunities

**Issue**: Tags create "dead ends" where players can't progress
- **Solution**: Never require exclusive tag combinations
- **Solution**: Always have fallback events for any tag state

**Issue**: Micro-events swing stats too wildly
- **Solution**: Hard cap at ±5 per micro-event
- **Solution**: Weight negative events lower than positive (3:2 ratio)

### 7.3 Student Feedback Questions
1. "Did locked choices make you think more strategically about stat management?"
2. "Did the 'Community Memory' tags make your choices feel more consequential?"
3. "Did micro-events add flavor or feel distracting?"
4. "Which system enhanced your understanding of historical constraints most?"

---

## 8.0 Future Extensions (Post-2.0)

### 8.1 Potential Enhancements
- **Character Loyalty System**: 3-5 named NPCs with relationship scores (see original analysis, Tier 2 #5)
- **Liturgical Calendar**: Auto-events every 10 years for Easter/Christmas (see original analysis, Tier 2 #6)
- **Visual Milestone Progression**: Church building images change at member thresholds (see original analysis, Tier 1 #1)
- **Multi-Stage Events**: Synods/councils as 3-part decision chains (from PRD 1.0 §3.5)

### 8.2 Visigothic Era Integration
When post-imperial scenarios are added (per user's original question):
- Add `'visigothic'` era to event deck (400-507 AD)
- Expand micro-event library with Arian conflict, identity crisis, civic collapse themes
- New tags: `arian-tolerant`, `gothic-integration`, `bishop-civic-leader`

---

## 9.0 Conclusion

### 9.1 Design Principles Maintained
✅ **30-40 minute playtime** - No system extends session length
✅ **Narrative over complexity** - All systems use existing stats/mechanics
✅ **Educational focus** - Each system models historical concepts
✅ **Accessible UI** - Changes layer onto existing interface

### 9.2 Problems Solved
✅ **"Stats feel meaningless"** → Gates make Resources/Influence strategically vital
✅ **"Choices exist in a vacuum"** → Tags create narrative continuity
✅ **"Gameplay feels static"** → Micro-events add dynamic rhythm

### 9.3 Success Criteria
This PRD 2.0 succeeds if playtesters report:
1. **Strategic thinking**: "I saved resources for the infirmary event"
2. **Narrative coherence**: "The game remembered I sheltered refugees 50 years ago"
3. **Dynamism**: "I never knew what micro-event would happen next"
4. **Historical insight**: "I understand now why scarcity constrained early bishops"

---

**Document Status**: Ready for implementation
**Next Steps**: Developer review → Phase 1 implementation → Playtesting

---

*This document extends Ecclesia_PRD.md (v1.0) and should be read alongside the original design specification.*
