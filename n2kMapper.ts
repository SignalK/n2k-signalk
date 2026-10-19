import { EventEmitter } from 'events'
import { Stream } from 'stream'
import {
  ManufacturerCodeValues,
  IndustryCodeValues,
  DeviceClassValues
} from '@canboat/ts-pgns'
import {
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

// through and debug ship no type declarations.
const through: (
  write: (this: { queue(data: unknown): void }, data: N2kReport) => void
) => Stream = require('through')
const debug: (formatter: string, ...args: unknown[]) => void = require('debug')(
  'signalk:n2k-signalk'
)

type Fields = Record<string, unknown>

/** A decoded frame as toDelta receives it. */
interface N2kReport extends N2kFrame {
  src: number | string
  timestamp: string
  fields?: Fields
}

/** The per-source state toDelta keeps and passes to a mapping. */
interface MapperSourceState extends SourceState {
  deviceInstance?: number
  /** When each metadata PGN was last received, by PGN. */
  metaPGNsReceived?: Record<string, number>
}

type MapperState = Record<string, MapperSourceState>

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
  deviceInstance?: number
  instance?: unknown
}

interface Delta {
  context?: string
  updates: {
    source: DeltaSource
    timestamp: string
    values: PathValue[]
  }[]
}

/** Custom PGN mappings a plugin sets as the 'pgn-to-signalk' property. */
interface PgnMappingsPropertyValue {
  setter: string
  value: Record<string, Mapping[]>
}

/** What n2kOutIsAvailable sends metadata requests through. */
interface N2kOutListener {
  emit(event: string, request: MetaDataRequest): void
}

interface MetaDataRequest {
  pgn: number
  dst: number | string
  PGN: number | string
}

/** The device metadata a metadata PGN carries. */
interface MetaData {
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
  instancePrefixResolver?: InstancePrefixResolver
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
function nameField (
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
function warnUnknownManufacturer (value: unknown) {
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

// canName is the device's 8-byte NAME — the wire payload of its ISO
// Address Claim (PGN 60928, ISO 11783-5 layout) — rendered as hex,
// packed straight from the decoded fields.
function canNameFromClaim (fields: Fields): string {
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
  const spare = fields.spare !== undefined ? fields.spare : fields.Spare
  const b6 = nameField(spare, 0x01) | (deviceClass << 1)
  const b7 =
    nameField(fields.systemInstance, 0x0f) | (industry << 4) | (arbitrary << 7)
  const name =
    BigInt(lo) |
    (BigInt(b4) << 32n) |
    (BigInt(nameField(fields.deviceFunction, 0xff)) << 40n) |
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

  constructor (options?: N2kMapperOptions) {
    super()
    this.state = {}
    this.unknownPGNs = {}
    this.customPgns = {}
    this.options = options || {}
    this.instancePrefixOverrides = new InstancePrefixOverrides()
    this.setInstancePrefixRules(this.options.instancePrefixRules)
    this.setInstancePrefixResolver(this.options.instancePrefixResolver)

    if (this.options.onPropertyValues) {
      this.options.onPropertyValues('pgn-to-signalk', values => {
        values
          .filter(v => v !== undefined)
          .forEach(pv => {
            Object.entries(pv.value).forEach(([pgnNumber, mappings]) => {
              if (
                n2kMappings[pgnNumber] &&
                !this.options.allowCustomPGNOverride
              ) {
                console.error(`pgn ${pgnNumber} can't be overwritten`)
              } else {
                this.customPgns[pgnNumber] = mappings
                debug('registered custom pgn %d by %s', pgnNumber, pv.setter)
              }
            })
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
  setInstancePrefixRules (
    rules: readonly InstancePrefixRule[] | null | undefined
  ): InstancePrefixRuleProblem[] {
    return this.instancePrefixOverrides.setRules(rules)
  }

  /**
   * Replaces the function consulted for an instance's path prefix when no rule
   * matches; undefined removes it.
   */
  setInstancePrefixResolver (resolver: InstancePrefixResolver | undefined) {
    this.instancePrefixOverrides.setResolver(resolver)
  }

  n2kOutIsAvailable (listener: N2kOutListener, event: string) {
    this.n2kOutEvent = event
    this.n2kListener = listener
    this.requestAllMeta()
  }

  requestMetaData (dst: number | string, pgn: number | string): Promise<void> {
    const listener = this.n2kListener
    if (!listener) {
      debug(
        `skipping request for pgn ${pgn} from src ${dst}: n2k output not available yet`
      )
      return Promise.resolve()
    }
    const reqPgn = {
      pgn: 59904,
      dst: dst,
      PGN: pgn
    }
    debug(`requesting pgn ${pgn} from src ${dst}`)
    return new Promise(resolve => {
      listener.emit(this.n2kOutEvent!, reqPgn)
      setTimeout(() => {
        resolve()
      }, 5000)
    })
  }

  async requestMetaPGNs (dst: number | string, pgns: (number | string)[]) {
    for (let i = 0; i < pgns.length; i++) {
      await this.requestMetaData(dst, pgns[i])
    }
  }

  checkSrcMetasAndRetry (src: string) {
    if (src !== '255') {
      const neededPGNs = Object.keys(metaPGNs).filter(pgn => {
        return (
          !this.state[src].metaPGNsReceived ||
          !this.state[src].metaPGNsReceived[pgn]
        )
      })
      if (neededPGNs.length > 0) {
        debug('did not get meta pgns %j for src %d', neededPGNs, src)
        this.requestMetaPGNs(src, neededPGNs).then(() => {
          neededPGNs.forEach(pgn => {
            if (
              !this.state[src].metaPGNsReceived ||
              !this.state[src].metaPGNsReceived[pgn]
            ) {
              debug(`did not get meta pgn ${pgn} for src ${src}`)
              this.emit('n2kSourceMetadataTimeout', pgn, src)
            }
          })
        })
      }
    }
  }

  requestAllMeta () {
    this.requestMetaPGNs(255, Object.keys(metaPGNs)).then(() => {
      Object.keys(this.state).forEach(src => this.checkSrcMetasAndRetry(src))
    })
  }

  toDelta (n2k: N2kReport): Delta | undefined {
    if (metaPGNs[n2k.pgn]) {
      const meta = metaPGNs[n2k.pgn](n2k)
      if (!this.state[n2k.src]) {
        this.state[n2k.src] = {}
      }

      if (n2k.pgn === 60928) {
        const canName = canNameFromClaim(n2k.fields!)
        if (
          this.state[n2k.src].canName &&
          this.state[n2k.src].canName != canName
        ) {
          // clear out any existing state since the src addresses have changed
          this.emit(
            'n2kSourceChanged',
            n2k.src,
            this.state[n2k.src].canName,
            canName
          )
          this.state[n2k.src] = {}
          this.requestMetaData(n2k.src, 126996).then(() => {
            return this.requestMetaData(n2k.src, 126998)
          })
        }
        this.state[n2k.src].deviceInstance = meta.deviceInstance
        meta.canName = canName
        this.state[n2k.src].canName = canName
      }

      const srcState = this.state[n2k.src]
      if (!srcState.metaPGNsReceived) {
        srcState.metaPGNsReceived = {}
      }

      srcState.metaPGNsReceived[n2k.pgn] = Date.now()

      this.emit('n2kSourceMetadata', n2k, meta)
    } else {
      if (!n2kMappings[n2k.pgn]) {
        if (!this.unknownPGNs[n2k.src]) {
          this.unknownPGNs[n2k.src] = {}
        }
        if (!this.unknownPGNs[n2k.src][n2k.pgn]) {
          this.unknownPGNs[n2k.src][n2k.pgn] = n2k
          this.emit('n2kSourceMetadata', n2k, {
            unknownPGNs: this.unknownPGNs[n2k.src]
          })
        }
      }
      return toDelta(
        n2k,
        this.state,
        this.customPgns,
        this.instancePrefixOverrides.resolver,
        this.instancePrefixOverrides.reportedThrows
      )
    }
  }
}

// A toDelta call without a mapper has no mapper to keep the throws it
// logged on; they are keyed by its resolver.
const standaloneThrows = new WeakMap<InstancePrefixResolver, Set<string>>()

function standaloneReportedThrows (resolver: InstancePrefixResolver) {
  let reported = standaloneThrows.get(resolver)
  if (reported === undefined) {
    reported = new Set()
    standaloneThrows.set(resolver, reported)
  }
  return reported
}

/**
 * reportedThrows holds the pgn:src keys the resolver's throws have been
 * logged for; without it they are keyed by the resolver.
 */
export function toDelta (
  n2k: N2kReport,
  state?: MapperState,
  customPgns: Record<string, Mapping[]> = {},
  instancePrefixResolver?: InstancePrefixResolver,
  reportedThrows?: Set<string>
): Delta | undefined {
  try {
    const theMappings: Mapping[] = [
      ...(customPgns[n2k.pgn] || []),
      ...(n2kMappings[n2k.pgn] || [])
    ]

    let src_state: MapperSourceState | undefined
    if (state) {
      var n2k_src = n2k.src.toString()
      if (!state[n2k_src]) {
        state[n2k_src] = {}
      }
      src_state = state[n2k_src]
      const resolver = hasInstanceGroup(n2k.pgn)
        ? instancePrefixResolver
        : undefined
      if (resolver || src_state[RESOLVER]) {
        src_state[RESOLVER] =
          resolver &&
          resolverBinding(
            resolver,
            reportedThrows || standaloneReportedThrows(resolver)
          )
      }
    }
    // The mappings that apply to this report, selected once: the values and
    // the context both come from this set.
    const applying = theMappings.filter(theMapping =>
      mappingApplies(theMapping, n2k, src_state)
    )

    const result: Delta = {
      updates: [
        {
          source: {
            label: '',
            type: 'NMEA2000',
            pgn: Number(n2k.pgn),
            src: n2k.src.toString()
          },
          timestamp:
            n2k.timestamp.substring(0, 10) +
            'T' +
            n2k.timestamp.substring(11, n2k.timestamp.length),
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
        let last = result.context.lastIndexOf(':')
        if (last != -1 && result.context.slice(last + 1).length < 9) {
          console.error('bad MMSI: ' + result.context)
          return
        }
      }

      if (theMappings.length === 1 && theMappings[0].instance) {
        result.updates[0].source.instance = theMappings[0].instance(n2k)
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

function getValue (
  n2k: N2kReport,
  fields: Fields,
  source: string | undefined,
  theMapping: PathMapping,
  state: MapperSourceState | undefined
): unknown {
  if (typeof source !== 'undefined') {
    var stringValue = fields[source]
    if (!stringValue && stringValue != '') {
      return undefined
    }
    var numberValue = Number(stringValue)
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
function warnNoPath (n2k: N2kReport) {
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
function mappingApplies (
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
function toValuesArray (
  theMappings: Mapping[],
  n2k: N2kReport,
  state: MapperSourceState | undefined
): PathValue[] {
  const fields = n2k.fields
  if (fields && typeof theMappings !== 'undefined') {
    return theMappings
      .reduce<MappedValue[]>((updates, theMapping) => {
        try {
          if (typeof theMapping === 'function') {
            Array.prototype.push.apply(updates, theMapping(n2k, state))
          } else {
            var path =
              typeof theMapping.node === 'function'
                ? theMapping.node(n2k, state)
                : theMapping.node
            var value =
              typeof theMapping.source === 'function'
                ? theMapping.source(n2k, state)
                : getValue(n2k, fields, theMapping.source, theMapping, state)
            var allowNull =
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

const metaPGNs: Record<string, (n2k: N2kReport) => MetaData> = {
  60928: n2k => {
    return {
      ...n2k.fields,
      deviceInstance:
        (Number(n2k.fields!.deviceInstanceUpper) << 3) |
        Number(n2k.fields!.deviceInstanceLower)
    }
  },
  126998: n2k => n2k.fields!,
  126996: n2k => n2k.fields!
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

export function toDeltaTransformer (
  options: unknown,
  state?: MapperState
): Stream {
  return through(function (data) {
    // toDelta returns nothing for a report it drops (an AIS report without a
    // valid MMSI, for one); queueing undefined would still emit a 'data' event.
    const delta = toDelta(data, state)
    if (delta !== undefined) {
      this.queue(delta)
    }
  })
}
