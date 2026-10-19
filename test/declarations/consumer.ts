// Compiled by test/declarations.js against the built declarations: a strict
// consumer that checks library declarations must see typed exports.
import { EventEmitter } from 'events'
import {
  classifyInstance,
  defaultPrefix,
  deviceIdentity,
  DeviceIdentity,
  instanceGroups,
  InstancePrefixResolver,
  InstancePrefixRule,
  InstancePrefixRuleProblem,
  N2kMapper,
  N2kMapperOptions,
  validateInstancePrefixRules
} from '../../dist/n2kMapper'

// never for an export typed any, which no value but never is assignable to.
type Typed<T> = 0 extends 1 & T ? never : T

const prefixOf: Typed<typeof defaultPrefix> = defaultPrefix
const prefix: string | undefined = prefixOf('battery', undefined, 3, 1)
const classify: Typed<typeof classifyInstance> = classifyInstance
const groups: Typed<typeof instanceGroups> = instanceGroups
const codes: readonly number[] | undefined = groups[0].discriminatorCodes
const enums: (string | undefined)[] = [
  groups[0].instanceEnum,
  groups[0].discriminatorEnum
]
const validate: Typed<typeof validateInstancePrefixRules> = validateInstancePrefixRules
const rule: InstancePrefixRule = {
  manufacturerCode: 419,
  uniqueNumber: 76223,
  group: 'engine',
  instance: 0,
  prefix: 'propulsion.main'
}
const problems: InstancePrefixRuleProblem[] = validate([rule])
const identify: Typed<typeof deviceIdentity> = deviceIdentity
const identity: DeviceIdentity | undefined = identify('c0fa8200346129bf')
const ruleFromIdentity: InstancePrefixRule | undefined = identity && {
  ...identity,
  group: 'engine',
  instance: 0,
  prefix: 'propulsion.main'
}

const resolver: InstancePrefixResolver = context =>
  context.group === 'tank' ? `tanks.custom.${context.instance}` : undefined
const options: Typed<ConstructorParameters<typeof N2kMapper>[0]> = {
  instancePrefixRules: [rule],
  instancePrefixResolver: resolver,
  allowCustomPGNOverride: false
}
const namedOptions: Typed<N2kMapperOptions> = options
// @ts-expect-error a resolver is a function
new N2kMapper({ instancePrefixResolver: 'tanks' })
const mapper = new N2kMapper(namedOptions)
const emitter: EventEmitter = mapper

type SetRules = typeof mapper.setInstancePrefixRules
const rules: Typed<Parameters<SetRules>[0]> = [rule]
const ruleProblems: Typed<ReturnType<SetRules>> = mapper.setInstancePrefixRules(
  rules
)
mapper.setInstancePrefixRules(null)
mapper.setInstancePrefixRules(undefined)
new N2kMapper({ instancePrefixRules: null })
// @ts-expect-error rules are a list
mapper.setInstancePrefixRules(rule)

type SetResolver = typeof mapper.setInstancePrefixResolver
const nextResolver: Typed<Parameters<SetResolver>[0]> = resolver
mapper.setInstancePrefixResolver(nextResolver)
mapper.setInstancePrefixResolver(undefined)
// @ts-expect-error a resolver is a function
mapper.setInstancePrefixResolver('tanks')

// signalk-server's call pattern: its options carry an index signature, and it
// maps frames whose pgn may be a string.
interface ServerOptions {
  providerId: string
  [key: string]: unknown
}
interface ServerApp {
  on(event: string, cb: (...args: unknown[]) => void): void
  emit(event: string, ...args: unknown[]): void
}
interface ServerFrame {
  src: string | number
  pgn: string | number
  timestamp: string
}
declare const serverOptions: ServerOptions
declare const app: ServerApp
declare const frame: ServerFrame
const serverMapper = new N2kMapper({
  ...serverOptions,
  sendMetaData: true
}) as N2kMapper & EventEmitter
serverMapper.on(
  'n2kSourceChanged',
  (src: string | number, from: string, to: string) => {}
)
serverMapper.n2kOutIsAvailable(app, 'nmea2000JsonOut')
const serverDelta = serverMapper.toDelta(frame)

export {
  prefix,
  classify,
  groups,
  codes,
  enums,
  problems,
  emitter,
  ruleProblems,
  ruleFromIdentity,
  serverDelta
}
