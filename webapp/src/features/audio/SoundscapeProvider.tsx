import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react'

import type { SoundCue } from '@/lib/sound'

type ThemeState = {
  master: GainNode
  oscillators: OscillatorNode[]
  lfos: OscillatorNode[]
}

type SoundscapeContextValue = {
  playEffect: (cue: SoundCue) => void
  playTheme: () => void
  stopTheme: () => void
  prime: () => void
}

const noop = () => {}

const SoundscapeContext = createContext<SoundscapeContextValue>({
  playEffect: noop,
  playTheme: noop,
  stopTheme: noop,
  prime: noop,
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

function createNoiseBuffer(ctx: AudioContext, duration: number) {
  const length = Math.max(1, Math.floor(ctx.sampleRate * duration))
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let index = 0; index < length; index += 1) {
    data[index] = Math.random() * 2 - 1
  }
  return buffer
}

function scheduleChant(ctx: AudioContext, destination: GainNode, startTime: number) {
  const sustain = 1.8
  const freqs = [196, 246.94, 311]
  freqs.forEach((freq, index) => {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, startTime)
    osc.detune.setValueAtTime((index - 1) * 8, startTime)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(1 / freqs.length, startTime)
    osc.connect(gain)
    gain.connect(destination)
    osc.start(startTime)
    osc.stop(startTime + sustain)
  })
}

function scheduleSermon(ctx: AudioContext, destination: GainNode, startTime: number) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(210, startTime)
  const vibrato = ctx.createOscillator()
  const vibratoGain = ctx.createGain()
  vibrato.frequency.setValueAtTime(5.5, startTime)
  vibratoGain.gain.setValueAtTime(12, startTime)
  vibrato.connect(vibratoGain)
  vibratoGain.connect(osc.frequency)
  vibrato.start(startTime)
  vibrato.stop(startTime + 1.6)

  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(0.7, startTime + 0.2)
  gain.gain.linearRampToValueAtTime(0.3, startTime + 1)
  gain.gain.linearRampToValueAtTime(0, startTime + 1.7)

  osc.connect(gain)
  gain.connect(destination)
  osc.start(startTime)
  osc.stop(startTime + 1.7)
}

function scheduleConstruction(ctx: AudioContext, destination: GainNode, startTime: number) {
  const duration = 0.9
  const noiseSource = ctx.createBufferSource()
  noiseSource.buffer = createNoiseBuffer(ctx, duration)
  const filter = ctx.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.setValueAtTime(1400, startTime)
  noiseSource.connect(filter)
  filter.connect(destination)
  noiseSource.start(startTime)
  noiseSource.stop(startTime + duration)

  const hammer = ctx.createOscillator()
  const hammerGain = ctx.createGain()
  hammer.type = 'square'
  hammer.frequency.setValueAtTime(110, startTime)
  hammerGain.gain.setValueAtTime(0.8, startTime)
  hammerGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.55)
  hammer.connect(hammerGain)
  hammerGain.connect(destination)
  hammer.start(startTime)
  hammer.stop(startTime + 0.6)
}

function scheduleCrowd(ctx: AudioContext, destination: GainNode, startTime: number, duration = 2) {
  const source = ctx.createBufferSource()
  source.buffer = createNoiseBuffer(ctx, duration)
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(420, startTime)
  filter.Q.setValueAtTime(0.9, startTime)
  source.connect(filter)
  filter.connect(destination)
  source.start(startTime)
  source.stop(startTime + duration)
}

function scheduleDiscussion(ctx: AudioContext, destination: GainNode, startTime: number) {
  const duration = 1.5
  scheduleCrowd(ctx, destination, startTime, duration)
}

function scheduleViolence(ctx: AudioContext, destination: GainNode, startTime: number) {
  const duration = 1.1
  const noiseSource = ctx.createBufferSource()
  noiseSource.buffer = createNoiseBuffer(ctx, duration)
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(850, startTime)
  filter.Q.setValueAtTime(1.1, startTime)
  noiseSource.connect(filter)
  filter.connect(destination)
  noiseSource.start(startTime)
  noiseSource.stop(startTime + duration)

  const drum = ctx.createOscillator()
  const drumGain = ctx.createGain()
  drum.type = 'sine'
  drum.frequency.setValueAtTime(65, startTime)
  drum.frequency.exponentialRampToValueAtTime(42, startTime + 0.4)
  drumGain.gain.setValueAtTime(0.9, startTime)
  drumGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.7)
  drum.connect(drumGain)
  drumGain.connect(destination)
  drum.start(startTime)
  drum.stop(startTime + 0.75)
}

function scheduleQuiet(ctx: AudioContext, destination: GainNode, startTime: number) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(174, startTime)
  gain.gain.setValueAtTime(0.15, startTime)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.4)
  osc.connect(gain)
  gain.connect(destination)
  osc.start(startTime)
  osc.stop(startTime + 1.5)
}

type SoundscapeProviderProps = {
  children: ReactNode
}

export function SoundscapeProvider({ children }: SoundscapeProviderProps) {
  const audioRef = useRef<AudioContext | null>(null)
  const themeRef = useRef<ThemeState | null>(null)

  const ensureContext = useCallback(() => {
    const ctor = getAudioContextConstructor()
    if (!ctor) return null
    if (!audioRef.current) {
      audioRef.current = new ctor()
    }
    return audioRef.current
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
      const ctx = ensureContext()
      if (!ctx) return
      if (ctx.state === 'suspended') {
        void ctx.resume().catch(() => {})
      }

      const now = ctx.currentTime
      const master = ctx.createGain()
      const baseVolume = cue === 'violence' ? 0.65 : cue === 'construction' ? 0.55 : 0.35
      master.gain.setValueAtTime(0, now)
      master.gain.linearRampToValueAtTime(baseVolume, now + 0.03)
      master.gain.exponentialRampToValueAtTime(0.0001, now + 2.4)
      master.connect(ctx.destination)

      switch (cue) {
        case 'chant':
          scheduleChant(ctx, master, now)
          break
        case 'sermon':
          scheduleSermon(ctx, master, now)
          break
        case 'construction':
          scheduleConstruction(ctx, master, now)
          break
        case 'crowd':
          scheduleCrowd(ctx, master, now)
          break
        case 'discussion':
          scheduleDiscussion(ctx, master, now)
          break
        case 'violence':
          scheduleViolence(ctx, master, now)
          break
        case 'quiet':
        default:
          scheduleQuiet(ctx, master, now)
          break
      }

      if (typeof window !== 'undefined') {
        window.setTimeout(() => {
          try {
            master.disconnect()
          } catch {
            // ignore disconnect errors caused by already-released nodes
          }
        }, 2600)
      }
    },
    [ensureContext],
  )

  const playTheme = useCallback(() => {
    const ctx = ensureContext()
    if (!ctx) return
    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => {})
    }

    if (themeRef.current) {
      const now = ctx.currentTime
      const { master } = themeRef.current
      master.gain.cancelScheduledValues(now)
      master.gain.linearRampToValueAtTime(0.14, now + 0.6)
      return
    }

    const master = ctx.createGain()
    master.gain.setValueAtTime(0, ctx.currentTime)
    master.connect(ctx.destination)

    const freqs = [164.81, 207.65, 246.94]
    const lfos: OscillatorNode[] = []
    const oscillators = freqs.map((freq, index) => {
      const osc = ctx.createOscillator()
      osc.type = index === 0 ? 'sine' : 'triangle'
      osc.frequency.setValueAtTime(freq, ctx.currentTime)
      const lfo = ctx.createOscillator()
      const lfoGain = ctx.createGain()
      lfo.frequency.setValueAtTime(0.2 + index * 0.1, ctx.currentTime)
      lfoGain.gain.setValueAtTime(3 + index * 2, ctx.currentTime)
      lfo.connect(lfoGain)
      lfoGain.connect(osc.frequency)
      lfo.start()
      osc.connect(master)
      osc.start()
      lfos.push(lfo)
      return osc
    })

    themeRef.current = { master, oscillators, lfos }
    master.gain.linearRampToValueAtTime(0.14, ctx.currentTime + 2.2)
  }, [ensureContext])

  const stopTheme = useCallback(() => {
    const state = themeRef.current
    if (!state) return
    const { master, oscillators, lfos } = state
    const ctx = master.context
    const now = ctx.currentTime
    master.gain.cancelScheduledValues(now)
    master.gain.linearRampToValueAtTime(0.0001, now + 1)
    oscillators.forEach((osc) => {
      osc.stop(now + 1.1)
    })
    lfos.forEach((lfo) => {
      lfo.stop(now + 1.05)
    })
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
    }),
    [playEffect, playTheme, stopTheme, prime],
  )

  return <SoundscapeContext.Provider value={value}>{children}</SoundscapeContext.Provider>
}

export function useSoundscape() {
  return useContext(SoundscapeContext)
}
