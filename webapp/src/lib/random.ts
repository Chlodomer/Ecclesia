export type WeightedOption<T> = {
  value: T
  weight: number
}

export function pickWeightedOption<T>(options: WeightedOption<T>[], rng: () => number) {
  const total = options.reduce((sum, option) => sum + option.weight, 0)
  if (total <= 0) {
    throw new Error('Cannot pick option with non-positive total weight')
  }

  const threshold = rng() * total
  let cumulative = 0

  for (const option of options) {
    cumulative += option.weight
    if (threshold <= cumulative) {
      return option.value
    }
  }

  return options[options.length - 1]!.value
}

export function createSeededRng(seed = Date.now()) {
  let value = seed % 2147483647
  if (value <= 0) value += 2147483646

  return () => {
    value = (value * 16807) % 2147483647
    return (value - 1) / 2147483646
  }
}
