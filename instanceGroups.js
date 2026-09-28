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
const {
  lookupEnumerationName,
  lookupEnumerationValue
} = require('@canboat/canboatjs')
const { skEngineId, skEngineTitle } = require('./utils.js')
const temperatureMappings = require('./temperatureMappings')
const humidityMappings = require('./humidityMappings')
const pressureMappings = require('./pressureMappings')

/**
 * @typedef {'engine' | 'battery' | 'charger' | 'inverter' | 'acInput' | 'tank'
 *   | 'temperature' | 'humidity' | 'pressure' | 'acConnection' | 'converter'
 *   | 'dcConnection'} InstanceGroupId
 *
 * @typedef {object} InstanceGroup
 * @property {InstanceGroupId} id
 * @property {number[]} pgns
 * @property {string} instanceField
 * @property {number} maxInstance Instance codes run 0..maxInstance, the
 *   field's "no data" code included.
 * @property {boolean} singleLeaf True when the prefix is the one leaf path
 *   the group writes.
 * @property {string | undefined} discriminatorField Tank type or sensor source.
 * @property {ReadonlySet<number> | undefined} discriminatorCodes Codes a
 *   group PGN writes a path for; undefined without a discriminator.
 *
 * @typedef {object} InstanceClassification
 * @property {InstanceGroupId} group
 * @property {number | undefined} discriminator
 * @property {number} instance
 *
 * @typedef {{ pgn: number | string, src: number | string,
 *   fields?: Record<string, unknown> }} N2kFrame
 *
 * @typedef {object} InstancePrefixContext
 * @property {InstanceGroupId} group
 * @property {number | undefined} discriminator Numeric tank type or sensor
 *   source code; undefined for groups without a discriminator.
 * @property {number} instance Numeric instance code; an absent instance is
 *   its "no data" code.
 * @property {number | string} src Source address of the frame.
 * @property {string | undefined} canName Undefined until the source's PGN
 *   60928 has been seen.
 */

/**
 * Replaces the prefix a frame's instance is written under. A non-empty string
 * replaces it; anything else keeps the default.
 *
 * @callback InstancePrefixResolver
 * @param {InstancePrefixContext} context
 * @returns {string | null | undefined | void}
 */

// canboatjs omits a field holding its "no data" value; codes represent the
// absent field with that value.
const ABSENT_8BIT = 255
const ABSENT_4BIT = 15
const INDEX = '<index>'
const SPACES = / /g

const instanceUnder = base => n2k => `${base}.${n2k.fields.instance}`

const connectionUnder = base => n2k =>
  `${base}.${n2k.src}.${n2k.fields.connectionNumber}`

const enginePrefix = n2k => 'propulsion.' + skEngineId(n2k)

const tankMappings = {
  Fuel: 'fuel',
  Water: 'freshWater',
  'Gray water': 'wasteWater',
  'Live well': 'liveWell',
  Oil: 'lubrication',
  'Black water': 'blackWater'
}

const tankPrefix = n2k =>
  'tanks.' + tankMappings[n2k.fields.type] + '.' + n2k.fields.instance

function mappedPath (mapping, index) {
  return mapping.pathWithIndex
    ? mapping.pathWithIndex.replace(INDEX, index)
    : mapping.path
}

// 130312 writes no path without a source, defaults a missing instance to 0
// and replaces spaces in an unmapped source name.
function temperaturePath (n2k) {
  const { source, instance } = n2k.fields
  if (source == null) {
    return null
  }
  const index = instance != null ? instance : 0
  const mapping = temperatureMappings[source]
  if (mapping) {
    return mappedPath(mapping, index)
  }
  return `generic.temperatures.userDefined${source
    .toString()
    .replace(SPACES, '_')}.${index}.temperature`
}

// 130316 interpolates source and instance as they are.
function temperatureExtendedPath (n2k) {
  const { source, instance } = n2k.fields
  const mapping = temperatureMappings[source]
  if (mapping) {
    return mappedPath(mapping, instance)
  }
  return `generic.temperatures.userDefined${source}.${instance}.temperature`
}

function humidityPath (n2k) {
  const { source, instance } = n2k.fields
  const mapping = humidityMappings[source]
  if (mapping) {
    return mappedPath(mapping, instance)
  }
  return `environment.userDefined${source}.${instance}.relativeHumidity`
}

function pressurePath (n2k) {
  const mapping = pressureMappings[n2k.fields.source]
  return mapping ? mappedPath(mapping, n2k.fields.instance) : undefined
}

const byInstance = (id, prefixes) => ({
  id,
  instanceField: 'instance',
  absentInstance: ABSENT_8BIT,
  singleLeaf: false,
  prefixes
})

const bySource = (id, enumName, prefixes) => ({
  id,
  instanceField: 'instance',
  absentInstance: ABSENT_8BIT,
  singleLeaf: true,
  discriminator: { field: 'source', enumName, absent: ABSENT_8BIT },
  prefixes
})

const byConnection = (id, prefixes) => ({
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
const GROUP_SPECS = [
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

const PGN_INDEX = new Map()
const SPECS_BY_ID = new Map()
for (const spec of GROUP_SPECS) {
  SPECS_BY_ID.set(spec.id, spec)
  for (const [pgn, prefix] of Object.entries(spec.prefixes)) {
    PGN_INDEX.set(Number(pgn), { spec, prefix })
  }
}

// The field as canboatjs decodes it: its lookup name, the number when the
// enumeration has no name for it, or absent.
function fieldView (code, enumName, absent) {
  if (code === absent) {
    return undefined
  }
  const name = enumName ? lookupEnumerationName(enumName, code) : undefined
  return name !== undefined ? name : code
}

function fieldCode (value, enumName, absent) {
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
 *
 * @param {InstanceGroupId} groupId
 * @param {number | undefined} discriminator
 * @param {number} instance
 * @param {number | string} src
 * @param {number | string} [pgn]
 * @returns {string | undefined}
 */
function defaultPrefix (groupId, discriminator, instance, src, pgn) {
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
  const fields = {
    [spec.instanceField]: fieldView(
      instance,
      spec.instanceEnum,
      spec.absentInstance
    )
  }
  if (spec.discriminator) {
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
 *
 * @param {N2kFrame} n2k
 * @returns {InstanceClassification | undefined}
 */
function classifyInstance (n2k) {
  const entry = PGN_INDEX.get(Number(n2k.pgn))
  if (!entry || !n2k.fields) {
    return undefined
  }
  const { spec, prefix } = entry
  const instance = fieldCode(
    n2k.fields[spec.instanceField],
    spec.instanceEnum,
    spec.absentInstance
  )
  if (instance === undefined) {
    return undefined
  }
  let discriminator
  if (spec.discriminator) {
    discriminator = fieldCode(
      n2k.fields[spec.discriminator.field],
      spec.discriminator.enumName,
      spec.discriminator.absent
    )
    if (discriminator === undefined) {
      return undefined
    }
  }
  if (prefix(n2k) == null) {
    return undefined
  }
  return { group: spec.id, discriminator, instance }
}

// Key of the resolver binding on the per-source state. A symbol keeps it out
// of Object.keys and JSON of the state. toDelta stores a fresh binding per
// frame, so a result cached on it never outlives the frame.
const RESOLVER = Symbol('instancePrefixResolver')

/**
 * The binding toDelta stores on the per-source state for one frame.
 *
 * @param {InstancePrefixResolver} resolver
 */
function resolverBinding (resolver) {
  return { resolver, frame: undefined, prefix: undefined }
}

function resolve (resolver, n2k, state) {
  const classification = classifyInstance(n2k)
  if (!classification) {
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
 *
 * @param {N2kFrame} n2k
 * @param {object | undefined} state
 * @returns {string | undefined}
 */
function resolvedPrefix (n2k, state) {
  const binding = state && state[RESOLVER]
  if (!binding) {
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
 *
 * @param {N2kFrame} n2k
 * @param {object | undefined} state
 * @returns {string | null | undefined}
 */
function instancePrefix (n2k, state) {
  const resolved = resolvedPrefix(n2k, state)
  return resolved !== undefined
    ? resolved
    : PGN_INDEX.get(Number(n2k.pgn)).prefix(n2k)
}

/**
 * The engine's name in alarm messages: the last segment of the resolved
 * prefix, so a remapped engine is not called "Port", or the default title.
 *
 * @param {N2kFrame} n2k
 * @param {object | undefined} state
 * @returns {string | number}
 */
function engineTitle (n2k, state) {
  const resolved = resolvedPrefix(n2k, state)
  if (resolved === undefined) {
    return skEngineTitle(n2k)
  }
  const name = resolved.slice(resolved.lastIndexOf('.') + 1)
  return name.charAt(0).toUpperCase() + name.slice(1)
}

function discriminatorCodes (spec) {
  if (!spec.discriminator) {
    return undefined
  }
  const codes = new Set()
  for (let code = 0; code <= spec.discriminator.absent; code++) {
    for (const pgn of Object.keys(spec.prefixes)) {
      if (defaultPrefix(spec.id, code, 0, 0, pgn) !== undefined) {
        codes.add(code)
      }
    }
  }
  return codes
}

/** @type {readonly Readonly<InstanceGroup>[]} */
const instanceGroups = GROUP_SPECS.map(spec =>
  Object.freeze({
    id: spec.id,
    pgns: Object.keys(spec.prefixes).map(Number),
    instanceField: spec.instanceField,
    maxInstance: spec.absentInstance,
    singleLeaf: spec.singleLeaf,
    discriminatorField: spec.discriminator && spec.discriminator.field,
    discriminatorCodes: discriminatorCodes(spec)
  })
)

module.exports = {
  instanceGroups,
  classifyInstance,
  defaultPrefix,
  instancePrefix,
  engineTitle,
  RESOLVER,
  resolverBinding
}
