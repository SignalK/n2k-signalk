/*
 * Helpers shared by the mappings. canboatjs gives every value in SI, as
 * canboat does (canboat/canboatjs#480): ratios, m3, m3/s, Hz, rad, K, Pa and
 * seconds, so a mapping passes a value on rather than converting it.
 */

type N2k = { fields: any }

export function chooseField(n2k: N2k, field1: string, field2: string) {
  return typeof n2k.fields[field1] === 'undefined'
    ? n2k.fields[field2]
    : n2k.fields[field1]
}

export function skEngineId(n2k: N2k): number | string {
  const id = n2k.fields.instance
  if (typeof id === 'number') {
    return id
  }
  return id === 'Single Engine or Dual Engine Port' ? 'port' : 'starboard'
}

// J1939 PGNs carry no engine-instance field; on a J1939 bus the source
// address is the engine identity (engine #1 claims 0x00, engine #2 0x01, ...).
export function skJ1939EngineId(n2k: N2k & { src: number }): number {
  return n2k.src
}

export function skEngineTitle(n2k: N2k): number | string {
  const engine = skEngineId(n2k)
  if (typeof engine === 'number') {
    return engine
  }
  return engine.charAt(0).toUpperCase() + engine.slice(1)
}

export function acPhase(n2k: N2k): string {
  switch (n2k.fields.line) {
    case 'Line 2':
      return 'B'
    case 'Line 3':
      return 'C'
    default:
      return 'A'
  }
}

/**
 * A TIME or DURATION in seconds, given as a number of seconds or as a clock
 * string ("HH:MM:SS[.fff]").
 */
export function seconds(time: unknown): number | null {
  if (typeof time === 'number') {
    return Number.isFinite(time) ? time : null
  }
  if (typeof time === 'string') {
    const parts = time.split(':')
    if (
      parts.length === 3 &&
      parts.every((p) => p.trim() !== '' && Number.isFinite(Number(p)))
    ) {
      const [h, m, s] = parts.map(Number)
      return h * 3600 + m * 60 + s
    }
  }
  return null
}

/**
 * An ISO 8601 date-time from a canboat DATE ("YYYY.MM.DD") and a TIME of
 * day in seconds: 2020.03.09 and 64067.8 are 2020-03-09T17:47:47.800Z.
 */
export function isoDateTime(date: unknown, time: unknown): string | null {
  const s = seconds(time)
  if (typeof date !== 'string' || s === null) {
    return null
  }
  const midnight = Date.parse(`${date.replace(/\./g, '-')}T00:00:00Z`)
  if (Number.isNaN(midnight)) {
    return null
  }
  return new Date(midnight + Math.round(s * 1000)).toISOString()
}
