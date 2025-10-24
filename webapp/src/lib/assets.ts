export function assetPath(input: string | null | undefined): string {
  if (!input) return ''
  // Ignore full URLs and data URIs
  if (/^(https?:)?\/\//.test(input) || input.startsWith('data:')) return input
  const base = (import.meta as any).env?.BASE_URL ?? '/'
  const trimmed = input.startsWith('/') ? input.slice(1) : input
  return base + trimmed
}

