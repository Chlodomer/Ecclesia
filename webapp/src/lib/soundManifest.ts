import type { SoundCue } from './sound'

export const SOUND_MANIFEST: Record<SoundCue, string[]> = {
  chant: [
    '/sounds/chant/church_bell_ringing.mp3',
    '/sounds/chant/church_bell_single.mp3',
    '/sounds/chant/church_bells_medieval.mp3',
  ],
  sermon: [
    '/sounds/chant/church_bell_single.mp3',
    '/sounds/chant/church_bell_ringing.mp3',
  ],
  crowd: [],
  discussion: [],
  construction: [],
  quiet: [],
  violence: [],
  ui: [],
}

export const THEME_TRACK = '/sounds/chant/church_bells_medieval.mp3'
