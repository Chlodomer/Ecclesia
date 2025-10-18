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
  playTheme: () => void
  stopTheme: () => void
  prime: () => void
  effectsEnabled: boolean
  setEffectsEnabled: (value: boolean) => void
  effectsVolume: number
  setEffectsVolume: (value: number) => void
  themeEnabled: boolean
  setThemeEnabled: (value: boolean) => void
  themeVolume: number
  setThemeVolume: (value: number) => void
}

const noop = () => {}

const SoundscapeContext = createContext<SoundscapeContextValue>({
  playEffect: noop,
  playTheme: noop,
  stopTheme: noop,
  prime: noop,
  effectsEnabled: true,
  setEffectsEnabled: noop,
  effectsVolume: 0.75,
  setEffectsVolume: noop,
  themeEnabled: true,
  setThemeEnabled: noop,
  themeVolume: 0.6,
  setThemeVolume: noop,
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
  const [themeEnabled, setThemeEnabled] = useState(true)
  const [themeVolume, setThemeVolume] = useState(0.6)
  const bufferCache = useRef<Map<string, Promise<AudioBuffer>>>(new Map())

  const ensureContext = useCallback(() => {
    const ctor = getAudioContextConstructor()
    if (!ctor) return null
    if (!audioRef.current) {
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
    const ctx = ensureContext()
    if (!ctx) return
    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => {})
    }
  }, [ensureContext])

  const playEffect = useCallback(
    (cue: SoundCue) => {
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
        const osc = ctx.createOscillator()
        osc.type = 'square'
        osc.frequency.setValueAtTime(880, now)
        const gain = ctx.createGain()
        gain.gain.setValueAtTime(0, now)
        gain.gain.linearRampToValueAtTime(0.28 * normalizedVolume, now + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.2)
        osc.addEventListener('ended', () => {
          gain.disconnect()
        })
        return
      }

      const pool = SOUND_MANIFEST[cue] ?? []
      if (pool.length === 0) {
        const master = ctx.createGain()
        const baseVolume =
          (cue === 'violence' ? 0.7 : cue === 'construction' ? 0.55 : cue === 'quiet' ? 0.25 : 0.35) *
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
        (cue === 'violence' ? 0.75 : cue === 'construction' ? 0.6 : 0.4) * normalizedVolume
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

  const stopTheme = useCallback(() => {
    const state = themeRef.current
    if (!state) return
    const { master, source } = state
    const ctx = master.context
    const now = ctx.currentTime
    master.gain.cancelScheduledValues(now)
    master.gain.linearRampToValueAtTime(0.0001, now + 1)
    source.stop(now + 1.05)
    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        try {
          master.disconnect()
        } catch {
          // ignore disconnect errors if already detached
        }
      }, 1300)
    }
    themeRef.current = null
  }, [])

  const playTheme = useCallback(() => {
    if (!themeEnabled) return
    const ctx = ensureContext()
    if (!ctx) return
    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => {})
    }

    const normalized = Math.max(0, Math.min(1, themeVolume))
    if (normalized === 0) {
      stopTheme()
      return
    }

    const existing = themeRef.current
    if (existing) {
      const now = ctx.currentTime
      const { master } = existing
      master.gain.cancelScheduledValues(now)
      master.gain.linearRampToValueAtTime(0.14 * normalized, now + 0.6)
      return
    }

    const master = ctx.createGain()
    master.gain.setValueAtTime(0, ctx.currentTime)
    master.connect(ctx.destination)

    loadBuffer(ctx, THEME_TRACK)
      .then((buffer) => {
        const source = ctx.createBufferSource()
        source.buffer = buffer
        source.loop = true
        source.connect(master)
        source.start(ctx.currentTime)
        themeRef.current = { master, source, buffer }
        master.gain.linearRampToValueAtTime(0.14 * normalized, ctx.currentTime + 2.2)
      })
      .catch((error) => {
        console.error('Failed to start theme audio', error)
        master.disconnect()
      })
  }, [ensureContext, loadBuffer, stopTheme, themeEnabled, themeVolume])

  useEffect(() => {
    return () => {
      stopTheme()
      const ctx = audioRef.current
      if (ctx) {
        ctx.close().catch(() => {})
      }
    }
  }, [stopTheme])

  const value = useMemo(
    () => ({
      playEffect,
      playTheme,
      stopTheme,
      prime,
      effectsEnabled,
      setEffectsEnabled,
      effectsVolume,
      setEffectsVolume,
      themeEnabled,
      setThemeEnabled,
      themeVolume,
      setThemeVolume,
    }),
    [
      playEffect,
      playTheme,
      stopTheme,
      prime,
      effectsEnabled,
      effectsVolume,
      themeEnabled,
      themeVolume,
      setEffectsEnabled,
      setEffectsVolume,
      setThemeEnabled,
      setThemeVolume,
    ],
  )

  useEffect(() => {
    if (!themeEnabled) {
      stopTheme()
      return
    }

    if (themeRef.current) {
      const { master } = themeRef.current
      const ctx = master.context
      const now = ctx.currentTime
      const normalized = Math.max(0, Math.min(1, themeVolume))
      master.gain.cancelScheduledValues(now)
      master.gain.linearRampToValueAtTime(0.14 * normalized, now + 0.4)
    } else {
      playTheme()
    }
  }, [themeEnabled, themeVolume, playTheme, stopTheme])

  return <SoundscapeContext.Provider value={value}>{children}</SoundscapeContext.Provider>
}

export function useSoundscape() {
  return useContext(SoundscapeContext)
}
