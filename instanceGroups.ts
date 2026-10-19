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
  /** Instance codes run 0..maxInstance, the field's "no data" code included. */
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
   * Codes a group PGN writes a path for, ascending; undefined without a
   * discriminator.
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
}

/**
 * Replaces the prefix a frame's instance is written under. A non-empty string
 * replaces it; anything else keeps the default.
 */
export type InstancePrefixResolver = (
  context: InstancePrefixContext
) => string | null | undefined | void

type Fields = Record<string, unknown>

// What a prefix reads of a frame.
interface PrefixFrame {
  src?: number | string
  fields: Fields
}

type Prefix = (n2k: PrefixFrame) => string | null | undefined

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
  singleLeaf: boolean
  instanceEnum?: string
  discriminator?: Discriminator
  prefixes: Record<number, Prefix>
}

// canboatjs omits a field holding its "no data" value; codes represent the
// absent field with that value.
const ABSENT_8BIT = 255
const ABSENT_4BIT = 15
const INDEX = '<index>'
const SPACES = / /g

const temperatures: Record<string, PathMapping> = temperatureMappings
const humidities: Record<string, PathMapping> = humidityMappings
const pressures: Record<string, PathMapping> = pressureMappings

// ts-pgns types each PGN's fields as an interface of its own; a prefix reads
// them by name.
function prefixFrame (n2k: N2kFrame): PrefixFrame {
  return { src: n2k.src, fields: n2k.fields as Fields }
}

const instanceUnder = (base: string): Prefix => n2k =>
  `${base}.${n2k.fields.instance}`

const connectionUnder = (base: string): Prefix => n2k =>
  `${base}.${n2k.src}.${n2k.fields.connectionNumber}`

const enginePrefix: Prefix = n2k => 'propulsion.' + skEngineId(n2k)

const tankMappings: Record<string, string> = {
  Fuel: 'fuel',
  Water: 'freshWater',
  'Gray water': 'wasteWater',
  'Live well': 'liveWell',
  Oil: 'lubrication',
  'Black water': 'blackWater'
}

const tankPrefix: Prefix = n2k =>
  'tanks.' + tankMappings[String(n2k.fields.type)] + '.' + n2k.fields.instance

function mappedPath (mapping: PathMapping, index: unknown) {
  return mapping.pathWithIndex
    ? mapping.pathWithIndex.replace(INDEX, String(index))
    : mapping.path
}

// 130312 and 130314 write no path without a source, default a missing
// instance to 0 and replace spaces in an unmapped source name.
const sourcePath = (
  mappings: Record<string, PathMapping>,
  base: string,
  leaf: string
): Prefix => n2k => {
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

// 130313 and 130316 interpolate source and instance as they are.
const rawSourcePath = (
  mappings: Record<string, PathMapping>,
  base: string,
  leaf: string
): Prefix => n2k => {
  const { source, instance } = n2k.fields
  const mapping = mappings[String(source)]
  if (mapping) {
    return mappedPath(mapping, instance)
  }
  return `${base}.userDefined${source}.${instance}.${leaf}`
}

const temperaturePath = sourcePath(
  temperatures,
  'generic.temperatures',
  'temperature'
)
const temperatureExtendedPath = rawSourcePath(
  temperatures,
  'generic.temperatures',
  'temperature'
)
const humidityPath = rawSourcePath(
  humidities,
  'environment',
  'relativeHumidity'
)
const pressurePath = sourcePath(pressures, 'generic.pressures', 'pressure')

const byInstance = (
  id: InstanceGroupId,
  prefixes: Record<number, Prefix>
): GroupSpec => ({
  id,
  instanceField: 'instance',
  absentInstance: ABSENT_8BIT,
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
  singleLeaf: false,
  prefixes
})

const batteries = instanceUnder('electrical.batteries')
const chargers = instanceUnder('electrical.chargers')
const inverters = instanceUnder('electrical.inverters')
const acConnections = connectionUnder('electrical.ac')

// Switch banks (127501) are left out: PUT handlers and NMEA 2000 output key
// on their paths. The rudder (127245) is left out: the specification has one
// rudder path, steering.rudderAngle.
const GROUP_SPECS: GroupSpec[] = [
  {
    id: 'engine',
    instanceField: 'instance',
    absentInstance: ABSENT_8BIT,
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
    130316: temperatureExtendedPath
  }),
  bySource('humidity', 'HUMIDITY_SOURCE', { 130313: humidityPath }),
  bySource('pressure', 'PRESSURE_SOURCE', { 130314: pressurePath }),
  byConnection('acConnection', {
    127744: acConnections,
    127745: acConnections,
    127746: acConnections
  }),
  byConnection('converter', {
    127750: connectionUnder('electrical.converter')
  }),
  byConnection('dcConnection', { 127751: connectionUnder('electrical.dc') })
]

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
function fieldView (
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

function fieldCode (
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
 * "no data" code (255, or 15 for tank fields). For a single-leaf group the
 * prefix is the full leaf path.
 *
 * Temperature is the one group whose PGNs spell a prefix differently: 130312
 * replaces spaces in an unmapped source name and writes an absent instance as
 * 0, 130316 does neither. pgn picks the spelling and defaults to the group's
 * first PGN; iterate the group's pgns to get every spelling.
 */
export function defaultPrefix (
  groupId: InstanceGroupId,
  discriminator: number | undefined,
  instance: number,
  src: number | string,
  pgn?: number | string
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
  const path = prefix({ src, fields })
  return path == null ? undefined : path
}

/**
 * The group, discriminator code and instance code of a decoded frame, or
 * undefined for PGNs outside the group table and frames the mapper writes no
 * instance path for.
 */
export function classifyInstance (
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
  if (prefix(frame) == null) {
    return undefined
  }
  return { group: spec.id, discriminator, instance }
}

// Key of the resolver binding on the per-source state. A symbol keeps it out
// of Object.keys and JSON of the state. toDelta stores a fresh binding per
// frame, so a result cached on it never outlives the frame.
export const RESOLVER = Symbol('instancePrefixResolver')

interface ResolverBinding {
  resolver: InstancePrefixResolver
  frame: N2kFrame | undefined
  prefix: string | undefined
}

/** The per-source state toDelta passes to a mapping. */
export interface SourceState {
  canName?: string
  [RESOLVER]?: ResolverBinding
}

/** The binding toDelta stores on the per-source state for one frame. */
export function resolverBinding (
  resolver: InstancePrefixResolver
): ResolverBinding {
  return { resolver, frame: undefined, prefix: undefined }
}

function resolve (
  resolver: InstancePrefixResolver,
  n2k: N2kFrame,
  state: SourceState
) {
  const classification = classifyInstance(n2k)
  // toDelta keys the per-source state by src, so a frame with a binding has
  // one; the check narrows ts-pgns' optional src.
  if (!classification || n2k.src === undefined) {
    return undefined
  }
  const prefix = resolver({
    group: classification.group,
    discriminator: classification.discriminator,
    instance: classification.instance,
    src: n2k.src,
    canName: state.canName
  })
  return typeof prefix === 'string' && prefix !== '' ? prefix : undefined
}

/**
 * The prefix the source state's resolver returns for this frame, or undefined
 * when there is no resolver, the frame has no instance or the resolver
 * returns nothing. Every mapping of a frame asks; the resolver runs once.
 */
function resolvedPrefix (n2k: N2kFrame, state: SourceState | undefined) {
  const binding = state && state[RESOLVER]
  if (!state || !binding) {
    return undefined
  }
  if (binding.frame !== n2k) {
    const prefix = resolve(binding.resolver, n2k, state)
    binding.frame = n2k
    binding.prefix = prefix
  }
  return binding.prefix
}

/**
 * The prefix a PGN module writes this frame's instance under. state is the
 * per-source state node() receives.
 */
export function instancePrefix (
  n2k: N2kFrame,
  state: SourceState | undefined
): string | null | undefined {
  const entry = PGN_INDEX.get(Number(n2k.pgn))
  if (!entry) {
    throw new Error(`PGN ${n2k.pgn} has no instance group`)
  }
  const resolved = resolvedPrefix(n2k, state)
  return resolved !== undefined ? resolved : entry.prefix(prefixFrame(n2k))
}

/**
 * The engine's name in alarm messages: the last segment of the resolved
 * prefix, so a remapped engine is not called "Port", or the default title.
 */
export function engineTitle (
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

function discriminatorCodes (spec: GroupSpec) {
  if (!spec.discriminator) {
    return undefined
  }
  const codes: number[] = []
  for (let code = 0; code <= spec.discriminator.absent; code++) {
    const pgns = Object.keys(spec.prefixes)
    if (
      pgns.some(pgn => defaultPrefix(spec.id, code, 0, 0, pgn) !== undefined)
    ) {
      codes.push(code)
    }
  }
  return Object.freeze(codes)
}

const frozenGroups = GROUP_SPECS.map(spec =>
  Object.freeze({
    id: spec.id,
    pgns: Object.keys(spec.prefixes).map(Number),
    instanceField: spec.instanceField,
    maxInstance: spec.absentInstance,
    instanceEnum: spec.instanceEnum,
    singleLeaf: spec.singleLeaf,
    discriminatorField: spec.discriminator && spec.discriminator.field,
    discriminatorEnum: spec.discriminator && spec.discriminator.enumName,
    discriminatorCodes: discriminatorCodes(spec)
  })
)

export const instanceGroups: readonly Readonly<InstanceGroup>[] = frozenGroups
