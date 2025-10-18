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
                soundEffect: 'chant',
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
      era: 'imperial',
      yearHint: 395,
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
  const introEvent = deck.events.find(
    (event) => event.isIntro && !clock.eventsResolved.has(event.id),
  )
  if (introEvent) {
    return introEvent
  }

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
