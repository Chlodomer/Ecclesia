import { pickWeightedOption, type WeightedOption, createSeededRng } from '@/lib/random'

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
  soundEffect?: 'chant' | 'construction' | 'crowd' | 'quiet'
}

export type EventChoice = {
  id: string
  label: string
  reflection: ReflectionPrompt | null
  outcomes: WeightedOption<EventOutcome>[]
}

export type GameEvent = {
  id: string
  era: 'founding' | 'crisis' | 'imperial'
  yearHint: number
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

const sceneImage = '/assets/scene-overview.png'

export const baseDeck: GameDeck = {
  initialYear: 112,
  events: [
    {
      id: 'founding-agape',
      era: 'founding',
      yearHint: 112,
      title: 'Who Joins the Table?',
      narrative:
        'Merchants from Massilia offer to host a public agape feast if the community will bless their caravans. Elders worry it blurs the line between sacrament and spectacle.',
      sceneImage,
      sceneTitle: 'The Olive Court',
      sceneCaption:
        'Stone walls keep the summer heat at bay while elders debate whether hospitality risks imperial attention.',
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
                soundEffect: 'chant',
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
                soundEffect: 'quiet',
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
                soundEffect: 'crowd',
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
      sceneImage,
      sceneTitle: 'Twilight Vigil',
      sceneCaption:
        'Lanterns throw long shadows across the half-built basilica as debates rise about beauty and truth.',
      choices: [
        {
          id: 'gnostic-dismiss',
          label: 'Excommunicate Marcus and denounce his teachings.',
          reflection: {
            prompt: 'What motivates the sharp response?',
            options: [
              'Protecting doctrinal cohesion in a fragile season.',
              'Desire for imperial approval.',
              'Jealousy over Marcus’s musical skill.',
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
                soundEffect: 'quiet',
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
                soundEffect: 'quiet',
              },
              weight: 5,
            },
          ],
        },
      ],
    },
    {
      id: 'bacaudae-uprising',
      era: 'imperial',
      yearHint: 390,
      title: 'The Bacaudae Uprising',
      narrative:
        'Desperate peasants torch aristocratic villas outside Arles. Landowners demand a condemnation; deacons see refugees who need shelter.',
      sceneImage,
      sceneTitle: 'Consecration Morning',
      sceneCaption:
        'The basilica is nearly complete, yet smoke on the horizon reminds everyone of the fragile peace.',
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
              'It decreases the basilica’s value.',
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
  ],
}

export type GameClock = {
  currentYear: number
  eventsResolved: Set<string>
}

const eraOrder: GameEvent['era'][] = ['founding', 'crisis', 'imperial']

function eraForYear(year: number): GameEvent['era'] {
  if (year < 160) return 'founding'
  if (year < 313) return 'crisis'
  return 'imperial'
}

export function drawEvent(
  deck: GameDeck,
  clock: GameClock,
  seed: number = Date.now(),
): GameEvent | null {
  const rng = createSeededRng(seed)
  const era = eraForYear(clock.currentYear)

  const unused = deck.events.filter(
    (event) => event.era === era && !clock.eventsResolved.has(event.id),
  )
  if (unused.length === 0) {
    const nextEraIndex = eraOrder.indexOf(era) + 1
    const fallbackEra = nextEraIndex < eraOrder.length ? eraOrder[nextEraIndex]! : era
    const fallback = deck.events.filter(
      (event) => event.era === fallbackEra && !clock.eventsResolved.has(event.id),
    )
    if (fallback.length === 0) return null
    return fallback[Math.floor(rng() * fallback.length)]
  }

  return unused[Math.floor(rng() * unused.length)]
}

export function getImperialStatus(year: number) {
  if (year < 150) return 'Localized Suspicion'
  if (year < 250) return 'Localized Persecution'
  if (year < 313) return 'Anxious Tolerance'
  if (year < 380) return 'Imperial Favor'
  return 'Provincial Integration'
}
