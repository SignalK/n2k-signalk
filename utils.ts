/*
 * Helpers shared by the mappings. canboatjs gives every value in SI, as
 * canboat does (canboat/canboatjs#480): ratios, m3, m3/s, Hz, rad, K, Pa and
 * seconds, so a mapping passes a value on rather than converting it.
 */

type N2k = { fields: any }

/**
 * Whether a field holds a reading: a finite number, or a string that is one.
 * A reading of 0 is one; a missing field, null or NaN is not.
 */
export function isNumber(value: unknown): boolean {
  return (
    (typeof value === 'number' ||
      (typeof value === 'string' && value.trim() !== '')) &&
    Number.isFinite(Number(value))
  )
}

export function skEngineId(n2k: N2k): number | string {
  const id = n2k.fields.instance
  if (typeof id === 'number') {
    return id
  }
  // canboatjs leaves out an absent instance (255). Like the temperature,
  // humidity and pressure PGNs, which write it as instance 0, the engine
  // gets instance 0's path: port.
  if (id == null || id === 'Single Engine or Dual Engine Port') {
    return 'port'
  }
  return 'starboard'
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
