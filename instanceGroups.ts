/*
 * Instance-bearing PGNs grouped by what their instance numbers identify (an
 * engine, a battery, a tank of one type...), and the Signal K path prefix
 * each PGN writes an instance under.
 *
 * Multi-leaf groups (engine, battery, tank...) use the instance's parent path
 * as the prefix. Single-leaf groups (temperature, humidity, pressure) use the
 * full leaf path: their parents are shared with unrelated data
 * (environment.outside, propulsion.<n>...).
 *
 * Every prefix is computed from the frame's fields as canboatjs decodes them
 * (lookup names, numbers, or absent). defaultPrefix turns numeric codes back
 * into that form, so the mapper and defaultPrefix share one implementation.
 */
import {
  getEnumerationName as lookupEnumerationName,
  getEnumerationValue as lookupEnumerationValue
} from '@canboat/ts-pgns'
import { skEngineId, skEngineTitle } from './utils.js'
import temperatureMappings from './temperatureMappings.js'
import humidityMappings from './humidityMappings.js'
import pressureMappings from './pressureMappings.js'

export type InstanceGroupId =
  | 'engine'
  | 'battery'
  | 'charger'
  | 'inverter'
  | 'acInput'
  | 'tank'
  | 'temperature'
  | 'humidity'
  | 'pressure'
  | 'acConnection'
  | 'converter'
  | 'dcConnection'

export interface InstanceGroup {
  id: InstanceGroupId
  pgns: number[]
  instanceField: string
  /**
   * The highest instance code a frame arrives with: canboatjs leaves out the
   * field's reserved codes (253..255 of an 8-bit number, 14 and 15 of the
   * tank's 4 bits), so a frame carrying one has no instance.
   */
  maxInstance: number
  /**
   * The @canboat/ts-pgns enumeration naming the instance codes, e.g.
   * ENGINE_INSTANCE; undefined when they are plain numbers.
   */
  instanceEnum: string | undefined
  /** True when the prefix is the one leaf path the group writes. */
  singleLeaf: boolean
  /** Tank type or sensor source. */
  discriminatorField: string | undefined
  /**
   * The @canboat/ts-pgns enumeration naming the discriminator codes, e.g.
   * TANK_TYPE or TEMPERATURE_SOURCE; undefined without a discriminator.
   */
  discriminatorEnum: string | undefined
  /**
   * Codes a group PGN writes a path for, ascending, the absent field's code
   * left out; undefined without a discriminator.
   */
  discriminatorCodes: readonly number[] | undefined
}

export interface InstanceClassification {
  group: InstanceGroupId
  discriminator: number | undefined
  instance: number
}

/**
 * A decoded frame. @canboat/ts-pgns types src as optional, but every frame
 * the mapper receives carries one.
 */
export interface N2kFrame {
  pgn: number | string
  src?: number | string
  fields?: object
}

export interface InstancePrefixContext {
  group: InstanceGroupId
  /**
   * Numeric tank type or sensor source code; undefined for groups without a
   * discriminator.
   */
  discriminator: number | undefined
  /** Numeric instance code; an absent instance is its "no data" code. */
  instance: number
  /** Source address of the frame. */
  src: number | string
  /** Undefined until the source's PGN 60928 has been seen. */
  canName: string | undefined
  /**
   * The manufacturer code of the NAME (bits 21-31); undefined until the
   * source's PGN 60928 has been seen.
   */
  manufacturerCode: number | undefined
  /**
   * The unique number of the NAME (bits 0-20); undefined until the source's
   * PGN 60928 has been seen.
   */
  uniqueNumber: number | undefined
}

/**
 * Replaces the prefix a frame's instance is written under. A valid prefix
 * (see isValidPrefix) replaces it; undefined or null keeps the default, and
 * so does anything else, which is logged.
 */
export type InstancePrefixResolver = (
  context: InstancePrefixContext
) => string | null | undefined | void

type Fields = Record<string, unknown>

const PREFIX = /^[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*$/
// Segments that would reach Object.prototype in a full tree built from paths.
const RESERVED_SEGMENTS = new Set(['__proto__', 'constructor', 'prototype'])

/**
 * True for a prefix the mapper writes paths under: dot-separated segments of
 * A-Z, a-z, 0-9, _ and -, none of them __proto__, constructor or prototype.
 */
export function isValidPrefix(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    PREFIX.test(value) &&
    !value.split('.').some((segment) => RESERVED_SEGMENTS.has(segment))
  )
}

// What a prefix reads of a frame.
interface PrefixFrame {
  src?: number | string
  fields: Fields
}

// The device a prefix may be named after, from its address claim and product
// information.
export interface PrefixDevice {
  modelId?: string
  deviceInstance?: number
}

type Prefix = (
  n2k: PrefixFrame,
  device?: PrefixDevice
) => string | null | undefined

interface PathMapping {
  path?: string
  pathWithIndex?: string
}

interface Discriminator {
  field: string
  enumName: string
  absent: number
}

interface GroupSpec {
  id: InstanceGroupId
  instanceField: string
  absentInstance: number
  maxInstance: number
  singleLeaf: boolean
  instanceEnum?: string
  discriminator?: Discriminator
  prefixes: Record<number, Prefix>
}

// canboatjs omits a field holding its "no data" value; codes represent the
// absent field with that value.
const ABSENT_8BIT = 255
const ABSENT_4BIT = 15
// canboatjs leaves out a number field's reserved codes, 253..255 of 8 bits
// and 14 and 15 of 4 bits. The ENGINE_INSTANCE lookup decodes 253 and 254.
const MAX_8BIT = 252
const MAX_4BIT = 13
const MAX_ENGINE_INSTANCE = 254
const INDEX = '<index>'
const SPACES = / /g
const NOT_ALPHANUMERIC = /[^A-Za-z0-9]/g

const temperatures: Record<string, PathMapping> = temperatureMappings
const humidities: Record<string, PathMapping> = humidityMappings
const pressures: Record<string, PathMapping> = pressureMappings

// ts-pgns types each PGN's fields as an interface of its own; a prefix reads
// them by name.
function prefixFrame(n2k: N2kFrame): PrefixFrame {
  return { src: n2k.src, fields: n2k.fields as Fields }
}

const instanceUnder =
  (base: string): Prefix =>
  (n2k) =>
    `${base}.${n2k.fields.instance}`

const connectionUnder =
  (base: string): Prefix =>
  (n2k) =>
    `${base}.${n2k.src}.${n2k.fields.connectionNumber}`

const enginePrefix: Prefix = (n2k) => 'propulsion.' + skEngineId(n2k)

const TANK_TYPES = new Map<unknown, string>([
  ['Fuel', 'fuel'],
  ['Water', 'freshWater'],
  ['Gray water', 'wasteWater'],
  ['Live well', 'liveWell'],
  ['Oil', 'lubrication'],
  ['Black water', 'blackWater']
])

/**
 * The tanks.<type> segment for a 127505 tank type as canboatjs decodes it, or
 * undefined for a type the mapper writes no path for.
 */
export function skTankType(type: unknown): string | undefined {
  return TANK_TYPES.get(type)
}

const tankPrefix: Prefix = (n2k) => {
  const type = skTankType(n2k.fields.type)
  return type === undefined
    ? undefined
    : 'tanks.' + type + '.' + n2k.fields.instance
}

function mappedPath(mapping: PathMapping, index: unknown) {
  return mapping.pathWithIndex
    ? mapping.pathWithIndex.replace(INDEX, String(index))
    : mapping.path
}

// 130312, 130313, 130314 and 130316 write no path without a source, default
// a missing instance to 0 and replace spaces in an unmapped source name.
const sourcePath =
  (mappings: Record<string, PathMapping>, base: string, leaf: string): Prefix =>
  (n2k) => {
    const { source, instance } = n2k.fields
    if (source == null) {
      return null
    }
    const index = instance != null ? instance : 0
    const mapping = mappings[String(source)]
    if (mapping) {
      return mappedPath(mapping, index)
    }
    return `${base}.userDefined${String(source).replace(
      SPACES,
      '_'
    )}.${index}.${leaf}`
  }

const temperaturePath = sourcePath(
  temperatures,
  'generic.temperatures',
  'temperature'
)
const humidityPath = sourcePath(humidities, 'environment', 'relativeHumidity')
const pressurePath = sourcePath(pressures, 'generic.pressures', 'pressure')

const byInstance = (
  id: InstanceGroupId,
  prefixes: Record<number, Prefix>
): GroupSpec => ({
  id,
  instanceField: 'instance',
  absentInstance: ABSENT_8BIT,
  maxInstance: MAX_8BIT,
  singleLeaf: false,
  prefixes
})

const bySource = (
  id: InstanceGroupId,
  enumName: string,
  prefixes: Record<number, Prefix>
): GroupSpec => ({
  id,
  instanceField: 'instance',
  absentInstance: ABSENT_8BIT,
  maxInstance: MAX_8BIT,
  singleLeaf: true,
  discriminator: { field: 'source', enumName, absent: ABSENT_8BIT },
  prefixes
})

const byConnection = (
  id: InstanceGroupId,
  prefixes: Record<number, Prefix>
): GroupSpec => ({
  id,
  instanceField: 'connectionNumber',
  absentInstance: ABSENT_8BIT,
  maxInstance: MAX_8BIT,
  singleLeaf: false,
  prefixes
})

const batteries = instanceUnder('electrical.batteries')
const chargers = instanceUnder('electrical.chargers')
const inverters = instanceUnder('electrical.inverters')
// The schema has one alphanumeric key for an AC bus: the device's model and
// instance, and the connection when it is not 0. Nothing is written until the
// device has told the mapper both; a rule or resolver does not need them.
const acConnections: Prefix = (n2k, device) => {
  const { connectionNumber } = n2k.fields
  const model = String(device?.modelId ?? '').replace(NOT_ALPHANUMERIC, '')
  if (!model || device?.deviceInstance == null || connectionNumber == null) {
    return null
  }
  const connection = connectionNumber === 0 ? '' : `c${connectionNumber}`
  return `electrical.ac.${model}${device.deviceInstance}${connection}`
}

// Switch banks (127501) are left out: PUT handlers and NMEA 2000 output key
// on their paths. The rudder (127245) is left out: the specification has one
// rudder path, steering.rudderAngle.
const GROUP_SPECS: GroupSpec[] = [
  {
    id: 'engine',
    instanceField: 'instance',
    absentInstance: ABSENT_8BIT,
    maxInstance: MAX_ENGINE_INSTANCE,
    singleLeaf: false,
    instanceEnum: 'ENGINE_INSTANCE',
    prefixes: {
      127488: enginePrefix,
      127489: enginePrefix,
      127493: enginePrefix,
      127497: enginePrefix
    }
  },
  byInstance('battery', {
    127506: batteries,
    127508: batteries,
    127513: batteries
  }),
  byInstance('charger', { 127507: chargers, 127510: chargers }),
  byInstance('inverter', {
    127504: inverters,
    127509: inverters,
    127511: inverters
  }),
  byInstance('acInput', { 127503: instanceUnder('electrical.ac') }),
  {
    id: 'tank',
    instanceField: 'instance',
    absentInstance: ABSENT_4BIT,
    maxInstance: MAX_4BIT,
    singleLeaf: false,
    discriminator: {
      field: 'type',
      enumName: 'TANK_TYPE',
      absent: ABSENT_4BIT
    },
    prefixes: { 127505: tankPrefix }
  },
  bySource('temperature', 'TEMPERATURE_SOURCE', {
    130312: temperaturePath,
    130316: temperaturePath
  }),
  bySource('humidity', 'HUMIDITY_SOURCE', { 130313: humidityPath }),
  bySource('pressure', 'PRESSURE_SOURCE', { 130314: pressurePath }),
  byConnection('acConnection', {
    127744: acConnections,
    127745: acConnections,
    127746: acConnections,
    127747: acConnections,
    127748: acConnections,
    127749: acConnections
  }),
  byConnection('converter', {
    127750: connectionUnder('electrical.converter')
  }),
  byConnection('dcConnection', { 127751: connectionUnder('electrical.dc') })
]

const AC_PHASES = ['A', 'B', 'C']
const acLines = (fields: readonly string[], under = '') =>
  AC_PHASES.flatMap((phase) =>
    fields.map((field) => `${under}${phase}.${field}`)
  )
const AC_LINE_FIELDS = [
  'voltage',
  'current',
  'frequency',
  'breakerSize',
  'realPower',
  'reactivePower',
  'powerFactor'
]

// The paths each group writes under its prefix, outside notifications; ''
// is the prefix itself. Only the engine group writes notifications.
const GROUP_LEAVES: Record<InstanceGroupId, readonly string[]> = {
  engine: [
    'revolutions',
    'drive.trimState',
    'boostPressure',
    'temperature',
    'alternatorVoltage',
    'fuel.rate',
    'fuel.pressure',
    'oilPressure',
    'runTime',
    'oilTemperature',
    'coolantPressure',
    'engineLoad',
    'engineTorque',
    'transmission.oilTemperature',
    'transmission.gear',
    'transmission.oilPressure',
    'trip.fuelUsed',
    'trip.fuelRate.average',
    'trip.fuelRate.economy',
    'trip.fuelRate.instantaneousEconomy'
  ],
  battery: [
    'capacity.stateOfCharge',
    'capacity.stateOfHealth',
    'capacity.timeRemaining',
    'capacity.nominal',
    'voltage',
    'current',
    'temperature',
    'batteryType',
    'supportsEqualization',
    'nominalVoltage',
    'chemistry',
    'temperatureCoefficient',
    'peukertExponent',
    'chargeEfficiencyFactor'
  ],
  charger: [
    'operatingState',
    'chargeMode',
    'enabled',
    'equalizationPending',
    'equalizationTimeRemaining',
    'chargeCurrentLimit',
    'chargingAlgorithm',
    'estimatedTemperature',
    'equalizeOneTimeEnabled',
    'overChargeEnabled',
    'equalizeTime'
  ],
  inverter: [
    ...acLines(['waveform', ...AC_LINE_FIELDS]),
    'operatingState',
    'enabled',
    'inverterMode',
    'loadSenseEnabled',
    'loadSensePowerThreshold',
    'loadSenseInterval'
  ],
  acInput: acLines(['acceptability', ...AC_LINE_FIELDS]),
  tank: ['currentLevel', 'capacity'],
  temperature: [''],
  humidity: [''],
  pressure: [''],
  acConnection: acLines(
    [
      'realPower',
      'current',
      'lineNeutralVoltage',
      'lineLineVoltage',
      'frequency'
    ],
    'phase.'
  ),
  converter: [
    'operatingState',
    'temperatureState',
    'overloadState',
    'lowDCVoltageState',
    'rippleState'
  ],
  dcConnection: ['voltage', 'current']
}

/** The paths a group writes under its prefix; '' is the prefix itself. */
export function groupLeaves(id: InstanceGroupId): readonly string[] {
  return GROUP_LEAVES[id]
}

const atOrUnder = (path: string, base: string) =>
  base === '' || path === base || path.startsWith(base + '.')

/**
 * True when two groups at one prefix write a path that is, or is under, a
 * path the other writes: one device's values would replace each other, or a
 * value would sit where the other group writes a branch.
 */
export function leavesCollide(a: InstanceGroupId, b: InstanceGroupId) {
  return GROUP_LEAVES[a].some((leaf) =>
    GROUP_LEAVES[b].some(
      (other) => atOrUnder(leaf, other) || atOrUnder(other, leaf)
    )
  )
}

const PGN_INDEX = new Map<number, { spec: GroupSpec; prefix: Prefix }>()
const SPECS_BY_ID = new Map<InstanceGroupId, GroupSpec>()
for (const spec of GROUP_SPECS) {
  SPECS_BY_ID.set(spec.id, spec)
  for (const [pgn, prefix] of Object.entries(spec.prefixes)) {
    PGN_INDEX.set(Number(pgn), { spec, prefix })
  }
}

// The field as canboatjs decodes it: its lookup name, the number when the
// enumeration has no name for it, or absent.
function fieldView(
  code: number,
  enumName: string | undefined,
  absent: number
): string | number | undefined {
  if (code === absent) {
    return undefined
  }
  const name = enumName ? lookupEnumerationName(enumName, code) : undefined
  return name !== undefined ? name : code
}

function fieldCode(
  value: unknown,
  enumName: string | undefined,
  absent: number
): number | undefined {
  if (value == null) {
    return absent
  }
  if (typeof value === 'number') {
    return value
  }
  if (typeof value === 'string' && enumName) {
    return lookupEnumerationValue(enumName, value)
  }
  return undefined
}

/**
 * The Signal K path prefix a PGN of the group writes this instance under, or
 * undefined when it writes none. Codes are numeric; an absent field is its
 * "no data" code (255, or 15 for tank fields), which is also what a frame
 * carrying a reserved code above maxInstance arrives as. For a single-leaf
 * group the prefix is the full leaf path.
 *
 * Temperature is the one group whose PGNs spell a prefix differently: 130312
 * replaces spaces in an unmapped source name and writes an absent instance as
 * 0, 130316 does neither. pgn picks the spelling and defaults to the group's
 * first PGN; iterate the group's pgns to get every spelling. The AC connection
 * group's prefix is named after the device, and is undefined without one.
 */
export function defaultPrefix(
  groupId: InstanceGroupId,
  discriminator: number | undefined,
  instance: number,
  src: number | string,
  pgn?: number | string,
  device?: PrefixDevice
): string | undefined {
  const spec = SPECS_BY_ID.get(groupId)
  if (
    !spec ||
    (spec.discriminator === undefined) !== (discriminator === undefined)
  ) {
    return undefined
  }
  const prefix =
    pgn === undefined
      ? Object.values(spec.prefixes)[0]
      : spec.prefixes[Number(pgn)]
  if (!prefix) {
    return undefined
  }
  const fields: Fields = {
    [spec.instanceField]: fieldView(
      instance,
      spec.instanceEnum,
      spec.absentInstance
    )
  }
  if (spec.discriminator && discriminator !== undefined) {
    fields[spec.discriminator.field] = fieldView(
      discriminator,
      spec.discriminator.enumName,
      spec.discriminator.absent
    )
  }
  const path = prefix({ src, fields }, device)
  return path == null ? undefined : path
}

// Whether a frame writes a path does not depend on the device that sent it.
const ANY_DEVICE: PrefixDevice = { modelId: 'any', deviceInstance: 0 }

/**
 * The group, discriminator code and instance code of a decoded frame, or
 * undefined for PGNs outside the group table and frames the mapper writes no
 * instance path for.
 */
export function classifyInstance(
  n2k: N2kFrame
): InstanceClassification | undefined {
  const entry = PGN_INDEX.get(Number(n2k.pgn))
  if (!entry || !n2k.fields) {
    return undefined
  }
  const { spec, prefix } = entry
  const frame = prefixFrame(n2k)
  const instance = fieldCode(
    frame.fields[spec.instanceField],
    spec.instanceEnum,
    spec.absentInstance
  )
  if (instance === undefined) {
    return undefined
  }
  let discriminator
  if (spec.discriminator) {
    discriminator = fieldCode(
      frame.fields[spec.discriminator.field],
      spec.discriminator.enumName,
      spec.discriminator.absent
    )
    if (discriminator === undefined) {
      return undefined
    }
  }
  if (prefix(frame, ANY_DEVICE) == null) {
    return undefined
  }
  return { group: spec.id, discriminator, instance }
}

// Key of the resolver binding on the per-source state. A symbol keeps it out
// of Object.keys and JSON of the state. toDelta stores a fresh binding for
// each frame of an instance PGN and clears it for any other frame, so a
// result cached on it never outlives the frame.
export const RESOLVER = Symbol('instancePrefixResolver')

/**
 * Key of a resolver's device scope: whether it can return a prefix for a
 * device. A frame from a device outside it is not classified.
 */
export const DEVICE_SCOPE = Symbol('deviceScope')

export interface ScopedResolver extends InstancePrefixResolver {
  [DEVICE_SCOPE]?: (device: DeviceIdentity | undefined) => boolean
}

interface ResolverBinding {
  resolver: ScopedResolver
  /** The pgn:src keys the resolver's throws and invalid prefixes have been logged for. */
  reported: Set<string>
  resolved: boolean
  prefix: string | undefined
}

// Key of the device identity decoded from the per-source state's canName, kept
// until the canName changes so a frame reads it without decoding.
const DEVICE = Symbol('device')

interface Device {
  canName: string
  identity: DeviceIdentity | undefined
}

/** The per-source state toDelta passes to a mapping. */
export interface SourceState extends PrefixDevice {
  canName?: string
  [RESOLVER]?: ResolverBinding
  [DEVICE]?: Device
}

/** The binding toDelta stores on the per-source state for one frame. */
export function resolverBinding(
  resolver: InstancePrefixResolver,
  reported: Set<string>
): ResolverBinding {
  return { resolver, reported, resolved: false, prefix: undefined }
}

/** True when the PGN writes paths under an instance prefix. */
export function hasInstanceGroup(pgn: number | string): boolean {
  return PGN_INDEX.has(Number(pgn))
}

/**
 * True when the frame's default prefix is named after its device and the
 * mapper does not know enough of the device to write it, and no rule or
 * resolver names it instead. Call it after toDelta, which binds the resolver.
 */
export function awaitsDevice(
  n2k: N2kFrame,
  state: SourceState | undefined
): boolean {
  return (
    PGN_INDEX.get(Number(n2k.pgn))?.prefix === acConnections &&
    classifyInstance(n2k) !== undefined &&
    instancePrefix(n2k, state) == null
  )
}

// The low 32 bits of the NAME: the unique number in bits 0-20, then the
// manufacturer code in bits 21-31.
export const UNIQUE_NUMBER_BITS = 21
export const UNIQUE_NUMBER_MASK = 0x1fffff
export const MANUFACTURER_CODE_MASK = 0x7ff
/**
 * 2^21, the place value of the manufacturer code: shifting it left by 21
 * would overflow JavaScript's signed 32 bits for codes of 1024 and above.
 */
export const UNIQUE_NUMBERS = UNIQUE_NUMBER_MASK + 1

// The NAME as n2kMapper renders it: hex, at most 64 bits.
const CAN_NAME_HEX = /^[0-9a-f]{1,16}$/i
// The low 32 bits of the NAME: the last 8 hex digits.
const LOW_WORD_DIGITS = 8

/** The device a NAME identifies, as instance prefix rules key it. */
export interface DeviceIdentity {
  manufacturerCode: number
  uniqueNumber: number
}

/**
 * The manufacturer code and unique number of a canName as the mapper renders
 * it in deltas, or undefined for a value that is not one.
 */
export function deviceIdentity(canName: string): DeviceIdentity | undefined {
  if (typeof canName !== 'string' || !CAN_NAME_HEX.test(canName)) {
    return undefined
  }
  const low = parseInt(canName.slice(-LOW_WORD_DIGITS), 16)
  return {
    manufacturerCode: low >>> UNIQUE_NUMBER_BITS,
    uniqueNumber: low & UNIQUE_NUMBER_MASK
  }
}

// The device the state's canName names, decoded once per canName.
function deviceOf(state: SourceState): Device | undefined {
  const { canName } = state
  if (canName === undefined) {
    return undefined
  }
  let device = state[DEVICE]
  if (device === undefined || device.canName !== canName) {
    device = { canName, identity: deviceIdentity(canName) }
    state[DEVICE] = device
  }
  return device
}

function resolve(resolver: ScopedResolver, n2k: N2kFrame, state: SourceState) {
  const device = deviceOf(state)
  const identity = device && device.identity
  const scope = resolver[DEVICE_SCOPE]
  if (scope !== undefined && !scope(identity)) {
    return undefined
  }
  const classification = classifyInstance(n2k)
  // toDelta keys the per-source state by src, so a frame with a binding has
  // one; the check narrows ts-pgns' optional src.
  if (!classification || n2k.src === undefined) {
    return undefined
  }
  return resolver({
    group: classification.group,
    discriminator: classification.discriminator,
    instance: classification.instance,
    src: n2k.src,
    canName: state.canName,
    manufacturerCode: identity && identity.manufacturerCode,
    uniqueNumber: identity && identity.uniqueNumber
  })
}

// Logs the first failure of the resolver for the frame's PGN and source.
function reportOnce(
  reported: Set<string>,
  n2k: N2kFrame,
  what: string,
  ...detail: unknown[]
) {
  const key = `${n2k.pgn}:${n2k.src}`
  if (reported.has(key)) {
    return
  }
  reported.add(key)
  console.error(
    `n2k-signalk: instancePrefixResolver ${what} for pgn ${n2k.pgn} from src ${
      n2k.src
    }, writing default paths${detail.length > 0 ? ':' : ''}`,
    ...detail
  )
}

/**
 * The prefix the source state's resolver returns for this frame, or undefined
 * when there is no resolver, the frame has no instance or the resolver
 * returns nothing, an invalid prefix or throws. Every mapping of a frame asks;
 * the resolver runs once. A throw or an invalid prefix is logged the first
 * time one happens for the binding's reported set, PGN and source.
 */
function resolvedPrefix(n2k: N2kFrame, state: SourceState | undefined) {
  const binding = state && state[RESOLVER]
  if (!state || !binding) {
    return undefined
  }
  if (!binding.resolved) {
    let prefix
    try {
      const result = resolve(binding.resolver, n2k, state)
      if (isValidPrefix(result)) {
        prefix = result
      } else if (result != null) {
        reportOnce(
          binding.reported,
          n2k,
          `returned the invalid prefix ${JSON.stringify(result)}`
        )
      }
    } catch (ex) {
      reportOnce(binding.reported, n2k, 'threw', ex)
    }
    binding.resolved = true
    binding.prefix = prefix
  }
  return binding.prefix
}

/**
 * The prefix a PGN module writes this frame's instance under. state is the
 * per-source state node() receives.
 */
export function instancePrefix(
  n2k: N2kFrame,
  state: SourceState | undefined
): string | null | undefined {
  const entry = PGN_INDEX.get(Number(n2k.pgn))
  if (!entry) {
    throw new Error(`PGN ${n2k.pgn} has no instance group`)
  }
  const resolved = resolvedPrefix(n2k, state)
  return resolved !== undefined
    ? resolved
    : entry.prefix(prefixFrame(n2k), state)
}

/**
 * The engine's name in alarm messages: the last segment of the resolved
 * prefix, so a remapped engine is not called "Port", or the default title.
 */
export function engineTitle(
  n2k: N2kFrame,
  state: SourceState | undefined
): string | number {
  const resolved = resolvedPrefix(n2k, state)
  if (resolved === undefined) {
    return skEngineTitle(prefixFrame(n2k))
  }
  const name = resolved.slice(resolved.lastIndexOf('.') + 1)
  return name.charAt(0).toUpperCase() + name.slice(1)
}

function discriminatorCodes(spec: GroupSpec) {
  if (!spec.discriminator) {
    return undefined
  }
  const codes: number[] = []
  // A frame without a source writes no path, so the absent code is left out.
  for (let code = 0; code < spec.discriminator.absent; code++) {
    const pgns = Object.keys(spec.prefixes)
    if (
      pgns.some((pgn) => defaultPrefix(spec.id, code, 0, 0, pgn) !== undefined)
    ) {
      codes.push(code)
    }
  }
  return Object.freeze(codes)
}

const frozenGroups = GROUP_SPECS.map((spec) =>
  Object.freeze({
    id: spec.id,
    pgns: Object.keys(spec.prefixes).map(Number),
    instanceField: spec.instanceField,
    maxInstance: spec.maxInstance,
    instanceEnum: spec.instanceEnum,
    singleLeaf: spec.singleLeaf,
    discriminatorField: spec.discriminator && spec.discriminator.field,
    discriminatorEnum: spec.discriminator && spec.discriminator.enumName,
    discriminatorCodes: discriminatorCodes(spec)
  })
)

export const instanceGroups: readonly Readonly<InstanceGroup>[] = frozenGroups
