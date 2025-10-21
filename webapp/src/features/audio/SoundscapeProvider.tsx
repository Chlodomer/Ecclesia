import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import type { SoundCue } from '@/lib/sound'
import { SOUND_MANIFEST, THEME_TRACK } from '@/lib/soundManifest'

type ThemeState = {
  master: GainNode
  source: AudioBufferSourceNode
  buffer: AudioBuffer
}

type SoundscapeContextValue = {
  playEffect: (cue: SoundCue) => void
  playUi: () => void
  playTheme: () => void
  stopTheme: () => void
  stopThemeHard: () => void
  prime: () => Promise<void>
  effectsEnabled: boolean
  setEffectsEnabled: (value: boolean) => void
  effectsVolume: number
  setEffectsVolume: (value: number) => void
  themeEnabled: boolean
  setThemeEnabled: (value: boolean) => void
  themeVolume: number
  setThemeVolume: (value: number) => void
  isUnlocked: boolean
}

const noop = () => {}

const SoundscapeContext = createContext<SoundscapeContextValue>({
  playEffect: noop,
  playUi: noop,
  playTheme: noop,
  stopTheme: noop,
  stopThemeHard: noop,
  prime: () => {},
  effectsEnabled: true,
  setEffectsEnabled: noop,
  effectsVolume: 0.75,
  setEffectsVolume: noop,
  themeEnabled: true,
  setThemeEnabled: noop,
  themeVolume: 0.6,
  setThemeVolume: noop,
  isUnlocked: false,
})

function getAudioContextConstructor() {
  if (typeof window === 'undefined') return null
  const ctor =
    window.AudioContext ??
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext ??
    null
  return ctor
}

type SoundscapeProviderProps = {
  children: ReactNode
}

export function SoundscapeProvider({ children }: SoundscapeProviderProps) {
  const audioRef = useRef<AudioContext | null>(null)
  const themeRef = useRef<ThemeState | null>(null)
  const [effectsEnabled, setEffectsEnabled] = useState(true)
  const [effectsVolume, setEffectsVolume] = useState(0.75)
  const [themeEnabled, setThemeEnabled] = useState(false)
  const [themeVolume, setThemeVolume] = useState(0.6)
  const bufferCache = useRef<Map<string, Promise<AudioBuffer>>>(new Map())
  const [isUnlocked, setIsUnlocked] = useState(false)
  // Global switch: disable scenario SFX; only allow explicit UI clicks via playUi()
  const SFX_ENABLED = false

  const ensureContext = useCallback(() => {
    const ctor = getAudioContextConstructor()
    if (!ctor) return null
    if (!audioRef.current || audioRef.current.state === 'closed') {
      console.log('[Audio] Creating new AudioContext (previous was closed or null)')
      audioRef.current = new ctor()
    }
    return audioRef.current
  }, [])

  const loadBuffer = useCallback(
    (ctx: AudioContext, path: string) => {
      const existing = bufferCache.current.get(path)
      if (existing) return existing

      const promise = fetch(path)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to load audio asset: ${path}`)
          }
          return response.arrayBuffer()
        })
        .then((arrayBuffer) => ctx.decodeAudioData(arrayBuffer))
        .catch((error) => {
          console.error(error)
          bufferCache.current.delete(path)
          throw error
        })

      bufferCache.current.set(path, promise)
      return promise
    },
    [],
  )

  const createNoiseBuffer = useCallback((ctx: AudioContext, duration: number) => {
    const length = Math.max(1, Math.floor(ctx.sampleRate * duration))
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let index = 0; index < length; index += 1) {
      data[index] = Math.random() * 2 - 1
    }
    return buffer
  }, [])

  const prime = useCallback(() => {
    console.log('[Audio] prime() called')
    const ctx = ensureContext()
    if (!ctx) {
      console.log('[Audio] prime: no context available')
      return
    }
    console.log('[Audio] prime: context state is', ctx.state)
    if (ctx.state === 'suspended') {
      console.log('[Audio] prime: attempting to resume context')
      ctx
        .resume()
        .then(() => {
          console.log('[Audio] prime: context resumed successfully')
          setIsUnlocked(true)
        })
        .catch((error) => {
          console.error('[Audio] prime: failed to resume context', error)
        })
      return
    }
    console.log('[Audio] prime: context already running, setting unlocked=true')
    setIsUnlocked(true)
  }, [ensureContext])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleFirstGesture = () => {
      prime()
    }

    window.addEventListener('pointerdown', handleFirstGesture, { once: true })
    window.addEventListener('keydown', handleFirstGesture, { once: true })

    return () => {
      window.removeEventListener('pointerdown', handleFirstGesture)
      window.removeEventListener('keydown', handleFirstGesture)
    }
  }, [prime])

  const playEffect = useCallback(
    (cue: SoundCue) => {
      // All scenario cues disabled per request
      if (!SFX_ENABLED) return
      if (!effectsEnabled) return
      const normalizedVolume = Math.max(0, Math.min(1, effectsVolume))
      if (normalizedVolume === 0) return
      const ctx = ensureContext()
      if (!ctx) return
      if (ctx.state === 'suspended') {
        void ctx.resume().catch(() => {})
      }

      const now = ctx.currentTime

      if (cue === 'ui') {
        // Pleasant click sound - two-tone with smooth envelope
        const osc1 = ctx.createOscillator()
        const osc2 = ctx.createOscillator()
        osc1.type = 'sine'
        osc2.type = 'sine'
        osc1.frequency.setValueAtTime(1200, now)
        osc2.frequency.setValueAtTime(800, now)

        const gain = ctx.createGain()
        gain.gain.setValueAtTime(0, now)
        gain.gain.linearRampToValueAtTime(0.15 * normalizedVolume, now + 0.005)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08)

        osc1.connect(gain)
        osc2.connect(gain)
        gain.connect(ctx.destination)
        osc1.start(now)
        osc2.start(now)
        osc1.stop(now + 0.1)
        osc2.stop(now + 0.1)
        osc1.addEventListener('ended', () => {
          gain.disconnect()
        })
        return
      }

      const pool = SOUND_MANIFEST[cue] ?? []
      if (pool.length === 0) {
        const master = ctx.createGain()
        const baseVolume =
          (cue === 'violence' ? 0.9 : cue === 'construction' ? 0.7 : cue === 'quiet' ? 0.35 : 0.5) *
          normalizedVolume
        master.gain.setValueAtTime(0, now)
        master.gain.linearRampToValueAtTime(baseVolume, now + 0.02)
        master.gain.exponentialRampToValueAtTime(0.0001, now + 2.5)
        master.connect(ctx.destination)

        const scheduleFallback = () => {
          switch (cue) {
            case 'chant': {
              const sustain = 2.4
              const freqs = [196, 246.94, 311]
              freqs.forEach((freq, index) => {
                const osc = ctx.createOscillator()
                osc.type = 'sine'
                osc.frequency.setValueAtTime(freq, now)
                osc.detune.setValueAtTime((index - 1) * 9, now)
                const gain = ctx.createGain()
                gain.gain.setValueAtTime(0.33, now)
                osc.connect(gain)
                gain.connect(master)
                osc.start(now)
                osc.stop(now + sustain)
                osc.addEventListener('ended', () => gain.disconnect())
              })
              break
            }
            case 'sermon': {
              const osc = ctx.createOscillator()
              const gain = ctx.createGain()
              osc.type = 'triangle'
              osc.frequency.setValueAtTime(210, now)
              const vibrato = ctx.createOscillator()
              const vibratoGain = ctx.createGain()
              vibrato.frequency.setValueAtTime(5.5, now)
              vibratoGain.gain.setValueAtTime(12, now)
              vibrato.connect(vibratoGain)
              vibratoGain.connect(osc.frequency)
              vibrato.start(now)
              vibrato.stop(now + 1.6)
              gain.gain.setValueAtTime(0, now)
              gain.gain.linearRampToValueAtTime(0.6, now + 0.15)
              gain.gain.linearRampToValueAtTime(0.25, now + 1)
              gain.gain.linearRampToValueAtTime(0.001, now + 1.6)
              osc.connect(gain)
              gain.connect(master)
              osc.start(now)
              osc.stop(now + 1.7)
              osc.addEventListener('ended', () => gain.disconnect())
              break
            }
            case 'construction': {
              const duration = 1
              const noiseSource = ctx.createBufferSource()
              noiseSource.buffer = createNoiseBuffer(ctx, duration)
              const filter = ctx.createBiquadFilter()
              filter.type = 'highpass'
              filter.frequency.setValueAtTime(1200, now)
              noiseSource.connect(filter)
              filter.connect(master)
              noiseSource.start(now)
              noiseSource.stop(now + duration)
              noiseSource.addEventListener('ended', () => filter.disconnect())

              const hammer = ctx.createOscillator()
              const hammerGain = ctx.createGain()
              hammer.type = 'square'
              hammer.frequency.setValueAtTime(120, now)
              hammerGain.gain.setValueAtTime(0.8, now)
              hammerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
              hammer.connect(hammerGain)
              hammerGain.connect(master)
              hammer.start(now)
              hammer.stop(now + 0.45)
              hammer.addEventListener('ended', () => hammerGain.disconnect())
              break
            }
            case 'crowd': {
              const source = ctx.createBufferSource()
              source.buffer = createNoiseBuffer(ctx, 2)
              const filter = ctx.createBiquadFilter()
              filter.type = 'bandpass'
              filter.frequency.setValueAtTime(420, now)
              filter.Q.setValueAtTime(0.9, now)
              source.connect(filter)
              filter.connect(master)
              source.start(now)
              source.stop(now + 2)
              source.addEventListener('ended', () => filter.disconnect())
              break
            }
            case 'discussion': {
              const source = ctx.createBufferSource()
              source.buffer = createNoiseBuffer(ctx, 1.5)
              const filter = ctx.createBiquadFilter()
              filter.type = 'bandpass'
              filter.frequency.setValueAtTime(520, now)
              filter.Q.setValueAtTime(1, now)
              source.connect(filter)
              filter.connect(master)
              source.start(now)
              source.stop(now + 1.5)
              source.addEventListener('ended', () => filter.disconnect())
              break
            }
            case 'violence': {
              const noiseSource = ctx.createBufferSource()
              noiseSource.buffer = createNoiseBuffer(ctx, 1)
              const filter = ctx.createBiquadFilter()
              filter.type = 'bandpass'
              filter.frequency.setValueAtTime(850, now)
              filter.Q.setValueAtTime(1.1, now)
              noiseSource.connect(filter)
              filter.connect(master)
              noiseSource.start(now)
              noiseSource.stop(now + 1)
              noiseSource.addEventListener('ended', () => filter.disconnect())

              const drum = ctx.createOscillator()
              const drumGain = ctx.createGain()
              drum.type = 'sine'
              drum.frequency.setValueAtTime(70, now)
              drum.frequency.exponentialRampToValueAtTime(40, now + 0.3)
              drumGain.gain.setValueAtTime(0.8, now)
              drumGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5)
              drum.connect(drumGain)
              drumGain.connect(master)
              drum.start(now)
              drum.stop(now + 0.55)
              drum.addEventListener('ended', () => drumGain.disconnect())
              break
            }
            case 'quiet':
            default: {
              const osc = ctx.createOscillator()
              const gain = ctx.createGain()
              osc.type = 'sine'
              osc.frequency.setValueAtTime(174, now)
              gain.gain.setValueAtTime(0.18, now)
              gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8)
              osc.connect(gain)
              gain.connect(master)
              osc.start(now)
              osc.stop(now + 2)
              osc.addEventListener('ended', () => gain.disconnect())
            }
          }
        }

        scheduleFallback()

        if (typeof window !== 'undefined') {
          window.setTimeout(() => {
            try {
              master.disconnect()
            } catch {
              // ignore
            }
          }, 2600)
        }
        return
      }

      const chosen = pool[Math.floor(Math.random() * pool.length)]
      const master = ctx.createGain()
      const baseVolume =
        (cue === 'violence' ? 1.0 : cue === 'construction' ? 0.8 : 0.6) * normalizedVolume
      master.gain.setValueAtTime(0, now)
      master.gain.linearRampToValueAtTime(baseVolume, now + 0.02)
      master.connect(ctx.destination)

      void loadBuffer(ctx, chosen)
        .then((buffer) => {
          const source = ctx.createBufferSource()
          source.buffer = buffer
          source.connect(master)
          source.start(now)
          source.stop(now + buffer.duration)
          source.addEventListener('ended', () => {
            master.disconnect()
          })
        })
        .catch(() => {
          master.disconnect()
        })
    },
    [ensureContext, effectsEnabled, effectsVolume, loadBuffer, createNoiseBuffer],
  )

  // Explicit UI click that bypasses the freeze for micro-overlays
  const playUi = useCallback(() => {
    const ctx = ensureContext()
    if (!ctx) return
    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => {})
    }
    const now = ctx.currentTime
    const gain = ctx.createGain()
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    osc1.type = 'sine'
    osc2.type = 'sine'
    osc1.frequency.setValueAtTime(1200, now)
    osc2.frequency.setValueAtTime(800, now)
    gain.gain.setValueAtTime(0, now)
    const base = Math.max(0, Math.min(1, effectsVolume))
    gain.gain.linearRampToValueAtTime(0.15 * base, now + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08)
    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)
    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + 0.1)
    osc2.stop(now + 0.1)
    osc1.addEventListener('ended', () => gain.disconnect())
  }, [ensureContext, effectsVolume])

  const stopTheme = useCallback(() => {
    const state = themeRef.current
    if (!state) return
    const { master, source } = state
    const ctx = master.context
    const now = ctx.currentTime

    // Fade out smoothly and stop after ~1.25s
    source.loop = false
    master.gain.cancelScheduledValues(now)
    master.gain.setValueAtTime(master.gain.value, now)
    master.gain.linearRampToValueAtTime(0.0001, now + 1.2)

    try {
      source.stop(now + 1.25)
    } catch {}

    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        try {
          master.disconnect()
        } catch {}
      }, 1400)
    }

    themeRef.current = null
  }, [])

  const stopThemeHard = useCallback(() => {
    const state = themeRef.current
    if (!state) return
    const { master, source } = state
    const ctx = master.context
    try {
      source.loop = false
      source.stop()
    } catch {}
    try {
      master.disconnect()
    } catch {}
    // Clear any scheduled ramps by setting immediate value
    try {
      const now = ctx.currentTime
      master.gain.cancelScheduledValues(now)
      master.gain.setValueAtTime(0, now)
    } catch {}
    themeRef.current = null
  }, [])

  const playTheme = useCallback(() => {
    // Theme music disabled globally
    return
  }, [])

  useEffect(() => {
    return () => {
      stopTheme()
      // Don't close the context - just stop playback
      // Closing prevents any future audio from playing
      // const ctx = audioRef.current
      // if (ctx) {
      //   ctx.close().catch(() => {})
      // }
    }
  }, [stopTheme])

  const value = useMemo(
    () => ({
      playEffect,
      playUi,
      playTheme,
      stopTheme,
      stopThemeHard,
      prime,
      effectsEnabled,
      setEffectsEnabled,
      effectsVolume,
      setEffectsVolume,
      themeEnabled,
      setThemeEnabled,
      themeVolume,
      setThemeVolume,
      isUnlocked,
    }),
    [
      playEffect,
      playUi,
      playTheme,
      stopTheme,
      stopThemeHard,
      prime,
      effectsEnabled,
      effectsVolume,
      themeEnabled,
      themeVolume,
      setEffectsEnabled,
      setEffectsVolume,
      setThemeEnabled,
      setThemeVolume,
      isUnlocked,
    ],
  )

  useEffect(() => {
    // Always stop if any theme was somehow started; do not auto-start
    stopTheme()
  }, [themeEnabled, themeVolume, stopTheme, isUnlocked, playTheme])

  return <SoundscapeContext.Provider value={value}>{children}</SoundscapeContext.Provider>
}

export function useSoundscape() {
  return useContext(SoundscapeContext)
}

// Debug: expose to window for testing
if (typeof window !== 'undefined') {
  ;(window as any).__debugAudio = {
    getContext: () => {
      const ctx = (window as any).AudioContext || (window as any).webkitAudioContext
      if (!ctx) return null
      return new ctx()
    },
    playTestTone: () => {
      const ctx = (window as any).AudioContext || (window as any).webkitAudioContext
      if (!ctx) {
        console.error('No AudioContext available')
        return
      }
      const audioCtx = new ctx()
      console.log('[Debug] Audio context state:', audioCtx.state)
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
          console.log('[Debug] Context resumed')
          playTone(audioCtx)
        })
      } else {
        playTone(audioCtx)
      }

      function playTone(ctx: AudioContext) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.frequency.value = 440
        gain.gain.value = 0.3
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.5)
        console.log('[Debug] Test tone playing')
      }
    },
    checkAudioState: () => {
      console.log('[Debug] Checking all audio state...')
      console.log('[Debug] document.querySelectorAll("audio"):', document.querySelectorAll('audio'))
      console.log('[Debug] Number of audio elements:', document.querySelectorAll('audio').length)

      // Check for AudioBufferSourceNode in the page
      const allElements = document.querySelectorAll('*')
      console.log('[Debug] Total DOM elements:', allElements.length)

      return {
        audioElements: document.querySelectorAll('audio').length,
        totalElements: allElements.length
      }
    }
  }
}
