import { HoldsVesselState, linkVesselState } from './vesselState.js'
import { EventEmitter } from 'events'
import { Stream } from 'stream'
import {
  ManufacturerCodeValues,
  IndustryCodeValues,
  DeviceClassValues,
  getIndirectEnumerationValue
} from '@canboat/ts-pgns'
import {
  awaitsDevice,
  instanceGroups,
  classifyInstance,
  defaultPrefix,
  RESOLVER,
  resolverBinding,
  hasInstanceGroup,
  deviceIdentity,
  MANUFACTURER_CODE_MASK,
  UNIQUE_NUMBER_MASK,
  UNIQUE_NUMBERS,
  DeviceIdentity,
  InstancePrefixContext,
  InstancePrefixResolver,
  N2kFrame,
  SourceState
} from './instanceGroups.js'
import {
  InstancePrefixOverrides,
  validateInstancePrefixRules,
  InstancePrefixRule,
  InstancePrefixRuleProblem
} from './instancePrefixOverrides.js'

/**
 * The stream toDeltaTransformer returns: a classic through stream, which is
 * both writable and readable but is not a stream.Transform. Write decoded
 * frames to it, or pipe an object stream of them into it, and it emits each
 * frame's Delta as 'data'. A string or buffer is dropped, without a Delta.
 * A write callback is called once the frame is handled, and an end callback
 * once the stream has ended.
 */
export interface DeltaStream extends Stream, NodeJS.WritableStream {
  readable: boolean
  paused: boolean
  write(n2k: N2kReport, cb?: (err?: Error | null) => void): boolean
  write(buffer: Uint8Array | string, cb?: (err?: Error | null) => void): boolean
  write(
    str: string,
    encoding?: BufferEncoding,
    cb?: (err?: Error | null) => void
  ): boolean
  end(cb?: () => void): this
  end(n2k: N2kReport, cb?: () => void): this
  end(data: string | Uint8Array, cb?: () => void): this
  end(str: string, encoding?: BufferEncoding, cb?: () => void): this
  pause(): this
  resume(): this
  destroy(): this
}

// through and debug ship no type declarations.
const through: (
  write: (this: { queue(data: unknown): void }, data: unknown) => void
) => DeltaStream = require('through')
const debug: (formatter: string, ...args: unknown[]) => void = require('debug')(
  'signalk:n2k-signalk'
)

type Fields = Record<string, unknown>

/**
 * A decoded frame as toDelta receives it. fields is any object, so a frame
 * whose fields is an interface (a @canboat/ts-pgns PGN) is accepted.
 */
export interface N2kReport extends N2kFrame {
  timestamp?: string
  // The rest of a canboat frame, which the mapper does not read
  prio?: number | string
  dst?: number | string
  description?: string
  id?: string
  input?: string[]
}

// An interface has no index signature, so fields is read through Fields.
function fieldsOf(n2k: N2kReport): Fields | undefined {
  return n2k.fields as Fields | undefined
}

// These throw so that toDelta's catch turns a frame without src or timestamp
// into no values.
function srcOf(n2k: N2kReport): string {
  if (n2k.src === undefined) throw new TypeError('frame has no src')
  return n2k.src.toString()
}

function timestampOf(n2k: N2kReport): string {
  if (n2k.timestamp === undefined) throw new TypeError('frame has no timestamp')
  return n2k.timestamp
}

/** The per-source state toDelta keeps and passes to a mapping. */
interface MapperSourceState extends SourceState, HoldsVesselState {
  /** When the device was last asked for its address claim. */
  claimRequested?: number
  /** When each metadata PGN was last received, by PGN. */
  metaPGNsReceived?: Record<string, number>
}

/** toDelta's state: each source's, by src, and the vessel-wide state. */
export type MapperState = Record<string, MapperSourceState> & HoldsVesselState

/** A value a mapping produced; one without a string path is left out. */
type MappedValue = { path?: unknown; value: unknown } | undefined

interface PathValue {
  path: string
  value: unknown
}

type MappingCallback<T> = (
  n2k: N2kReport,
  state: MapperSourceState | undefined
) => T

/** How a PGN's fields map to Signal K paths. */
interface PathMapping {
  node?: string | MappingCallback<unknown>
  /** A field name, or a function computing the value. */
  source?: string | MappingCallback<unknown>
  value?: MappingCallback<unknown>
  filter?: MappingCallback<boolean>
  /** A PGN variant; the mapping applies only to the frames it matches. */
  pgnClass?: { isMatch(n2k: N2kReport): boolean }
  context?: MappingCallback<string | undefined>
  instance?: (n2k: N2kReport) => unknown
  allowNull?: boolean
}

/** A mapping that computes all of a frame's values itself. */
interface MappingFunction extends PathMapping {
  (n2k: N2kReport, state: MapperSourceState | undefined): MappedValue[]
}

type Mapping = PathMapping | MappingFunction

interface DeltaSource {
  label: string
  type: string
  pgn: number
  src: string
  canName?: string
  /**
   * The NAME's whole device instance byte, (deviceInstanceUpper << 3) |
   * deviceInstanceLower: 0-255, the number configuration tools show as the
   * device instance. Not the upper field: upper 6, lower 0 is 48. A field the
   * decoder leaves out as unavailable counts as 0, though canName encodes it
   * as all ones.
   */
  deviceInstance?: number
  instance?: unknown
}

export interface Delta {
  context?: string
  updates: {
    source: DeltaSource
    timestamp: string
    values: PathValue[]
  }[]
}

/**
 * A property value as the server passes it. For the 'pgn-to-signalk'
 * property, value holds a plugin's custom PGN mappings, keyed by PGN.
 */
interface PgnMappingsPropertyValue {
  setter: string
  value: unknown
}

/** What n2kOutIsAvailable sends metadata requests through. */
interface N2kOutListener {
  emit(event: string, request: MetaDataRequest): void
}

interface MetaDataRequest {
  pgn: number
  dst: N2kReport['src']
  PGN: number | string
}

/** The device metadata a metadata PGN carries. */
interface MetaData {
  /**
   * PGN 60928: the NAME's whole device instance byte, (deviceInstanceUpper << 3) |
   * deviceInstanceLower: 0-255, the number configuration tools show as the
   * device instance. Not the upper field: upper 6, lower 0 is 48. A field the
   * decoder leaves out as unavailable counts as 0, though canName encodes it
   * as all ones.
   */
  deviceInstance?: number
  canName?: string
  [field: string]: unknown
}

export interface N2kMapperOptions {
  /** Subscribes to the server's property values, for plugins' custom PGNs. */
  onPropertyValues?(
    name: string,
    cb: (values: (PgnMappingsPropertyValue | undefined)[]) => void
  ): void
  /** Lets a custom PGN mapping replace a built-in one. */
  allowCustomPGNOverride?: boolean
  instancePrefixRules?: readonly InstancePrefixRule[] | null
  instancePrefixResolver?: InstancePrefixResolver | null
  /** @deprecated Ignored; signalk-server still passes it. */
  sendMetaData?: boolean
}

// Resolve one NAME field to its numeric code, masked to its width. A
// lookup field arrives as the name the decoder resolves ('Furuno',
// 'Marine Industry', 'Yes') or, when the value is missing from the
// lookup table, as the raw number. A field the decoder suppressed as
// unavailable (e.g. systemInstance 15) is absent from the object and
// must re-encode as its all-ones sentinel — real devices on the bus
// transmit claims with unavailable instance fields.
function nameField(
  value: unknown,
  mask: number,
  table?: Readonly<Record<string, number>>
): number {
  if (value === undefined || value === null) return mask
  if (typeof value === 'number') return value & mask
  if (table && Object.prototype.hasOwnProperty.call(table, String(value))) {
    return table[String(value)] & mask
  }
  const n = Number(value)
  return (Number.isNaN(n) ? mask : n) & mask
}

// A manufacturer name missing from @canboat/ts-pgns packs as the all-ones
// code, which no rule for the device matches. Say so once per name.
const warnedManufacturers = new Set<string>()
function warnUnknownManufacturer(value: unknown) {
  if (
    typeof value !== 'string' ||
    Object.prototype.hasOwnProperty.call(ManufacturerCodeValues, value) ||
    !Number.isNaN(Number(value)) ||
    warnedManufacturers.has(value)
  ) {
    return
  }
  warnedManufacturers.add(value)
  console.error(
    `n2k-signalk: manufacturer "${value}" of a PGN 60928 address claim is not in @canboat/ts-pgns, its NAME carries manufacturer code ${MANUFACTURER_CODE_MASK}: instance prefix rules for the device do not match`
  )
}

// The device function's code. canboatjs names it under the device class
// ("Integrated Navigation System" for 175 in class Navigation), as canboat
// does, and gave it as a number before: take both.
function deviceFunctionCode(fields: Fields, deviceClass: number): number {
  const value = fields.deviceFunction
  if (typeof value === 'string' && Number.isNaN(Number(value))) {
    const code = getIndirectEnumerationValue(
      'DEVICE_FUNCTION',
      deviceClass,
      value
    )
    return code === undefined ? 0xff : code & 0xff
  }
  return nameField(value, 0xff)
}

// canName is the device's 8-byte NAME — the wire payload of its ISO
// Address Claim (PGN 60928, ISO 11783-5 layout) — rendered as hex,
// packed straight from the decoded fields.
function canNameFromClaim(fields: Fields): string {
  warnUnknownManufacturer(fields.manufacturerCode)
  const manufacturer = nameField(
    fields.manufacturerCode,
    MANUFACTURER_CODE_MASK,
    ManufacturerCodeValues
  )
  const industry = nameField(fields.industryGroup, 0x07, IndustryCodeValues)
  const deviceClass = nameField(fields.deviceClass, 0x7f, DeviceClassValues)
  const arbitrary = nameField(fields.arbitraryAddressCapable, 0x01, {
    Yes: 1,
    No: 0
  })
  // Bytes 0-3: unique number (21 bits) then manufacturer (11 bits).
  const lo =
    nameField(fields.uniqueNumber, UNIQUE_NUMBER_MASK) +
    manufacturer * UNIQUE_NUMBERS
  const b4 =
    nameField(fields.deviceInstanceLower, 0x07) |
    (nameField(fields.deviceInstanceUpper, 0x1f) << 3)
  // Callers pass the field by camel id or by schema name: 'spare' or 'Spare'.
  // Unlike the unavailable fields above, a spare the decoder left out is
  // clear: canboat and canboatjs omit a spare field when it is all zeros.
  const spare = fields.spare !== undefined ? fields.spare : fields.Spare
  const b6 = (spare == null ? 0 : nameField(spare, 0x01)) | (deviceClass << 1)
  const b7 =
    nameField(fields.systemInstance, 0x0f) | (industry << 4) | (arbitrary << 7)
  const name =
    BigInt(lo) |
    (BigInt(b4) << 32n) |
    (BigInt(deviceFunctionCode(fields, deviceClass)) << 40n) |
    (BigInt(b6) << 48n) |
    (BigInt(b7) << 56n)
  return name.toString(16)
}

const n2kMappings: Record<string, Mapping[]> = {}
Object.assign(n2kMappings, require('./pgns'))
Object.assign(n2kMappings, require('./fusion'))
Object.assign(n2kMappings, require('./lowrance'))
Object.assign(n2kMappings, require('./raymarine'))
Object.assign(n2kMappings, require('./maretron'))
Object.assign(n2kMappings, require('./actisense'))
Object.assign(n2kMappings, require('./digitalyacht'))
Object.assign(n2kMappings, require('./simrad'))
Object.assign(n2kMappings, require('./navico'))

export class N2kMapper extends EventEmitter {
  state: MapperState
  unknownPGNs: Record<string, Record<string, N2kReport>>
  customPgns: Record<string, Mapping[]>
  options: N2kMapperOptions
  instancePrefixOverrides: InstancePrefixOverrides
  // Set by n2kOutIsAvailable; absent until then.
  declare n2kOutEvent?: string
  declare n2kListener?: N2kOutListener
  // When each device seen on the bus was last asked for each metadata PGN,
  // by src; see askNext.
  private asked = new Map<string, Record<string, number>>()
  // The one request waiting for its answer.
  private waitingFor?: {
    src: string
    pgn: string
    timer: ReturnType<typeof setTimeout>
  }
  // Where askNext starts looking, so the devices take turns.
  private nextDevice = 0
  private idleTimer?: ReturnType<typeof setTimeout>
  // The src/pgn pairs reported in n2kSourceMetadataTimeout and not answered
  // since, so a silent device is reported once, not every REQUEST_INTERVAL.
  private reportedTimeouts = new Set<string>()
  // PGNs to ask a device for now, whatever it sent or was asked recently,
  // by src; see requestSourceMeta and requestAllMeta.
  private askNow = new Map<string, Set<string>>()

  constructor(options?: N2kMapperOptions) {
    super()
    this.state = {}
    this.unknownPGNs = {}
    this.customPgns = {}
    this.options = options || {}
    this.instancePrefixOverrides = new InstancePrefixOverrides()
    this.setInstancePrefixRules(this.options.instancePrefixRules)
    this.setInstancePrefixResolver(this.options.instancePrefixResolver)

    if (this.options.onPropertyValues) {
      this.options.onPropertyValues('pgn-to-signalk', (values) => {
        values
          .filter((v) => v !== undefined)
          .forEach((pv) => {
            if (typeof pv.value !== 'object' || pv.value === null) {
              console.error(`${pv.setter} set invalid custom pgn mappings`)
              return
            }
            Object.entries(pv.value as Record<string, Mapping[]>).forEach(
              ([pgnNumber, mappings]) => {
                if (
                  n2kMappings[pgnNumber] &&
                  !this.options.allowCustomPGNOverride
                ) {
                  console.error(`pgn ${pgnNumber} can't be overwritten`)
                } else {
                  this.customPgns[pgnNumber] = mappings
                  debug('registered custom pgn %d by %s', pgnNumber, pv.setter)
                }
              }
            )
          })
      })
    }
  }

  /**
   * Replaces the instance prefix rules. Applies the valid rules, logs each
   * problem of the others once and returns the problems; undefined, null or []
   * removes every rule, as does a value that is not an array, which is
   * reported at index -1.
   */
  setInstancePrefixRules(
    rules: readonly InstancePrefixRule[] | null | undefined
  ): InstancePrefixRuleProblem[] {
    return this.instancePrefixOverrides.setRules(rules)
  }

  /**
   * Replaces the function consulted for an instance's path prefix when no rule
   * matches; undefined or null removes it, and anything else that is not a
   * function is logged and removes it too.
   */
  setInstancePrefixResolver(
    resolver: InstancePrefixResolver | null | undefined
  ) {
    this.instancePrefixOverrides.setResolver(resolver)
  }

  n2kOutIsAvailable(listener: N2kOutListener, event: string) {
    this.n2kOutEvent = event
    this.n2kListener = listener
    // A device that sends nothing unasked would otherwise be found only by
    // its heartbeat, up to a minute later. Each device answers this with a
    // single frame, and the answers start askNext on each new device.
    this.sendRequest(255, 60928)
    this.askNext()
  }

  requestMetaData(dst: N2kReport['src'], pgn: number | string): Promise<void> {
    if (!this.sendRequest(dst, pgn)) {
      return Promise.resolve()
    }
    return new Promise((resolve) => setTimeout(resolve, ANSWER_TIMEOUT))
  }

  // Sends an ISO Request for pgn to dst; false when there is no n2k output yet.
  private sendRequest(dst: N2kReport['src'], pgn: number | string): boolean {
    const listener = this.n2kListener
    if (!listener) {
      debug(
        `skipping request for pgn ${pgn} from src ${dst}: n2k output not available yet`
      )
      return false
    }
    debug(`requesting pgn ${pgn} from src ${dst}`)
    listener.emit(this.n2kOutEvent!, { pgn: 59904, dst: dst, PGN: pgn })
    return true
  }

  // Asks the devices seen on the bus for their metadata, as canboat's n2kd
  // does: by address, never by broadcast, and one request at a time. A
  // broadcast request makes every device answer at once, and a 126996 answer
  // is a fast packet of about 20 frames. The next request goes out when the
  // answer or a NAK arrives, or after ANSWER_TIMEOUT. A device is asked for a
  // PGN at most once every REQUEST_INTERVAL, and not within REQUEST_INTERVAL
  // of sending it, so a device that announces itself isn't asked.
  /**
   * Asks the device at src for its metadata PGNs, or for the given ones,
   * ahead of anything due by itself: after a command that changes its
   * instance or installation description, say. The answers arrive as
   * n2kSourceMetadata like any other.
   */
  requestSourceMeta(
    src: number | string,
    pgns: readonly (number | string)[] = Object.keys(metaPGNs)
  ) {
    const key = String(src)
    if (!this.asked.has(key)) {
      this.asked.set(key, {})
    }
    const wanted = this.askNow.get(key) ?? new Set<string>()
    pgns.map(String).forEach((pgn) => wanted.add(pgn))
    this.askNow.set(key, wanted)
    this.askNext()
  }

  /**
   * Asks every device seen on the bus for all its metadata PGNs again, one
   * request at a time as answers arrive. Returns the number of devices.
   */
  requestAllMeta(): number {
    const devices = [...this.asked.keys()]
    devices.forEach((src) => this.requestSourceMeta(src))
    return devices.length
  }

  private askNext() {
    if (this.waitingFor || !this.n2kListener) {
      return
    }
    for (const [src, pgns] of this.askNow) {
      const pgn = pgns.values().next().value
      if (pgn === undefined) {
        this.askNow.delete(src)
        continue
      }
      pgns.delete(pgn)
      if (pgns.size === 0) {
        this.askNow.delete(src)
      }
      this.ask(src, pgn)
      return
    }
    const now = Date.now()
    const devices = [...this.asked.keys()]
    for (let i = 0; i < devices.length; i++) {
      const at = (this.nextDevice + i) % devices.length
      const src = devices[at]
      const pgn = Object.keys(metaPGNs).find((pgn) => this.isDue(src, pgn, now))
      if (pgn !== undefined) {
        // The device's other PGNs come next, then the device after it.
        this.nextDevice = at
        this.ask(src, pgn)
        return
      }
    }
    if (this.idleTimer === undefined) {
      this.idleTimer = setTimeout(() => {
        this.idleTimer = undefined
        this.askNext()
      }, IDLE_CHECK)
      unref(this.idleTimer)
    }
  }

  private ask(src: string, pgn: string) {
    this.asked.get(src)![pgn] = Date.now()
    const timer = setTimeout(
      () => this.answered(src, pgn, false),
      ANSWER_TIMEOUT
    )
    unref(timer)
    this.waitingFor = { src, pgn, timer }
    this.sendRequest(Number(src), pgn)
  }

  private isDue(src: string, pgn: string, now: number): boolean {
    const recent = (time: number | undefined) =>
      time !== undefined && now - time < REQUEST_INTERVAL
    // requestAddressClaim asks a device for its claim too.
    const claimRequested =
      pgn === '60928' ? this.state[src]?.claimRequested : undefined
    return (
      !recent(this.state[src]?.metaPGNsReceived?.[pgn]) &&
      !recent(this.asked.get(src)?.[pgn]) &&
      !recent(claimRequested)
    )
  }

  private answered(src: string, pgn: string, received: boolean) {
    const waitingFor = this.waitingFor
    if (!waitingFor || waitingFor.src !== src || waitingFor.pgn !== pgn) {
      return
    }
    clearTimeout(waitingFor.timer)
    this.waitingFor = undefined
    const key = `${src}/${pgn}`
    if (received) {
      this.reportedTimeouts.delete(key)
    } else if (!this.reportedTimeouts.has(key)) {
      this.reportedTimeouts.add(key)
      debug(`did not get meta pgn ${pgn} for src ${src}`)
      this.emit('n2kSourceMetadataTimeout', pgn, src)
    }
    this.askNext()
  }

  // Notes the device that sent n2k, and moves on when n2k answers the request
  // waiting for its answer, or NAKs it (59392).
  private followRequests(n2k: N2kReport) {
    const src = Number(n2k.src)
    if (!Number.isInteger(src) || src < 0 || src > MAX_DEVICE_ADDRESS) {
      return
    }
    const key = String(src)
    const waitingFor = this.waitingFor
    if (waitingFor?.src === key) {
      if (String(n2k.pgn) === waitingFor.pgn) {
        this.answered(key, waitingFor.pgn, true)
      } else if (Number(n2k.pgn) === 59392) {
        const fields = (n2k.fields ?? {}) as Record<string, unknown>
        if (String(fields.pgn ?? fields.PGN) === waitingFor.pgn) {
          this.answered(key, waitingFor.pgn, false)
        }
      }
    }
    if (!this.asked.has(key)) {
      this.asked.set(key, {})
      this.askNext()
    }
  }

  toDelta(n2k: N2kReport): Delta | undefined {
    const delta = this.mapFrame(n2k)
    this.followRequests(n2k)
    return delta
  }

  private mapFrame(n2k: N2kReport): Delta | undefined {
    if (metaPGNs[n2k.pgn] && n2k.fields) {
      const meta = metaPGNs[n2k.pgn](n2k)
      // State is keyed by the string form of src, so a frame without src keys
      // it as 'undefined'.
      const srcKey = String(n2k.src)
      if (!this.state[srcKey]) {
        this.state[srcKey] = {}
      }

      if (n2k.pgn === 60928) {
        const canName = canNameFromClaim(fieldsOf(n2k)!)
        if (
          this.state[srcKey].canName &&
          this.state[srcKey].canName != canName
        ) {
          // clear out any existing state since the src addresses have changed
          this.emit(
            'n2kSourceChanged',
            n2k.src,
            this.state[srcKey].canName,
            canName
          )
          this.state[srcKey] = {}
          // Forget the old device's requests: the new one counts as a new
          // device, and is asked for its product and configuration information.
          this.asked.delete(srcKey)
        }
        this.state[srcKey].deviceInstance = meta.deviceInstance
        meta.canName = canName
        this.state[srcKey].canName = canName
      }

      const srcState = this.state[srcKey]
      if (!srcState.metaPGNsReceived) {
        srcState.metaPGNsReceived = {}
      }

      srcState.metaPGNsReceived[n2k.pgn] = Date.now()

      this.emit('n2kSourceMetadata', n2k, meta)
    } else {
      if (!n2kMappings[n2k.pgn] && !metaPGNs[n2k.pgn]) {
        const srcKey = String(n2k.src)
        if (!this.unknownPGNs[srcKey]) {
          this.unknownPGNs[srcKey] = {}
        }
        if (!this.unknownPGNs[srcKey][n2k.pgn]) {
          this.unknownPGNs[srcKey][n2k.pgn] = n2k
          this.emit('n2kSourceMetadata', n2k, {
            unknownPGNs: this.unknownPGNs[srcKey]
          })
        }
      }
      const delta = toDelta(
        n2k,
        this.state,
        this.customPgns,
        this.instancePrefixOverrides.resolver,
        this.instancePrefixOverrides.reportedFailures
      )
      this.requestAddressClaim(n2k)
      return delta
    }
  }

  // Asks a device that sends a frame whose path is named after it for what the
  // mapper is missing, as long as it keeps sending such frames. A device that
  // answered is not asked again, even when its answer names nothing.
  private requestAddressClaim(n2k: N2kReport) {
    const state = this.state[String(n2k.src)]
    if (!this.n2kListener || !state || !awaitsDevice(n2k, state)) {
      return
    }
    const now = Date.now()
    const asked = this.asked.get(String(n2k.src))?.['60928']
    if (
      (state.claimRequested !== undefined &&
        now - state.claimRequested < CLAIM_REQUEST_INTERVAL) ||
      (asked !== undefined && now - asked < CLAIM_REQUEST_INTERVAL)
    ) {
      return
    }
    state.claimRequested = now
    this.requestMetaData(n2k.src, 60928)
  }
}

// A toDelta call without a mapper has no mapper to keep the resolver failures
// it logged on; they are keyed by its resolver.
const standaloneFailures = new WeakMap<InstancePrefixResolver, Set<string>>()

function standaloneReportedFailures(resolver: InstancePrefixResolver) {
  let reported = standaloneFailures.get(resolver)
  if (reported === undefined) {
    reported = new Set()
    standaloneFailures.set(resolver, reported)
  }
  return reported
}

/**
 * reportedFailures holds the pgn:src keys the resolver's throws and invalid
 * prefixes have been logged for; without it they are keyed by the resolver.
 */
export function toDelta(
  n2k: N2kReport,
  state?: MapperState,
  customPgns: Record<string, Mapping[]> = {},
  instancePrefixResolver?: InstancePrefixResolver,
  reportedFailures?: Set<string>
): Delta | undefined {
  try {
    const src = srcOf(n2k)
    // A frame canboat could not decode has no fields, and no mapping can read it.
    const theMappings: Mapping[] = n2k.fields
      ? [...(customPgns[n2k.pgn] || []), ...(n2kMappings[n2k.pgn] || [])]
      : []

    let src_state: MapperSourceState | undefined
    if (state) {
      if (!state[src]) {
        state[src] = {}
      }
      src_state = state[src]
      linkVesselState(state, src_state)
      const resolver = hasInstanceGroup(n2k.pgn)
        ? instancePrefixResolver
        : undefined
      if (resolver || src_state[RESOLVER]) {
        src_state[RESOLVER] =
          resolver &&
          resolverBinding(
            resolver,
            reportedFailures || standaloneReportedFailures(resolver)
          )
      }
    }
    // The mappings that apply to this report, selected once: the values and
    // the context both come from this set.
    const applying = theMappings.filter((theMapping) =>
      mappingApplies(theMapping, n2k, src_state)
    )

    const timestamp = timestampOf(n2k)
    const result: Delta = {
      updates: [
        {
          source: {
            label: '',
            type: 'NMEA2000',
            pgn: Number(n2k.pgn),
            src
          },
          timestamp:
            timestamp.substring(0, 10) +
            'T' +
            timestamp.substring(11, timestamp.length),
          values: toValuesArray(applying, n2k, src_state)
        }
      ]
    }

    if (src_state && src_state.canName) {
      result.updates[0].source.canName = src_state.canName
    }
    if (src_state && typeof src_state.deviceInstance !== 'undefined') {
      result.updates[0].source.deviceInstance = src_state.deviceInstance
    }
    if (
      typeof theMappings !== 'undefined' &&
      typeof theMappings !== 'function'
    ) {
      let hasContext = false
      // Only a mapping that applies to this report decides its context: a
      // mapping for another variant, or one whose filter rejects the report,
      // must neither set it nor have it dropped.
      applying.forEach(function (mapping) {
        if (typeof mapping.context === 'function') {
          hasContext = true
          result.context = mapping.context(n2k, src_state)
        }
      })
      // An AIS report without an MMSI belongs to no vessel. canboat and
      // canboatjs report MMSI 0 -- which no station holds -- as not
      // available, so the field is simply absent: drop the report, as a
      // malformed MMSI is dropped below.
      if (hasContext && !result.context) {
        return
      }
      if (result.context) {
        //filter out invalid mmsi
        const last = result.context.lastIndexOf(':')
        if (last != -1 && result.context.slice(last + 1).length < 9) {
          console.error('bad MMSI: ' + result.context)
          return
        }
      }

      if (theMappings.length === 1 && theMappings[0].instance) {
        // The schema rejects a null source.instance; leave it out.
        const instance = theMappings[0].instance(n2k)
        if (instance != null) {
          result.updates[0].source.instance = instance
        }
      }
    }

    return result
  } catch (ex) {
    console.error(ex)
    console.error(
      'Unable to convert:' + (ex as Error).message + ':' + JSON.stringify(n2k)
    )
    return { updates: [] }
  }
}

function getValue(
  n2k: N2kReport,
  fields: Fields,
  source: string | undefined,
  theMapping: PathMapping,
  state: MapperSourceState | undefined
): unknown {
  if (typeof source !== 'undefined') {
    const stringValue = fields[source]
    if (!stringValue && stringValue != '') {
      return undefined
    }
    const numberValue = Number(stringValue)
    return isNaN(numberValue) ? stringValue : numberValue
  } else {
    if (theMapping.value) {
      return theMapping.value(n2k, state)
    }
  }
}

// A mapping that finds no path for a report leaves its value out: the server
// discards a whole update when any value in it lacks a path. Say so once per
// PGN and source, so a missing mapping still shows in the log.
const warnedNoPath = new Set<string>()
function warnNoPath(n2k: N2kReport) {
  const key = `${n2k.pgn}:${n2k.src}`
  if (!warnedNoPath.has(key)) {
    warnedNoPath.add(key)
    console.error(
      `n2k-signalk: no Signal K path for a value in pgn ${n2k.pgn} from src ${
        n2k.src
      }, left out: ${JSON.stringify(n2k.fields)}`
    )
  }
}

/**
 * Does this mapping apply to this report: its pgnClass (a PGN variant)
 * matches and its filter, if any, passes?
 */
function mappingApplies(
  theMapping: Mapping,
  n2k: N2kReport,
  state: MapperSourceState | undefined
): boolean {
  try {
    if (theMapping.pgnClass) {
      return (
        theMapping.pgnClass.isMatch(n2k) &&
        (theMapping.filter === undefined || theMapping.filter(n2k, state))
      )
    } else {
      return (
        typeof theMapping.filter === 'undefined' ||
        theMapping.filter(n2k, state)
      )
    }
  } catch (ex) {
    process.stderr.write(ex + ' ' + n2k)
    return false
  }
}

// theMappings are the mappings that apply to the report (see mappingApplies).
function toValuesArray(
  theMappings: Mapping[],
  n2k: N2kReport,
  state: MapperSourceState | undefined
): PathValue[] {
  const fields = fieldsOf(n2k)
  if (fields && typeof theMappings !== 'undefined') {
    return theMappings
      .reduce<MappedValue[]>((updates, theMapping) => {
        try {
          if (typeof theMapping === 'function') {
            Array.prototype.push.apply(updates, theMapping(n2k, state))
          } else {
            const path =
              typeof theMapping.node === 'function'
                ? theMapping.node(n2k, state)
                : theMapping.node
            const value =
              typeof theMapping.source === 'function'
                ? theMapping.source(n2k, state)
                : getValue(n2k, fields, theMapping.source, theMapping, state)
            const allowNull =
              typeof theMapping.allowNull !== 'undefined' &&
              theMapping.allowNull
            if (!(value == null) || allowNull) {
              // null or undefined
              updates.push({
                path: path,
                value: value
              })
            }
          }
        } catch (ex) {
          process.stderr.write(ex + ' ' + JSON.stringify(n2k))
          console.error(ex)
        }
        return updates
      }, [])
      .filter(function (x): x is PathValue {
        if (x == undefined) {
          return false
        }
        // Function mappings (and plugins' customPgns) push their own values.
        if (typeof x.path !== 'string') {
          warnNoPath(n2k)
          return false
        }
        return true
      })
  }
  return []
}

const CLAIM_REQUEST_INTERVAL = 10000
// How long a device has to answer an ISO Request before the next one goes
// out. J1939 gives a device 1.25 s; this leaves room for a gateway.
const ANSWER_TIMEOUT = 2000
// How often a device is asked for each metadata PGN, as canboat's n2kd.
const REQUEST_INTERVAL = 5 * 60 * 1000
// How often to look for a device that is due again when none is.
const IDLE_CHECK = 10000
// 254 is the null address, of a device that couldn't claim one; 255 is global.
const MAX_DEVICE_ADDRESS = 253

// Keeps a timer from holding the process open.
function unref(timer: ReturnType<typeof setTimeout>) {
  ;(timer as { unref?: () => void }).unref?.()
}

const metaPGNs: Record<string, (n2k: N2kReport) => MetaData> = {
  // deviceInstance combines the two fields, which stay as decoded (#342)
  60928: (n2k) => {
    const fields = fieldsOf(n2k)!
    return {
      ...n2k.fields,
      // A number in the sources tree, as plugins compare it (== 150 for an
      // autopilot), whether the decoder named it or not.
      ...(fields.deviceFunction !== undefined && {
        deviceFunction: deviceFunctionCode(
          fields,
          nameField(fields.deviceClass, 0x7f, DeviceClassValues)
        )
      }),
      deviceInstance:
        (Number(fieldsOf(n2k)!.deviceInstanceUpper) << 3) |
        Number(fieldsOf(n2k)!.deviceInstanceLower)
    }
  },
  126998: (n2k) => fieldsOf(n2k)!,
  126996: (n2k) => fieldsOf(n2k)!
}

export {
  instanceGroups,
  classifyInstance,
  defaultPrefix,
  deviceIdentity,
  validateInstancePrefixRules
}
export {
  DeviceIdentity,
  InstancePrefixContext,
  InstancePrefixResolver,
  InstancePrefixRule,
  InstancePrefixRuleProblem
}

export function toDeltaTransformer(
  options: unknown,
  state?: MapperState
): DeltaStream {
  const stream = through(function (data) {
    // A string or buffer is not a frame: drop it rather than have toDelta log
    // it as an error and give an empty Delta.
    if (
      typeof data !== 'object' ||
      data === null ||
      data instanceof Uint8Array
    ) {
      return
    }
    // toDelta returns nothing for a report it drops (an AIS report without a
    // valid MMSI, for one); queueing undefined would still emit a 'data' event.
    const delta = toDelta(data as N2kReport, state)
    if (delta !== undefined) {
      this.queue(delta)
    }
  })
  // through ignores the callbacks Node's WritableStream declares, and returns
  // undefined from a repeated end, pause or destroy. Call the callbacks, and
  // return the stream, as DeltaStream declares.
  const write = stream.write as (data?: unknown) => boolean
  ;(stream.write as unknown) = (...args: unknown[]) => {
    const cb = takeCallback(args)
    // Before the write: a listener it runs may call end, whose callback comes
    // after this one
    let failed = false
    if (cb) process.nextTick(() => failed || cb())
    try {
      return write.call(stream, args[0])
    } catch (err) {
      // The caller has this failure: don't report the write as a success too
      failed = true
      throw err
    }
  }
  const end = stream.end as (data?: unknown) => unknown
  ;(stream.end as unknown) = (...args: unknown[]) => {
    const cb = takeCallback(args)
    if (cb) {
      // through may emit 'end' at once; a tick later, the callbacks of
      // earlier writes have run first, as Node's streams order them
      if (stream.readable) stream.once('end', () => process.nextTick(cb))
      else process.nextTick(cb)
    }
    // through writes any argument, even undefined, as a last frame
    if (args.length > 0) end.call(stream, args[0])
    else end.call(stream)
    return stream
  }
  for (const method of ['pause', 'destroy'] as const) {
    const original = stream[method] as () => unknown
    ;(stream[method] as unknown) = () => {
      original.call(stream)
      return stream
    }
  }
  return stream
}

function takeCallback(args: unknown[]): (() => void) | undefined {
  const last = args[args.length - 1]
  if (typeof last === 'function') {
    args.pop()
    return last as () => void
  }
  return undefined
}
