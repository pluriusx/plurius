export function splitLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function splitParagraphs(value: string) {
  return value
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function appendQueryParam(path: string, key: string, value: string) {
  const [withoutHash, hash] = path.split('#')
  const url = new URL(withoutHash, 'https://inmos.local')
  url.searchParams.set(key, value)

  return `${url.pathname}${url.search}${hash ? `#${hash}` : ''}`
}

export function buildWhatsAppUrl(phone?: string | null, message?: string) {
  if (!phone) {
    return undefined
  }

  const digits = phone.replace(/[^\d]/g, '')

  if (!digits) {
    return undefined
  }

  const url = new URL(`https://wa.me/${digits}`)

  if (message?.trim()) {
    url.searchParams.set('text', message.trim())
  }

  return url.toString()
}

export function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '')
  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}
