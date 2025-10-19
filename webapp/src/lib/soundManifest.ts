import type { SoundCue } from './sound'

export const SOUND_MANIFEST: Record<SoundCue, string[]> = {
  chant: [
    '/sounds/chant/church_bell_ringing.mp3',
    '/sounds/chant/church_bell_single.mp3',
    '/sounds/chant/church_bells_medieval.mp3',
    '/sounds/chant/gregorian_chant_01.mp3',
    '/sounds/chant/gregorian_chant_03.mp3',
  ],
  sermon: [
    '/sounds/sermon/announcement_tone.mp3',
    '/sounds/chant/church_bell_single.mp3',
    '/sounds/chant/church_bell_ringing.mp3',
  ],
  crowd: [
    '/sounds/crowd/crowd_talking.mp3',
    '/sounds/crowd/crowd_talking_soundjay.mp3',
    '/sounds/crowd/crowd_talking_2_soundjay.mp3',
    '/sounds/crowd/people_talking.mp3',
    '/sounds/crowd/street_crowd.mp3',
  ],
  discussion: [
    '/sounds/discussion/people_murmur.mp3',
    '/sounds/discussion/crowd_noise.mp3',
  ],
  construction: [
    '/sounds/construction/construction_site.mp3',
    '/sounds/construction/hammer_wood.mp3',
  ],
  quiet: [
    '/sounds/quiet/nature_peaceful.mp3',
    '/sounds/quiet/forest_ambient.mp3',
  ],
  violence: [
    '/sounds/violence/sword_fight.mp3',
  ],
  ui: [],
}

export const THEME_TRACK = '/Ecclesia_Audio_Preview/Theme/Ecclesia_ The Quest Begins.mp3'
