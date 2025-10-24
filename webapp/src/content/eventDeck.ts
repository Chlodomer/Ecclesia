import { pickWeightedOption, type WeightedOption, createSeededRng } from '@/lib/random'
import type { SoundCue } from '@/lib/sound'

export type StatDelta = {
  members?: number
  cohesion?: number
  resources?: number
  influence?: number
}

export type ReflectionPrompt = {
  prompt: string
  options: string[]
  correctIndex: number | null
}

export type EventOutcome = {
  id: string
  description: string
  effects: StatDelta
  yearAdvance: number
  soundEffect?: SoundCue
  addTags?: string[]
  removeTags?: string[]
}

export type EventChoice = {
  id: string
  label: string
  reflection: ReflectionPrompt | null
  outcomes: WeightedOption<EventOutcome>[]
  requirements?: {
    resources?: number
    influence?: number
    cohesion?: number
    tags?: string[]
    anyTags?: string[]
    forbiddenTags?: string[]
  }
}

export type GameEvent = {
  id: string
  era: 'founding' | 'crisis' | 'imperial' | 'fading'
  yearHint: number
  isIntro?: boolean
  title: string
  narrative: string
  sceneImage: string
  sceneTitle: string
  sceneCaption: string
  choices: EventChoice[]
}

export type GameDeck = {
  initialYear: number
  events: GameEvent[]
}

// Micro-events: short flavor beats shown during cooldown with small effects
export type MicroEvent = {
  id: string
  description: string
  effects: StatDelta
  soundEffect?: SoundCue
  minYear?: number
  maxYear?: number
}

const microEvents: WeightedOption<MicroEvent>[] = [
  {
    value: {
      id: 'micro-birth-catechumen',
      description: 'A child is born among the catechumens; friends rally in joy.',
      effects: { members: 1, cohesion: 1 },
      soundEffect: 'discussion',
    },
    weight: 4,
  },
  {
    value: {
      id: 'micro-elder-dies',
      description: 'A respected elder falls asleep in the Lord; prayers fill the nave.',
      effects: { members: -1, cohesion: 2 },
      soundEffect: 'chant',
    },
    weight: 3,
  },
  {
    value: {
      id: 'micro-alms-widow',
      description: 'A widow shares her last loaf; the almonry stirs to action.',
      effects: { cohesion: 2, influence: 1 },
      soundEffect: 'discussion',
    },
    weight: 5,
  },
  {
    value: {
      id: 'micro-sick-healed',
      description: 'A fever breaks after prayer; neighbors whisper cautiously of mercy.',
      effects: { members: 2, influence: 1 },
      soundEffect: 'quiet',
    },
    weight: 4,
  },
  {
    value: {
      id: 'micro-guild-grumble',
      description: 'Guild leaders grumble about lost sales after vespers.',
      effects: { influence: -1 },
      soundEffect: 'crowd',
    },
    weight: 3,
  },
  {
    value: {
      id: 'micro-psalm-vigil',
      description: 'A quiet psalm rises from the courtyard; hearts steady.',
      effects: { cohesion: 2 },
      soundEffect: 'chant',
    },
    weight: 5,
  },
  {
    value: {
      id: 'micro-catechumens-arrive',
      description: 'Two travelers ask to join the catechumenate after a household meal.',
      effects: { members: 3 },
      soundEffect: 'discussion',
    },
    weight: 4,
  },
  {
    value: {
      id: 'micro-almonry-short',
      description: 'The almonry runs short; deacons plan a collection.',
      effects: { resources: -2, influence: 1 },
      soundEffect: 'quiet',
    },
    weight: 3,
  },
  {
    value: {
      id: 'micro-presbyter-visits',
      description: 'A presbyter visits the sick; their family attends vespers.',
      effects: { members: 2, cohesion: 1 },
      soundEffect: 'discussion',
    },
    weight: 4,
  },
]

// Donation and income micro-events to help resource stability
const donationMicroEvents: WeightedOption<MicroEvent>[] = [
  {
    value: {
      id: 'micro-donation-patron',
      description: 'A local patron quietly funds repairs for the basilica roof.',
      effects: { resources: 8, influence: 1 },
      soundEffect: 'construction',
    },
    weight: 5,
  },
  {
    value: {
      id: 'micro-bequest-estate',
      description: 'An elder bequeaths a small estate; proceeds bolster the almonry.',
      effects: { resources: 10, influence: 1 },
      soundEffect: 'quiet',
    },
    weight: 4,
  },
  {
    value: {
      id: 'micro-market-proceeds',
      description: 'Market-day breads sell out after vespers; deacons tally the purse.',
      effects: { resources: 6, cohesion: 1 },
      soundEffect: 'discussion',
    },
    weight: 5,
  },
  {
    value: {
      id: 'micro-guild-offering',
      description: 'The potters’ guild donates clay for lamps through winter.',
      effects: { resources: 5, influence: 1 },
      soundEffect: 'crowd',
    },
    weight: 4,
  },
  {
    value: {
      id: 'micro-anonymous-purse',
      description: 'At dawn, an anonymous purse is found at the narthex.',
      effects: { resources: 7 },
      soundEffect: 'quiet',
    },
    weight: 5,
  },
]

export function drawMicroEvent(seed: number = Date.now()): MicroEvent {
  const rng = createSeededRng(seed)
  return pickWeightedOption(microEvents, rng)
}

// Historically significant micro-events that appear around key years
const historicalMicroEvents: WeightedOption<MicroEvent>[] = [
  {
    value: {
      id: 'hist-milvian-bridge-312',
      description: '312: Battle of the Milvian Bridge — imperial favor tilts toward the church.',
      effects: { influence: 5, cohesion: 2 },
      soundEffect: 'crowd',
      minYear: 311,
      maxYear: 314,
    },
    weight: 6,
  },
  {
    value: {
      id: 'hist-nicaea-325',
      description: '325: Council of Nicaea — creed unifies many churches under shared confession.',
      effects: { cohesion: 5, influence: 3 },
      soundEffect: 'chant',
      minYear: 324,
      maxYear: 327,
    },
    weight: 6,
  },
  {
    value: {
      id: 'hist-constantinople-381',
      description: '381: Council of Constantinople — the creed receives reaffirmation and expansion.',
      effects: { cohesion: 3, influence: 3 },
      soundEffect: 'chant',
      minYear: 380,
      maxYear: 382,
    },
    weight: 5,
  },
  {
    value: {
      id: 'hist-augustine-dies-430',
      description: '430: Death of Augustine of Hippo — teachers mourn, writings spread widely.',
      effects: { influence: 2 },
      soundEffect: 'quiet',
      minYear: 429,
      maxYear: 431,
    },
    weight: 4,
  },
  {
    value: {
      id: 'hist-rome-falls-476',
      description: '476: Deposition of Romulus Augustulus — imperial order wanes; local leadership rises.',
      effects: { cohesion: 2, influence: -2 },
      soundEffect: 'crowd',
      minYear: 475,
      maxYear: 477,
    },
    weight: 6,
  },
]

function donationScaleForYear(year: number): number {
  // Scale from ~1.0 at 100 CE up to ~1.8 by 500 CE
  const clamped = Math.max(100, Math.min(500, year))
  const t = (clamped - 100) / 400
  return 1 + 0.8 * t
}

function scaledDonation(m: MicroEvent, year: number): MicroEvent {
  if (!m.effects.resources) return m
  const factor = donationScaleForYear(year)
  const scaled = Math.max(1, Math.round(m.effects.resources * factor))
  return { ...m, effects: { ...m.effects, resources: scaled } }
}

export function drawMicroEventForResources(
  resources: number,
  year: number,
  seed: number = Date.now(),
  historyIds: string[] = [],
): MicroEvent {
  const rng = createSeededRng(seed)
  // Prefer an eligible historical event once per session
  const eligibleHist = historicalMicroEvents
    .map((w) => w.value)
    .filter((m) => (m.minYear == null || year >= m.minYear) && (m.maxYear == null || year <= m.maxYear))
    .filter((m) => !historyIds.includes(m.id))
  if (eligibleHist.length > 0) {
    return eligibleHist[Math.floor(rng() * eligibleHist.length)]
  }
  // If resources are low, bias toward donation/income events
  if (resources <= 10) {
    const m = pickWeightedOption(donationMicroEvents, rng)
    return scaledDonation(m, year)
  }
  // Occasionally sprinkle donations even when stable
  const roll = Math.floor(rng() * 5)
  if (roll === 0) {
    const m = pickWeightedOption(donationMicroEvents, rng)
    return scaledDonation(m, year)
  }
  return pickWeightedOption(microEvents, rng)
}

export const baseDeck: GameDeck = {
  initialYear: 112,
  events: [
    {
      id: 'apostle-arrival',
      era: 'founding',
      yearHint: 112,
      isIntro: true,
      title: 'An Apostle at the Baths',
      narrative:
        "Junia, a weathered apostle from the east, arrives with parchments and tales of resurrection. She asks to speak in the bathhouse atrium and invites any who believe to enter the baptistery.",
      sceneImage: '/assets/baptism.png',
      sceneTitle: 'Cedar-Lined Baptistery',
      sceneCaption:
        'Steam drifts over the marble font as a traveling apostle beckons hearers toward the waters of new birth.',
      choices: [
        {
          id: 'apostle-welcome',
          label: "Gather every household to hear Junia's proclamation.",
          reflection: {
            prompt: "Why does Junia insist on recording the names of the newly baptized?",
            options: [
              "Shared memory guards the community's continuity.",
              'Imperial census agents demand accurate rolls.',
              'She fears rivals will claim the converts.',
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'apostle-welcome-a',
                description:
                  "Junia's testimony ignites the atrium. Ten catechumens step into the font, and veterans of the faith pledge to mentor them.",
                effects: { members: 10, cohesion: 4, influence: 2 },
                yearAdvance: 1,
                soundEffect: 'sermon',
              },
              weight: 1,
            },
          ],
        },
      ],
    },
    {
      id: 'provincial-pilgrimage',
      era: 'fading',
      yearHint: 430,
      title: 'Provincial Pilgrimage',
      narrative:
        'Rumors of relics and charity spread. A provincial pilgrimage route could bring waves of seekers — but also opportunists.',
      sceneImage: '/assets/procession.png',
      sceneTitle: 'Pilgrims on the Road',
      sceneCaption:
        'Lanterns bob along the ridge as pilgrims descend toward the basilica in the cool dawn.',
      choices: [
        {
          id: 'pilgrimage-host',
          label: 'Host an annual pilgrimage with catechesis stations.',
          reflection: {
            prompt: 'Why pair pilgrimage with teaching?',
            options: ['To anchor zeal in formation.', 'To impress magistrates.', 'To raise stall rents.'],
            correctIndex: 0,
          },
          requirements: { anyTags: ['mass-catechumens', 'miracle-testimonies'] },
          outcomes: [
            {
              value: {
                id: 'pilgrimage-host-a',
                description: 'Crowds swell but stay orderly; many remain after waystations guide them into community.',
                effects: { members: 110, cohesion: 6, influence: 6 },
                yearAdvance: 3,
                soundEffect: 'crowd',
              },
              weight: 6,
            },
            {
              value: {
                id: 'pilgrimage-host-b',
                description: 'Vendors press in; some pilgrims drift. Still, many find a home.',
                effects: { members: 80, cohesion: -4 },
                yearAdvance: 2,
                soundEffect: 'discussion',
              },
              weight: 4,
            },
          ],
        },
        {
          id: 'pilgrimage-local',
          label: 'Keep devotions local and small.',
          reflection: {
            prompt: 'What do small devotions protect?',
            options: ['Attentiveness to persons over crowds.', 'Imperial taxes.', 'Road tolls.'],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'pilgrimage-local-a',
                description: 'Local circles deepen in prayer; growth is steady but modest.',
                effects: { members: 24, cohesion: 8 },
                yearAdvance: 2,
                soundEffect: 'quiet',
              },
              weight: 6,
            },
          ],
        },
      ],
    },
    {
      id: 'unity-synod',
      era: 'fading',
      yearHint: 432,
      title: 'Synod of Unity',
      narrative:
        'Bishops from nearby sees invite your community to a synod celebrating reconciliation and shared mission.',
      sceneImage: '/assets/christians_celebrate_mass.png',
      sceneTitle: 'Under the Bishop’s Hand',
      sceneCaption:
        'Delegates gather with scrolls. A letter of peace is ready to sign if all agree.',
      choices: [
        {
          id: 'synod-sign',
          label: 'Sign the letter of peace and declare common mission.',
          reflection: {
            prompt: 'What does public unity accomplish?',
            options: ['It multiplies witness across the province.', 'It grants tax relief.', 'It guarantees patronage.'],
            correctIndex: 0,
          },
          requirements: { tags: ['unity-pact'] },
          outcomes: [
            {
              value: {
                id: 'synod-sign-a',
                description: 'The letter spreads quickly. Congregations combine outreach; many join within months.',
                effects: { members: 120, cohesion: 10, influence: 8 },
                yearAdvance: 3,
                soundEffect: 'discussion',
              },
              weight: 7,
            },
            {
              value: {
                id: 'synod-sign-b',
                description: 'Unity is formal but fragile; some resent changes. Even so, numbers rise.',
                effects: { members: 80, cohesion: -4 },
                yearAdvance: 2,
                soundEffect: 'quiet',
              },
              weight: 3,
            },
          ],
        },
        {
          id: 'synod-abstain',
          label: 'Abstain; keep focus local.',
          reflection: {
            prompt: 'What might abstaining miss?',
            options: ['Shared momentum that could bless many.', 'Imperial favor.', 'Cheaper oil.'],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'synod-abstain-a',
                description: 'You avoid disputes but lose a wave of interest stirred by the synod.',
                effects: { members: 16, cohesion: 8 },
                yearAdvance: 2,
                soundEffect: 'quiet',
              },
              weight: 6,
            },
          ],
        },
      ],
    },
    {
      id: 'confessors-return',
      era: 'crisis',
      yearHint: 262,
      title: 'Confessors Return',
      narrative:
        'After a season of persecution, several who lapsed under pressure seek to return. Elders disagree on penance before communion.',
      sceneImage: '/assets/christians_celebrate_mass.png',
      sceneTitle: 'Nave After the Storm',
      sceneCaption:
        'Candles flicker over worn faces as confessors and the lapsed stand side by side awaiting guidance.',
      choices: [
        {
          id: 'confessors-strict',
          label: 'Require a long penance before restoration.',
          reflection: {
            prompt: 'Why might stricter penance help the church?',
            options: [
              'It rebuilds trust and teaches endurance.',
              'Imperial law demands penance first.',
              'It increases alms from the lapsed.',
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'confessors-strict-a',
                description:
                  'Some wait patiently and deepen their faith. Others depart in shame, but discipline steadies the flock.',
                effects: { cohesion: 8, members: -6 },
                yearAdvance: 3,
                soundEffect: 'chant',
              },
              weight: 6,
            },
            {
              value: {
                id: 'confessors-strict-b',
                description:
                  'A faction accuses you of hardness. Small house meetings form around a lenient presbyter.',
                effects: { cohesion: -8, influence: -3 },
                yearAdvance: 2,
                soundEffect: 'discussion',
              },
              weight: 4,
            },
          ],
        },
        {
          id: 'confessors-pastoral',
          label: 'Restore quickly with public repentance and mentorship.',
          reflection: {
            prompt: 'What risk accompanies a swift restoration?',
            options: [
              'Cohesion may suffer if wounds feel minimized.',
              'Imperial spies may infiltrate again.',
              'Restored believers forget the creed.',
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'confessors-pastoral-a',
                description:
                  'Tears and embraces mark the liturgy. Mentors step up, and some who had drifted return.',
                effects: { cohesion: 4, members: 6 },
                yearAdvance: 2,
                soundEffect: 'crowd',
              },
              weight: 6,
            },
            {
              value: {
                id: 'confessors-pastoral-b',
                description:
                  'Long-suffering confessors feel overlooked. Old scars reopen in whispered complaints.',
                effects: { cohesion: -6 },
                yearAdvance: 2,
                soundEffect: 'discussion',
              },
              weight: 4,
            },
          ],
        },
      ],
    },
    {
      id: 'basilica-patronage',
      era: 'fading',
      yearHint: 332,
      title: 'Basilica Patronage Dispute',
      narrative:
        'Local nobles fund the basilica but demand plaques naming their houses beneath the apse mosaic. Deacons warn it will divide the poor.',
      sceneImage: '/assets/church_being_built.png',
      sceneTitle: 'Apse Under Scaffolds',
      sceneCaption:
        'Mosaic tiles glint above the nave while patrons haggle with deacons over whose names will endure.',
      choices: [
        {
          id: 'patronage-accept',
          label: 'Accept plaques in gratitude and dedicate them at consecration.',
          reflection: {
            prompt: 'What is the danger of public donor plaques?',
            options: [
              'Honor can tether worship to status.',
              'Imperial law requires anonymity.',
              'Plaques reduce acoustics in the apse.',
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'patronage-accept-a',
                description:
                  'Donors swell attendance at consecration. Some poor families feel unseen but funds flow steadily.',
                effects: { members: 10, cohesion: -4, influence: 4 },
                yearAdvance: 3,
                soundEffect: 'construction',
                addTags: ['honor-plaques'],
              },
              weight: 6,
            },
            {
              value: {
                id: 'patronage-accept-b',
                description:
                  'A quarrel over placement erupts between houses. Work halts for weeks while tempers cool.',
                effects: { cohesion: -8, resources: -6 },
                yearAdvance: 2,
                soundEffect: 'discussion',
              },
              weight: 4,
            },
          ],
        },
        {
          id: 'patronage-anonymous',
          label: 'Anonymize gifts; inscribe only scriptural verses.',
          reflection: {
            prompt: 'Why might anonymity strengthen witness?',
            options: [
              'It centers gratitude on God rather than status.',
              'Imperial auditors prefer anonymous ledgers.',
              'It prevents dust from collecting on plaques.',
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'patronage-anonymous-a',
                description:
                  'Some nobles bristle, but many admire the stance. A widow’s mite inspires fresh generosity.',
                effects: { cohesion: 8, members: 6 },
                yearAdvance: 2,
                soundEffect: 'chant',
                addTags: ['anonymity-stance'],
              },
              weight: 6,
            },
            {
              value: {
                id: 'patronage-anonymous-b',
                description:
                  'Two patrons withdraw support, shrinking the project and delaying completion.',
                effects: { resources: -10, influence: -4 },
                yearAdvance: 2,
                soundEffect: 'construction',
              },
              weight: 4,
            },
          ],
        },
      ],
    },
    {
      id: 'guild-sabbath-conflict',
      era: 'fading',
      yearHint: 355,
      title: 'Guild Sabbath Conflict',
      narrative:
        'Bakers complain Sunday rest ruins their margins; they ask you to sign exemptions for pre-dawn work before liturgy.',
      sceneImage: '/assets/meal.png',
      sceneTitle: 'Ovens Before Dawn',
      sceneCaption:
        'Flour dust hangs in lamplight as guild heads wait to hear whether labor will yield to worship or bend to custom.',
      choices: [
        {
          id: 'guild-letters',
          label: 'Write letters allowing early bakers to work with limits.',
          reflection: {
            prompt: 'What unintended message could exemptions send?',
            options: [
              'That economic pressure outranks common worship.',
              'That bread is unclean if baked on Sunday.',
              'That only bakers deserve rest.',
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'guild-letters-a',
                description:
                  'Bread remains affordable and families are grateful. Some deacons worry devotion will drift.',
                effects: { members: 8, cohesion: -4 },
                yearAdvance: 2,
                soundEffect: 'discussion',
                addTags: ['work-exemptions'],
              },
              weight: 6,
            },
            {
              value: {
                id: 'guild-letters-b',
                description:
                  'Other guilds demand similar exceptions. The rhythm of the Lord’s Day blurs for many.',
                effects: { cohesion: -8, influence: -2 },
                yearAdvance: 1,
                soundEffect: 'crowd',
              },
              weight: 4,
            },
          ],
        },
        {
          id: 'guild-rest',
          label: 'Hold a firm line: rest and worship together.',
          reflection: {
            prompt: 'Why insist on common rest?',
            options: [
              'Shared time forms a people, not just beliefs.',
              'Imperial taxes fall on closed shops.',
              'It improves the smell of loaves.',
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'guild-rest-a',
                description:
                  'Some bakers lament lost sales; others testify to renewed joy. A few patrons bring bread after vespers.',
                effects: { cohesion: 8, members: -4 },
                yearAdvance: 2,
                soundEffect: 'chant',
              },
              weight: 6,
            },
            {
              value: {
                id: 'guild-rest-b',
                description:
                  'Prices spike in poorer quarters. Grumbling spreads in the market stalls against “church rules.”',
                effects: { influence: -6, members: -6 },
                yearAdvance: 1,
                soundEffect: 'crowd',
              },
              weight: 4,
            },
          ],
        },
      ],
    },
    {
      id: 'settlement-oath',
      era: 'fading',
      yearHint: 418,
      title: 'Settlement Oath at the Forum',
      narrative:
        'A Visigothic comes orders citizens to swear an oath for protection. Elders debate what fidelity the church can promise.',
      sceneImage: '/assets/army_visits_town.png',
      sceneTitle: 'Standards at the Gate',
      sceneCaption:
        'Soldiers watch the basilica doors as citizens whisper about the oath’s terms and the safety it might buy.',
      choices: [
        {
          id: 'oath-swear',
          label: 'Swear a limited civic oath; clarify loyalty is not worship.',
          reflection: {
            prompt: 'What danger lurks in civic oaths?',
            options: [
              'Vows can blur lines between God and ruler.',
              'Oaths always raise taxes by decree.',
              'They force all soldiers to convert.',
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'oath-swear-a',
                description:
                  'Your careful language averts charges of disloyalty. Some zealots leave, but the city breathes easier.',
                effects: { influence: 6, cohesion: -4 },
                yearAdvance: 3,
                soundEffect: 'discussion',
              },
              weight: 6,
            },
            {
              value: {
                id: 'oath-swear-b',
                description:
                  'A faction insists the oath is idolatry. Street arguments flare and a deacon is struck.',
                effects: { cohesion: -8, members: -4 },
                yearAdvance: 2,
                soundEffect: 'violence',
              },
              weight: 4,
            },
          ],
        },
        {
          id: 'oath-mediation',
          label: 'Petition commanders to accept a pledge of peace instead of an oath.',
          reflection: {
            prompt: 'Why seek a pledge over an oath?',
            options: [
              'It lowers risk of religious compromise.',
              'It guarantees tax relief.',
              'It forces Goths to attend liturgy.',
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'oath-mediation-a',
                description:
                  'Commanders accept a pledge for now. Merchants reopen stalls and watch your counsel closely.',
                effects: { influence: 8, members: 4 },
                yearAdvance: 2,
                soundEffect: 'crowd',
              },
              weight: 6,
            },
            {
              value: {
                id: 'oath-mediation-b',
                description:
                  'Talks stall and tempers rise. A levy is imposed on the church storehouse.',
                effects: { resources: -8, cohesion: -4 },
                yearAdvance: 1,
                soundEffect: 'violence',
              },
              weight: 4,
            },
          ],
        },
      ],
    },
    {
      id: 'famine-rations',
      era: 'imperial',
      yearHint: 421,
      title: 'Famine Relief Rations',
      narrative:
        'Failed harvests thin grain stores. The deacons propose rationing models that will decide who eats first.',
      sceneImage: '/assets/clergy_distributing_alms.png',
      sceneTitle: 'Almonry at Dusk',
      sceneCaption:
        'Hands reach for ladles under the basilica portico as you weigh justice, witness, and survival.',
      choices: [
        {
          id: 'rations-needs',
          label: 'Distribute by need: widows, orphans, and the sick first.',
          reflection: {
            prompt: 'What cost comes with needs-based rations?',
            options: [
              'Some families will quietly go hungry.',
              'Imperial law forbids such distributions.',
              'Merchants cannot trade on fast days.',
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'rations-needs-a',
                description:
                  'The weakest survive and your reputation for mercy grows. Whispered resentment simmers among the overlooked.',
                effects: { members: 8, cohesion: -4, influence: 4 },
                yearAdvance: 2,
                soundEffect: 'crowd',
              },
              weight: 6,
            },
            {
              value: {
                id: 'rations-needs-b',
                description:
                  'Fraud accusations spark investigations that drain time and trust.',
                effects: { cohesion: -8, influence: -4 },
                yearAdvance: 1,
                soundEffect: 'discussion',
              },
              weight: 4,
            },
          ],
        },
        {
          id: 'rations-households',
          label: 'Equal portions per household regardless of status.',
          reflection: {
            prompt: 'Why can equal shares still feel unfair?',
            options: [
              'Needs vary; equality can hide injustice.',
              'Roman law requires unequal shares.',
              'Equal portions spoil faster.',
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'rations-households-a',
                description:
                  'Distribution is orderly and tempers cool, though the weakest still strain to make ends meet.',
                effects: { cohesion: 6, influence: 2 },
                yearAdvance: 1,
                soundEffect: 'quiet',
              },
              weight: 6,
            },
            {
              value: {
                id: 'rations-households-b',
                description:
                  'Large households exploit the rule; deacons scramble to plug gaps.',
                effects: { cohesion: -6, resources: -6 },
                yearAdvance: 1,
                soundEffect: 'discussion',
              },
              weight: 4,
            },
          ],
        },
      ],
    },
    {
      id: 'relic-translation',
      era: 'imperial',
      yearHint: 429,
      title: 'Relic Translation and Pilgrims',
      narrative:
        'A bishop offers relics of a local martyr. Moving them to the basilica could draw pilgrims and controversy.',
      sceneImage: '/assets/procession.png',
      sceneTitle: 'Procession with Reliquary',
      sceneCaption:
        'Lanterns sway around a gilded box as the faithful debate spectacle versus devotion.',
      choices: [
        {
          id: 'relic-procession',
          label: 'Hold a grand procession through the city.',
          requirements: { forbiddenTags: ['anonymity-stance'] },
          reflection: {
            prompt: 'What risk comes with spectacle?',
            options: [
              'Public display can cheapen holy things.',
              'Processions always trigger taxation.',
              'Reliquaries are illegal outside Rome.',
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'relic-procession-a',
                description:
                  'Crowds flood the nave and traders set up stalls. Some elders warn against mixing profit with prayer.',
                effects: { members: 12, cohesion: -6, influence: 6 },
                yearAdvance: 2,
                soundEffect: 'crowd',
              },
              weight: 6,
            },
            {
              value: {
                id: 'relic-procession-b',
                description:
                  'A jostle topples a torch; the reliquary is unharmed but critics call the display irreverent.',
                effects: { cohesion: -8, influence: -4 },
                yearAdvance: 1,
                soundEffect: 'violence',
              },
              weight: 4,
            },
          ],
        },
        {
          id: 'relic-quiet',
          label: 'Translate the relics at night with fasting and prayer.',
          requirements: { tags: ['quiet-devotion'] },
          reflection: {
            prompt: 'Why might restraint deepen formation?',
            options: [
              'Hiddenness can purify motives and focus.',
              'Imperial law forbids night processions.',
              'Relics require sunlight to be valid.',
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'relic-quiet-a',
                description:
                  'Pilgrims come more slowly, yet catechesis strengthens and prayer spreads beyond the city.',
                effects: { cohesion: 8, members: 4 },
                yearAdvance: 2,
                soundEffect: 'chant',
              },
              weight: 6,
            },
            {
              value: {
                id: 'relic-quiet-b',
                description:
                  'Merchants grumble at lost opportunity; a patron threatens to reduce alms.',
                effects: { resources: -6, influence: -4 },
                yearAdvance: 1,
                soundEffect: 'discussion',
              },
              weight: 4,
            },
          ],
        },
      ],
    },
    {
      id: 'founding-agape',
      era: 'founding',
      yearHint: 116,
      title: 'Who Joins the Table?',
      narrative:
        'Merchants from Massilia offer to host a public agape feast if the community will bless their caravans. Elders worry it blurs the line between sacrament and spectacle.',
      sceneImage: '/assets/meal.png',
      sceneTitle: 'Agape Supper Hall',
      sceneCaption:
        'Merchants and deacons break bread beneath carved columns as the community weighs how public their fellowship should be.',
      choices: [
        {
          id: 'founding-private',
          label: 'Keep the celebration private and focused on discipleship.',
          reflection: {
            prompt: 'Why do the elders resist a public feast?',
            options: [
              'They fear syncretism and doctrinal confusion.',
              'They dislike food shared with merchants.',
              'They hope to attract Roman officials.',
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'founding-private-a',
                description:
                  'The gathering deepens trust. A few curious onlookers drift away, but the flock feels anchored.',
                effects: { cohesion: 8, members: -3 },
                yearAdvance: 2,
                soundEffect: 'crowd',
              },
              weight: 7,
            },
            {
              value: {
                id: 'founding-private-b',
                description:
                  'Merchants spread rumors that Christians refuse outsiders. Curiosity cools for now.',
                effects: { cohesion: 4, influence: -2 },
                yearAdvance: 1,
                soundEffect: 'violence',
              },
              weight: 3,
            },
          ],
        },
        {
          id: 'founding-open',
          label: 'Accept the offer and bless the feast openly.',
          reflection: {
            prompt: 'What is the primary risk of opening the agape feast?',
            options: [
              'Imperial agents may notice a growing movement.',
              'There will not be enough food.',
              'Merchants will demand membership.',
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'founding-open-a',
                description:
                  'Crowds enjoy the generosity. A magistrate takes note, but leaves with a curious smile.',
                effects: { members: 12, cohesion: -4, influence: 3 },
                yearAdvance: 3,
                soundEffect: 'crowd',
              },
              weight: 6,
            },
            {
              value: {
                id: 'founding-open-b',
                description:
                  'A Stoic tutor argues publicly with your presbyters about resurrection. Imperial scribes record every word.',
                effects: { members: 6, cohesion: -8 },
                yearAdvance: 2,
                soundEffect: 'discussion',
              },
              weight: 4,
            },
          ],
        },
      ],
    },
    {
      id: 'midnight-procession',
      era: 'founding',
      yearHint: 118,
      title: 'Torchlit Vigil',
      narrative:
        'Catechumens ask to carry lamps through the streets on the eve of Pentecost, chanting psalms in public. Elders fear Roman eyes yet hunger for witness.',
      sceneImage: '/assets/procession.png',
      sceneTitle: 'Procession Past the Forum',
      sceneCaption:
        'Hooded faithful glide through moonlight, their hymn echoing off marble porticoes that hide curious onlookers.',
      choices: [
        {
          id: 'procession-public',
          label: 'Approve a full public procession with icons and song.',
          requirements: { cohesion: 60, influence: 30 },
          reflection: {
            prompt: 'What is the chief risk in marching openly through the city?',
            options: [
              'Imperial authorities may read it as defiance.',
              'Participants will tire before the vigil.',
              'Merchants will sue for blocking stalls.',
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'procession-public-a',
                description:
                  'The hymn arrests neighbors in doorways. Some join the march, others report the spectacle to the watch.',
                effects: { members: 6, influence: 5, cohesion: -4 },
                yearAdvance: 2,
                soundEffect: 'crowd',
                addTags: ['public-witness-bold'],
              },
              weight: 6,
            },
            {
              value: {
                id: 'procession-public-b',
                description:
                  "A centurion disperses the procession midway. Torches scatter, and catechumens question the elders' judgment.",
                effects: { cohesion: -12, influence: -4 },
                yearAdvance: 1,
                soundEffect: 'violence',
                addTags: ['public-witness-controversy'],
              },
              weight: 4,
            },
          ],
        },
        {
          id: 'procession-cloister',
          label: 'Keep the vigil inside the courtyard with guarded entrances.',
          reflection: {
            prompt: 'How might a private vigil still bear witness?',
            options: [
              'Depth of formation equips disciples to testify later.',
              'Imperial law requires private worship for legality.',
              'It lets the community avoid fasting obligations.',
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'procession-cloister-a',
                description:
                  'The enclosed vigil knits hearts together, though few outsiders notice. Catechumens memorize the psalms by lamplight.',
                effects: { cohesion: 10, influence: -2 },
                yearAdvance: 1,
                soundEffect: 'chant',
                addTags: ['quiet-devotion'],
              },
              weight: 7,
            },
            {
              value: {
                id: 'procession-cloister-b',
                description:
                  'Young zealots grumble that fear ruled the elders. Two slip away to join a rival circle that promises boldness.',
                effects: { cohesion: -6, members: -3 },
                yearAdvance: 1,
                soundEffect: 'crowd',
              },
              weight: 3,
            },
          ],
        },
        {
          id: 'procession-divided',
          label: 'Split the assembly: a quiet courtyard vigil and a small street hymn.',
          reflection: {
            prompt: 'What makes divided witness difficult to sustain?',
            options: [
              'Differing experiences can fracture unity.',
              'Imperial taxes rise for dual gatherings.',
              'Torches are scarce in the province.',
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'procession-divided-a',
                description:
                  'The dual approach calms the cautious and thrills the brave. Stories of the song drift back without provoking arrests.',
                effects: { cohesion: 4, influence: 3 },
                yearAdvance: 2,
                soundEffect: 'crowd',
              },
              weight: 6,
            },
            {
              value: {
                id: 'procession-divided-b',
                description:
                  'Miscommunication leaves the street team unsupported. They are jeered by revelers, and the courtyard group worries for their safety.',
                effects: { cohesion: -5, influence: -3 },
                yearAdvance: 2,
                soundEffect: 'sermon',
              },
              weight: 4,
            },
          ],
        },
      ],
    },
    {
      id: 'gnostic-poet',
      era: 'crisis',
      yearHint: 174,
      title: 'The Gnostic Poet',
      narrative:
        'Marcus tours the region with hymns that whisper of a hidden god beyond the creator. Artisans love his poetry; catechists fear doctrinal drift.',
      sceneImage: '/assets/christians_celebrate_mass.png',
      sceneTitle: 'Lantern-Lit Nave',
      sceneCaption:
        'Lantern light pools around the altar while the faithful listen for guidance on which songs belong in their worship.',
      choices: [
        {
          id: 'gnostic-dismiss',
          label: 'Excommunicate Marcus and denounce his teachings.',
          reflection: {
            prompt: 'What motivates the sharp response?',
            options: [
              'Protecting doctrinal cohesion in a fragile season.',
              'Desire for imperial approval.',
              "Jealousy over Marcus's musical skill.",
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'gnostic-dismiss-a',
                description:
                  'The community knows where you stand. Some artists depart with Marcus, but the core remains steady.',
                effects: { cohesion: 12, members: -10 },
                yearAdvance: 4,
                soundEffect: 'chant',
              },
              weight: 6,
            },
            {
              value: {
                id: 'gnostic-dismiss-b',
                description:
                  'Marcus forms a rival circle downriver. Families split, and the press notices.',
                effects: { cohesion: -10, members: -18 },
                yearAdvance: 4,
                soundEffect: 'violence',
              },
              weight: 4,
            },
          ],
        },
        {
          id: 'gnostic-adapt',
          label: 'Retain his hymns but preach against the dualist theology.',
          reflection: {
            prompt: 'What tension does this compromise invite?',
            options: [
              'Artistic language can blur doctrinal clarity.',
              'Imperial law forbids hymn adaptations.',
              'Musicians dislike learning new lyrics.',
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'gnostic-adapt-a',
                description:
                  'Catechists rewrite the hymns. Young artisans stay engaged and ask sharper questions.',
                effects: { cohesion: 6, members: 8 },
                yearAdvance: 3,
                soundEffect: 'chant',
              },
              weight: 5,
            },
            {
              value: {
                id: 'gnostic-adapt-b',
                description:
                  'Despite sermons, whispers persist that the body is a prison. Some catechumens drift away.',
                effects: { cohesion: -6, members: -4 },
                yearAdvance: 3,
                soundEffect: 'discussion',
              },
              weight: 5,
            },
          ],
        },
      ],
    },
    {
      id: 'magistrate-summons',
      era: 'crisis',
      yearHint: 205,
      title: 'Summoned Before the Magistrate',
      narrative:
        'After anonymous accusations of atheism, the town magistrate orders your presbyter and six elders to present themselves at dawn for questioning.',
      sceneImage: '/assets/christian_arrested_romans.png',
      sceneTitle: 'Line Before the Standards',
      sceneCaption:
        'Roman soldiers stand in cold formation as an aged presbyter weighs obedience, silence, or flight.',
      choices: [
        {
          id: 'summons-appear',
          label: 'Appear together and offer a calm defense of the faith.',
          reflection: {
            prompt: 'Why might a united appearance matter?',
            options: [
              'Shared witness lends credibility under scrutiny.',
              'Imperial law rewards groups who plead together.',
              'It guarantees absolution regardless of testimony.',
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'summons-appear-a',
                description:
                  'Your measured defense impresses a scribe. The elders return weary but free, though informants mark your boldness.',
                effects: { cohesion: 6, influence: 3 },
                yearAdvance: 2,
                soundEffect: 'violence',
              },
              weight: 6,
            },
            {
              value: {
                id: 'summons-appear-b',
                description:
                  'One elder falters under oath. Fines are levied and soldiers confiscate amphorae from the storehouse.',
                effects: { resources: -8, cohesion: -6 },
                yearAdvance: 1,
                soundEffect: 'discussion',
              },
              weight: 4,
            },
          ],
        },
        {
          id: 'summons-envoy',
          label: 'Send a deacon delegation with gifts, keeping the presbyter hidden.',
          reflection: {
            prompt: 'What message does sending envoys communicate?',
            options: [
              'That the church respects authority yet guards its shepherds.',
              'That the community rejects Roman jurisdiction.',
              'That bribery is its primary strategy.',
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'summons-envoy-a',
                description:
                  'The magistrate accepts the explanation and the oil jars. Suspicion lingers, but officers agree to warn you before future raids.',
                effects: { resources: -6, influence: 4 },
                yearAdvance: 2,
                soundEffect: 'discussion',
              },
              weight: 5,
            },
            {
              value: {
                id: 'summons-envoy-b',
                description:
                  'Officials deem the gesture evasive. Warrants are issued for the presbyter, forcing him into hiding for months.',
                effects: { cohesion: -10, influence: -4 },
                yearAdvance: 1,
                soundEffect: 'violence',
              },
              weight: 5,
            },
          ],
        },
        {
          id: 'summons-hide',
          label: 'Scatter the elders and hold liturgy in secret homes for a season.',
          reflection: {
            prompt: 'How can prolonged secrecy strain a community?',
            options: [
              'Isolation breeds rumor and weakens mutual care.',
              'Hidden worship nullifies sacraments.',
              'It breaks imperial law about household size.',
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'summons-hide-a',
                description:
                  'Hidden liturgies protect the presbyter. Attendance dips, but families keep the faith alive in whispered prayers.',
                effects: { cohesion: -4, members: -6 },
                yearAdvance: 2,
                soundEffect: 'quiet',
              },
              weight: 6,
            },
            {
              value: {
                id: 'summons-hide-b',
                description:
                  'Rumors swirl of cowardice. A faction seeks new leadership, threatening a schism.',
                effects: { cohesion: -12, influence: -3 },
                yearAdvance: 1,
                soundEffect: 'discussion',
              },
              weight: 4,
            },
          ],
        },
      ],
    },
    {
      id: 'forum-plague',
      era: 'crisis',
      yearHint: 249,
      title: 'Fever in the Forum',
      narrative:
        'A fever spreads through traders and widows alike. Bodies line the forum steps while physicians flee to the countryside.',
      sceneImage: '/assets/plague.png',
      sceneTitle: 'Forum Infirmary',
      sceneCaption:
        'Sick and healthy crowd beneath the bell tower as deacons weigh how to offer mercy without losing the flock.',
      choices: [
        {
          id: 'plague-infirmary',
          label: 'Convert the assembly hall into an infirmary staffed by deacons.',
          reflection: {
            prompt: 'What tension accompanies opening the hall to the sick?',
            options: [
              'Care could cost resources and expose volunteers.',
              'Imperial law forbids Christians from tending pagans.',
              'The sick must first confess the creed.',
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'plague-infirmary-a',
                description:
                  'Deacons wash wounds and bury the dead. Some fall ill, yet city folk marvel at your mercy.',
                effects: { cohesion: 6, members: 8, resources: -10 },
                yearAdvance: 3,
                soundEffect: 'violence',
              },
              weight: 6,
            },
            {
              value: {
                id: 'plague-infirmary-b',
                description:
                  'Supplies vanish faster than aid arrives. Exhaustion claims your strongest servants.',
                effects: { cohesion: -8, resources: -8 },
                yearAdvance: 2,
                soundEffect: 'discussion',
              },
              weight: 4,
            },
          ],
        },
        {
          id: 'plague-quarantine',
          label: 'Seal the hall and instruct families to isolate and pray at home.',
          reflection: {
            prompt: 'Why might isolation protect the mission?',
            options: [
              'Limiting exposure preserves core leadership for recovery.',
              'Imperial auditors reward communities that close early.',
              'The plague cannot survive outside temples.',
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'plague-quarantine-a',
                description:
                  'Your swift quarantine curbs infection inside the community, though citizens whisper that Christians hid from suffering.',
                effects: { cohesion: 2, influence: -6 },
                yearAdvance: 2,
                soundEffect: 'quiet',
              },
              weight: 6,
            },
            {
              value: {
                id: 'plague-quarantine-b',
                description:
                  'Neighborhoods interpret the closure as indifference. Several households depart seeking a more present shepherd.',
                effects: { cohesion: -6, members: -8 },
                yearAdvance: 2,
                soundEffect: 'quiet',
              },
              weight: 4,
            },
          ],
        },
        {
          id: 'plague-herbs',
          label: 'Dispatch herbalists with prayers and medicine to every district.',
          reflection: {
            prompt: 'What makes itinerant care risky?',
            options: [
              'Messengers could be blamed if cures fail.',
              'Herbal knowledge is banned by the guild.',
              'Incense offerings must accompany herbs.',
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'plague-herbs-a',
                description:
                  'The herbalists earn gratitude. Survivors associate healing with your God and seek teaching.',
                effects: { members: 10, influence: 6, resources: -6 },
                yearAdvance: 3,
                soundEffect: 'crowd',
              },
              weight: 5,
            },
            {
              value: {
                id: 'plague-herbs-b',
                description:
                  'A patient dies after taking your draught. Families accuse you of sorcery, and guards confiscate your stores.',
                effects: { influence: -8, resources: -8 },
                yearAdvance: 2,
                soundEffect: 'quiet',
              },
              weight: 5,
            },
          ],
        },
      ],
    },
    {
      id: 'sanctuary-ablaze',
      era: 'crisis',
      yearHint: 258,
      title: 'Sanctuary in Flames',
      narrative:
        'Your countryside oratory is torched during a surge of persecution. Charred beams litter the ground while smoke curls into a cloudless sky.',
      sceneImage: '/assets/persecution.png',
      sceneTitle: 'Ashen Basilica',
      sceneCaption:
        'The sanctuary smolders, inviting a choice between retaliation, resilience, or quiet lament.',
      choices: [
        {
          id: 'ablaze-rebuild',
          label: 'Organize a rapid rebuild using every available artisan.',
          reflection: {
            prompt: 'What does swift rebuilding signal to observers?',
            options: [
              'That the church persists despite violence.',
              'That imperial grants fund the project.',
              'That beauty outranks caring for widows.',
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'ablaze-rebuild-a',
                description:
                  'Work crews raise new walls within weeks. The spectacle emboldens believers but drains the treasury.',
                effects: { cohesion: 8, resources: -12 },
                yearAdvance: 2,
                soundEffect: 'discussion',
              },
              weight: 6,
            },
            {
              value: {
                id: 'ablaze-rebuild-b',
                description:
                  'The rush proves costly. Stones crack, and artisans grumble about unpaid labor.',
                effects: { cohesion: -6, resources: -6 },
                yearAdvance: 1,
                soundEffect: 'discussion',
              },
              weight: 4,
            },
          ],
        },
        {
          id: 'ablaze-petition',
          label: 'Petition the governor for protection and compensation.',
          reflection: {
            prompt: 'Why might appealing to Rome be fraught?',
            options: [
              'Imperial favor can shift and erode independence.',
              'Governors are obligated to fund pagan temples first.',
              'Petitions require denouncing your own members.',
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'ablaze-petition-a',
                description:
                  'The governor grants timber and soldiers to guard the rebuild. Pagans mutter that you have grown too powerful.',
                effects: { resources: 10, influence: -4 },
                yearAdvance: 2,
                soundEffect: 'construction',
              },
              weight: 5,
            },
            {
              value: {
                id: 'ablaze-petition-b',
                description:
                  'Your plea is rejected, and officials seize your archives to search for sedition.',
                effects: { resources: -6, influence: -6 },
                yearAdvance: 1,
                soundEffect: 'quiet',
              },
              weight: 5,
            },
          ],
        },
        {
          id: 'ablaze-diaspora',
          label: 'Scatter the congregation into house churches and wait to rebuild.',
          reflection: {
            prompt: 'How can temporary dispersion serve the mission?',
            options: [
              'Smaller gatherings evade detection and seed new communities.',
              'It ensures Rome forgets about Christians entirely.',
              'It satisfies legal requirements for citizenship.',
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'ablaze-diaspora-a',
                description:
                  'House churches bloom across the region. When the storm passes, the flock has quietly doubled.',
                effects: { members: 14, cohesion: -4 },
                yearAdvance: 3,
                soundEffect: 'chant',
              },
              weight: 6,
            },
            {
              value: {
                id: 'ablaze-diaspora-b',
                description:
                  'Living apart dulls zeal. Some never return, and leaders debate whether to rebuild at all.',
                effects: { cohesion: -8, members: -6 },
                yearAdvance: 2,
                soundEffect: 'quiet',
              },
              weight: 4,
            },
          ],
        },
      ],
    },
    {
      id: 'bacaudae-uprising',
      era: 'fading',
      yearHint: 435,
      title: 'The Bacaudae Uprising',
      narrative:
        'Desperate peasants torch aristocratic villas outside Arles. Landowners demand a condemnation; deacons see refugees who need shelter.',
      sceneImage: '/assets/army_visits_town.png',
      sceneTitle: 'Garrisoned Plaza',
      sceneCaption:
        'Imperial cavalry assembles in the plaza as rumors of rebellion sweep through the city streets.',
      choices: [
        {
          id: 'bacaudae-condemn',
          label: 'Condemn the uprising and champion Roman order.',
          reflection: {
            prompt: 'Which relationship does this choice strengthen?',
            options: ['Patronage with elite households', 'Solidarity with refugees', 'Ties to rural peasants'],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'bacaudae-condemn-a',
                description:
                  'Senatorial families pledge funds for the basilica. Poor members whisper that the church has forgotten its roots.',
                effects: { resources: 6, cohesion: -12 },
                yearAdvance: 2,
                soundEffect: 'construction',
              },
              weight: 7,
            },
            {
              value: {
                id: 'bacaudae-condemn-b',
                description:
                  'Rumors of betrayal spread. A splinter cell forms a house church focusing on the poor.',
                effects: { cohesion: -18, members: -12 },
                yearAdvance: 1,
                soundEffect: 'quiet',
              },
              weight: 3,
            },
          ],
        },
        {
          id: 'bacaudae-relief',
          label: 'Fund relief for all victims—aristocrats and peasants alike.',
          reflection: {
            prompt: 'What cost accompanies this broad charity?',
            options: [
              'Financial strain and volunteer fatigue',
              'Imperial censure',
              'Loss of architectural plans',
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'bacaudae-relief-a',
                description:
                  'Your reputation for justice expands. Coffers dip, but new catechumens arrive from every class.',
                effects: { members: 14, resources: -8, cohesion: 4 },
                yearAdvance: 2,
                soundEffect: 'crowd',
              },
              weight: 6,
            },
            {
              value: {
                id: 'bacaudae-relief-b',
                description:
                  'A magistrate accuses you of aiding rebels. Weeks of inquiry exhaust deacons and delay the basilica.',
                effects: { cohesion: -6, resources: -6 },
                yearAdvance: 2,
                soundEffect: 'quiet',
              },
              weight: 4,
            },
          ],
        },
        {
          id: 'bacaudae-shelter',
          label: 'Shelter families quietly without taking a public stance.',
          reflection: {
            prompt: 'Why might neutrality be risky?',
            options: [
              'Hidden aid can look like conspiracy to officials.',
              'Refugees dislike private worship.',
              "It decreases the basilica's value.",
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'bacaudae-shelter-a',
                description:
                  'Refugees bless your care and spread word of discreet mercy. Local leaders respect your discretion.',
                effects: { cohesion: 10, members: 6 },
                yearAdvance: 2,
                soundEffect: 'quiet',
              },
              weight: 8,
            },
            {
              value: {
                id: 'bacaudae-shelter-b',
                description:
                  'Soldiers discover the shelter. An investigation freezes your accounts until innocence is proven.',
                effects: { resources: -10, cohesion: -4 },
                yearAdvance: 1,
                soundEffect: 'crowd',
              },
              weight: 2,
            },
          ],
        },
      ],
    },
    {
      id: 'granary-charity',
      era: 'imperial',
      yearHint: 332,
      title: 'Queues at the Granary',
      narrative:
        'A poor harvest sends villagers to your granary where deacons already feed widows. Local curiales ask you to ration food only to citizens.',
      sceneImage: '/assets/clergy_distributing_alms.png',
      sceneTitle: 'Alms Beneath the Colonnade',
      sceneCaption:
        'Cloaked clergy pass bread beneath a makeshift awning as officials watch for signs of unrest.',
      choices: [
        {
          id: 'granary-citizens',
          label: "Restrict aid to baptized citizens per the curiales' demand.",
          reflection: {
            prompt: 'What cost accompanies narrowing charity?',
            options: [
              'Excluding outsiders shrinks witness and trust.',
              'Roman law mandates citizen-first relief anyway.',
              'It violates imperial grain quotas.',
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'granary-citizens-a',
                description:
                  'Your order keeps peace with officials, yet petitioners leave bitter and restless.',
                effects: { influence: 4, cohesion: -10 },
                yearAdvance: 1,
                soundEffect: 'quiet',
              },
              weight: 6,
            },
            {
              value: {
                id: 'granary-citizens-b',
                description:
                  'Desperate families riot outside the basilica. Soldiers intervene and levy a fine.',
                effects: { cohesion: -12, resources: -6 },
                yearAdvance: 1,
                soundEffect: 'crowd',
              },
              weight: 4,
            },
          ],
        },
        {
          id: 'granary-open',
          label: 'Feed all who come until stores run dry.',
          reflection: {
            prompt: 'How might radical generosity advance the mission?',
            options: [
              'Mercy can draw seekers and soften officials.',
              'It guarantees tax exemptions in the province.',
              'It fulfills a new imperial edict.',
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'granary-open-a',
                description:
                  'Word of your open table spreads. Converts arrive, and benefactors quietly refill the bins.',
                effects: { members: 12, resources: -6, influence: 4 },
                yearAdvance: 2,
                soundEffect: 'crowd',
              },
              weight: 6,
            },
            {
              value: {
                id: 'granary-open-b',
                description:
                  'Supplies collapse faster than expected. Resentment brews when regular families return to empty shelves.',
                effects: { cohesion: -8, resources: -10 },
                yearAdvance: 1,
                soundEffect: 'quiet',
              },
              weight: 4,
            },
          ],
        },
        {
          id: 'granary-ledger',
          label: 'Create a shared ledger with curiales to track aid collaboratively.',
          reflection: {
            prompt: 'What makes shared administration attractive?',
            options: [
              'Transparency can build trust with civic leaders.',
              'It allows Rome to tax the church fairly.',
              'It keeps widows from attending vigils.',
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'granary-ledger-a',
                description:
                  'Civic partners admire your record keeping. Relief slows but remains steady, and new alliances form.',
                effects: { influence: 6, cohesion: 2, resources: -4 },
                yearAdvance: 2,
                soundEffect: 'construction',
              },
              weight: 7,
            },
            {
              value: {
                id: 'granary-ledger-b',
                description:
                  'The ledger becomes a tool for scrutiny. Officials demand veto power over your diaconate.',
                effects: { influence: -6, cohesion: -4 },
                yearAdvance: 1,
                soundEffect: 'quiet',
              },
              weight: 3,
            },
          ],
        },
      ],
    },
    {
      id: 'basilica-construction',
      era: 'imperial',
      yearHint: 347,
      title: 'Stone and Song',
      narrative:
        "Scaffolding surrounds the basilica as artisans carve capitals. Some urge borrowing heavily to finish before the emperor's envoy arrives.",
      sceneImage: '/assets/church_being_built.png',
      sceneTitle: 'Basilica Rising',
      sceneCaption:
        'Timber lattices climb the apse while choirs rehearse below, eager for a completed sanctuary.',
      choices: [
        {
          id: 'construction-accelerate',
          label: 'Borrow funds and accelerate construction to impress the envoy.',
          reflection: {
            prompt: 'Why is debt a dangerous tool for the church?',
            options: [
              'Credit can mortgage future ministry for present prestige.',
              'Loans guarantee imperial favor.',
              'Usury laws forbid Christians from borrowing.',
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'construction-accelerate-a',
                description:
                  "The basilica opens ahead of the envoy's visit. Crowds cheer, but repayments haunt your ledgers.",
                effects: { influence: 8, resources: -12 },
                yearAdvance: 2,
                soundEffect: 'construction',
              },
              weight: 6,
            },
            {
              value: {
                id: 'construction-accelerate-b',
                description:
                  'Unexpected storms halt work. Debt mounts without progress, souring spirits.',
                effects: { cohesion: -6, resources: -10 },
                yearAdvance: 1,
                soundEffect: 'quiet',
              },
              weight: 4,
            },
          ],
        },
        {
          id: 'construction-patient',
          label: "Advance at the community's pace using volunteer labor.",
          reflection: {
            prompt: 'What benefit comes from patient building?',
            options: [
              'Shared sacrifice deepens ownership of the basilica.',
              'Imperial auditors waive all taxes for slow builders.',
              'It prevents artisans from joining guilds.',
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'construction-patient-a',
                description:
                  'Progress is steady. Families bring food to workers, and the envoy praises your humility.',
                effects: { cohesion: 8, resources: -4 },
                yearAdvance: 3,
                soundEffect: 'chant',
              },
              weight: 7,
            },
            {
              value: {
                id: 'construction-patient-b',
                description:
                  'Volunteers burn out over months of labor. Momentum slows and disputes flare over design.',
                effects: { cohesion: -5, influence: -3 },
                yearAdvance: 2,
                soundEffect: 'quiet',
              },
              weight: 3,
            },
          ],
        },
        {
          id: 'construction-shift',
          label: 'Pause construction to fund schools and relief instead.',
          reflection: {
            prompt: 'How might redirecting funds affect perception?',
            options: [
              'It signals the basilica is a means, not the mission itself.',
              'It violates vows made to artisans.',
              'It disqualifies the church from imperial recognition.',
            ],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'construction-shift-a',
                description:
                  'Charity schools flourish while scaffolds stand still. Some nobles grumble, but families join for the teaching.',
                effects: { members: 10, influence: -4, resources: -6 },
                yearAdvance: 2,
                soundEffect: 'crowd',
              },
              weight: 5,
            },
            {
              value: {
                id: 'construction-shift-b',
                description:
                  'Redirected funds spark accusations of mismanagement. Donors halt gifts until construction resumes.',
                effects: { resources: -8, influence: -6 },
                yearAdvance: 2,
                soundEffect: 'quiet',
              },
              weight: 5,
            },
          ],
        },
      ],
    },
    {
      id: 'mission-outstations',
      era: 'founding',
      yearHint: 120,
      title: 'Mission to the Countryside',
      narrative:
        'Farmers from two hamlets invite teachers to visit monthly. You can spare only a few leaders — how do you structure outreach?',
      sceneImage: '/assets/procession.png',
      sceneTitle: 'Road to the Hamlets',
      sceneCaption:
        'A dusty path winds past vineyards as catechists discuss how to plant outstations without thinning the flock.',
      choices: [
        {
          id: 'outstations-rotating',
          label: 'Send a rotating pair of catechists each month.',
          reflection: {
            prompt: 'Why share the burden among many?',
            options: ['Prevents burnout and spreads skill.', 'Impresses magistrates on the road.', 'Avoids fasting obligations.'],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'outstations-rotating-a',
                description: 'New hearers gather under fig trees; two families seek baptism next season.',
                effects: { members: 14, cohesion: 2 },
                yearAdvance: 2,
                soundEffect: 'discussion',
                addTags: ['mission-rhythm'],
              },
              weight: 6,
            },
            {
              value: {
                id: 'outstations-rotating-b',
                description: 'Travel delays lessons. Still, goodwill grows along the road.',
                effects: { members: 8 },
                yearAdvance: 2,
                soundEffect: 'quiet',
              },
              weight: 4,
            },
          ],
        },
        {
          id: 'outstations-permanent',
          label: 'Plant a permanent outstation in one hamlet.',
          reflection: {
            prompt: 'What is the main risk of a permanent site?',
            options: ['It can drain leaders from the center.', 'Imperial inspectors seize such sites.', 'Hamlets forbid visitors.'],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'outstations-permanent-a',
                description: 'A stable gathering forms quickly; two elders step up to mentor locals.',
                effects: { members: 18, resources: -3 },
                yearAdvance: 3,
                soundEffect: 'discussion',
              },
              weight: 6,
            },
            {
              value: {
                id: 'outstations-permanent-b',
                description: 'The center feels thinly staffed. Some catechumens drift without attention.',
                effects: { cohesion: -6, members: -4 },
                yearAdvance: 2,
                soundEffect: 'quiet',
              },
              weight: 4,
            },
          ],
        },
      ],
    },
    {
      id: 'miracle-healing',
      era: 'crisis',
      yearHint: 251,
      title: 'Healing at the Font',
      narrative:
        'During a vigil for the sick, a child’s fever breaks at the baptistery. Word spreads quickly — some call it a miracle, others demand caution.',
      sceneImage: '/assets/baptism.png',
      sceneTitle: 'Vigil by the Font',
      sceneCaption:
        'Lamplight flickers on the waters as families weep for joy and wonder what it means.',
      choices: [
        {
          id: 'miracle-testify',
          label: 'Invite healed families to testify and offer catechesis.',
          reflection: {
            prompt: 'What is the pedagogical risk?',
            options: ['Spectacle can overshadow formation.', 'Miracles are illegal to proclaim.', 'It reduces alms.'],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'miracle-testify-a',
                description: 'Stories stir hearts, and many seek instruction with sober teaching alongside.',
                effects: { members: 36, cohesion: 4 },
                yearAdvance: 2,
                soundEffect: 'discussion',
                addTags: ['miracle-testimonies'],
              },
              weight: 7,
            },
            {
              value: {
                id: 'miracle-testify-b',
                description: 'Some chase signs rather than commitment; elders work to re-center prayer.',
                effects: { cohesion: -6, members: 10 },
                yearAdvance: 1,
                soundEffect: 'quiet',
              },
              weight: 3,
            },
          ],
        },
        {
          id: 'miracle-private',
          label: 'Keep the story private; emphasize thanksgiving and discipleship.',
          reflection: {
            prompt: 'How can hiddenness help here?',
            options: ['It roots joy in God, not fame.', 'It avoids imperial taxes.', 'It ensures better bread.'],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'miracle-private-a',
                description: 'Families grow deep; news still leaks out, drawing a few steady seekers.',
                effects: { members: 18, cohesion: 6 },
                yearAdvance: 2,
                soundEffect: 'quiet',
                addTags: ['quiet-devotion'],
              },
              weight: 6,
            },
            {
              value: {
                id: 'miracle-private-b',
                description: 'Skeptics mock the hush; a handful leave disappointed.',
                effects: { members: -6 },
                yearAdvance: 1,
                soundEffect: 'discussion',
              },
              weight: 4,
            },
          ],
        },
      ],
    },
    {
      id: 'mass-conversion-feast',
      era: 'imperial',
      yearHint: 335,
      title: 'Basilica Consecration Feast',
      narrative:
        'Crowds gather for the basilica’s consecration. City guilds, magistrates, and families attend. How do you welcome them?',
      sceneImage: '/assets/christians_celebrate_mass.png',
      sceneTitle: 'Consecration of the Nave',
      sceneCaption:
        'Incense curls through a packed nave as deacons prepare the table and visitors watch closely.',
      choices: [
        {
          id: 'feast-open-baptism',
          label: 'Offer open catechesis invitations and set a baptism date in six weeks.',
          requirements: { anyTags: ['quiet-devotion', 'public-witness-bold', 'miracle-testimonies'] },
          reflection: {
            prompt: 'Why schedule rather than instant baptisms?',
            options: ['Formation anchors enthusiasm.', 'Imperial edict requires delays.', 'It lowers water costs.'],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'feast-open-baptism-a',
                description: 'Hundreds sign the catechumen roll; many complete preparation and enter the water.',
                effects: { members: 120, cohesion: 6, influence: 6 },
                yearAdvance: 3,
                soundEffect: 'crowd',
                addTags: ['mass-catechumens'],
              },
              weight: 6,
            },
            {
              value: {
                id: 'feast-open-baptism-b',
                description: 'Enthusiasm is high but some drift away; still, many remain.',
                effects: { members: 80, cohesion: 2 },
                yearAdvance: 2,
                soundEffect: 'discussion',
              },
              weight: 4,
            },
          ],
        },
        {
          id: 'feast-exclusive',
          label: 'Keep the liturgy tight; welcome later via small groups only.',
          reflection: {
            prompt: 'What risk does exclusivity pose here?',
            options: ['Missed moment of public grace.', 'Imperial fines ensue.', 'Bishops forbid strangers.'],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'feast-exclusive-a',
                description: 'Core identity stays focused, but the city’s opening cools.',
                effects: { members: 18, cohesion: 8 },
                yearAdvance: 2,
                soundEffect: 'quiet',
              },
              weight: 6,
            },
          ],
        },
      ],
    },
    {
      id: 'unify-rival-church',
      era: 'fading',
      yearHint: 419,
      title: 'Unification with a Rival Church',
      narrative:
        'A nearby congregation split decades ago over discipline. With new pressures at the gates, their presbyter seeks reunion. Terms matter.',
      sceneImage: '/assets/christians_celebrate_mass.png',
      sceneTitle: 'Pacts at the Altar',
      sceneCaption:
        'Elders from both flocks meet under the apse, scrolls in hand, while families watch with hope and fear.',
      choices: [
        {
          id: 'unify-mutual-pastoral',
          label: 'Draft a mutual rule of life and shared leadership.',
          reflection: {
            prompt: 'Why write a shared rule?',
            options: ['Clarity guards unity over time.', 'Imperial law demands it.', 'It reduces fasting days.'],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'unify-mutual-pastoral-a',
                description: 'The pact heals memories; families rejoin and the nave fills afresh.',
                effects: { members: 150, cohesion: 12, influence: 6 },
                yearAdvance: 3,
                soundEffect: 'discussion',
                addTags: ['unity-pact'],
              },
              weight: 7,
            },
            {
              value: {
                id: 'unify-mutual-pastoral-b',
                description: 'Some old wounds reopen; still, most accept the new rule.',
                effects: { members: 60, cohesion: -4 },
                yearAdvance: 2,
                soundEffect: 'quiet',
              },
              weight: 3,
            },
          ],
        },
        {
          id: 'unify-absorb',
          label: 'Absorb them under your elders with minimal negotiation.',
          reflection: {
            prompt: 'What backlash could follow?',
            options: ['Perceived conquest can fracture unity.', 'Imperial fines follow.', 'Merchants boycott bread.'],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'unify-absorb-a',
                description: 'A minority resists and leaves; numbers swell but fault lines remain.',
                effects: { members: 90, cohesion: -10 },
                yearAdvance: 2,
                soundEffect: 'discussion',
              },
              weight: 6,
            },
          ],
        },
      ],
    },
    {
      id: 'refugees-influx',
      era: 'fading',
      yearHint: 423,
      title: 'Refugees from the North',
      narrative:
        'Displaced families flee violence and arrive at your doors. Hospitality could transform the flock — or strain it.',
      sceneImage: '/assets/army_visits_town.png',
      sceneTitle: 'Families at the Gate',
      sceneCaption:
        'Carts creak under bundles as children peer at the basilica doors.',
      choices: [
        {
          id: 'refugees-settle',
          label: 'Settle families with sponsors and weekly meals.',
          reflection: {
            prompt: 'What tension does this create?',
            options: ['Resources may sag before gratitude grows.', 'Imperial taxes spike instantly.', 'It bars locals from worship.'],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'refugees-settle-a',
                description: 'Sponsors step up; stories spread and many stay.',
                effects: { members: 70, resources: -12, cohesion: 4 },
                yearAdvance: 3,
                soundEffect: 'discussion',
                addTags: ['refugee-network'],
              },
              weight: 7,
            },
            {
              value: {
                id: 'refugees-settle-b',
                description: 'Supplies thin; a few families move on. Still, kinship deepens.',
                effects: { members: 30, resources: -8, cohesion: 2 },
                yearAdvance: 2,
                soundEffect: 'quiet',
              },
              weight: 3,
            },
          ],
        },
        {
          id: 'refugees-redirect',
          label: 'Redirect to civic aid with letters of support.',
          reflection: {
            prompt: 'What is the risk of redirection?',
            options: ['Witness may look thin when care is needed.', 'Magistrates will outlaw the church.', 'Bread prices always rise.'],
            correctIndex: 0,
          },
          outcomes: [
            {
              value: {
                id: 'refugees-redirect-a',
                description: 'Civic aid helps some; others return to ask for more personal care.',
                effects: { influence: 4, cohesion: -4 },
                yearAdvance: 1,
                soundEffect: 'discussion',
              },
              weight: 6,
            },
          ],
        },
      ],
    },
  ],
}

export type GameClock = {
  currentYear: number
  eventsResolved: Set<string>
}

const eraOrder: GameEvent['era'][] = ['founding', 'crisis', 'imperial', 'fading']

function eraForYear(year: number): GameEvent['era'] {
  // Target ranges:
  // founding:   100–199
  // crisis:     200–312
  // imperial:   313–429
  // fading:     430–500
  if (year < 200) return 'founding'
  if (year < 313) return 'crisis'
  if (year < 430) return 'imperial'
  return 'fading'
}

export function drawEvent(
  deck: GameDeck,
  clock: GameClock,
  seed: number = Date.now(),
): GameEvent | null {
  const introEvent = deck.events.find(
    (event) => event.isIntro && !clock.eventsResolved.has(event.id),
  )
  if (introEvent) {
    return introEvent
  }

  const rng = createSeededRng(seed)
  const yearEra = eraForYear(clock.currentYear)
  // Progression guard: match actual event distribution per era
  // Founding: 4 events (0-3), Crisis: 6 events (4-9), Imperial: 5 events (10-14), Fading: 8 events (15+)
  const count = clock.eventsResolved.size
  const progressionEra: GameEvent['era'] =
    count < 4 ? 'founding' : count < 10 ? 'crisis' : count < 15 ? 'imperial' : 'fading'
  // Constrain by year: do not progress to a later era than the current year window
  const era =
    eraOrder.indexOf(progressionEra) > eraOrder.indexOf(yearEra) ? yearEra : progressionEra

  console.log('[drawEvent]', {
    year: clock.currentYear,
    count,
    yearEra,
    progressionEra,
    finalEra: era,
  })

  const unused = deck.events.filter(
    (event) => event.era === era && !clock.eventsResolved.has(event.id),
  )

  console.log(`[drawEvent] Found ${unused.length} unused ${era} events`)
  if (unused.length === 0) {
    // Current era exhausted - try all subsequent eras until we find available events
    // This ensures we can progress through all eras even if years haven't caught up
    const currentIndex = eraOrder.indexOf(era)
    console.log(`[drawEvent] Era ${era} exhausted, checking subsequent eras...`)

    for (let i = currentIndex + 1; i < eraOrder.length; i++) {
      const candidateEra = eraOrder[i]
      const candidateEvents = deck.events.filter(
        (event) => event.era === candidateEra && !clock.eventsResolved.has(event.id),
      )
      console.log(`[drawEvent] Checking ${candidateEra}: found ${candidateEvents.length} events`)
      if (candidateEvents.length > 0) {
        console.log(`[drawEvent] Returning event from ${candidateEra}`)
        return candidateEvents[Math.floor(rng() * candidateEvents.length)]
      }
    }

    // No more events available in any era - game should end
    console.log('[drawEvent] No more events in any era, returning null')
    return null
  }

  return unused[Math.floor(rng() * unused.length)]
}

export function getImperialStatus(year: number) {
  // Align with era windows above
  if (year < 200) return 'Localized Suspicion'
  if (year < 313) return 'Localized Persecution'
  if (year < 430) return 'Imperial Favor'
  return 'Provincial Integration'
}
