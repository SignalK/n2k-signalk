/*
 * What a mapper writes instance paths under instead of the default prefix:
 * declarative rules keyed by the device, then a resolver function.
 */
import {
  InstanceGroup,
  InstanceGroupId,
  instanceGroups,
  InstancePrefixContext,
  InstancePrefixResolver,
  MANUFACTURER_CODE_MASK,
  UNIQUE_NUMBER_MASK,
  UNIQUE_NUMBERS
} from './instanceGroups.js'

/**
 * Writes one instance of one device under prefix. The device is its NAME's
 * manufacturer code and unique number, which stay the same when an installer
 * changes its device or system instance.
 */
export interface InstancePrefixRule {
  /** The NAME's manufacturer code, 0..2047. */
  manufacturerCode: number
  /** The NAME's unique number, 0..2^21 - 1. */
  uniqueNumber: number
  group: InstanceGroupId
  /**
   * Tank type or sensor source code; required for groups with a
   * discriminator, absent for the others.
   */
  discriminator?: number
  instance: number
  prefix: string
}

export interface InstancePrefixRuleProblem {
  /** Index of the rule in the list; -1 when the list is not an array. */
  index: number
  message: string
}

interface GroupInfo {
  group: Readonly<InstanceGroup>
  /** Distinct per group; part of a rule's key. */
  index: number
  /** The group's discriminatorCodes, for an O(1) check. */
  discriminatorCodes: ReadonlySet<number> | undefined
}

const GROUPS = new Map<string, GroupInfo>(
  instanceGroups.map((group, index) => [
    group.id,
    {
      group,
      index,
      discriminatorCodes:
        group.discriminatorCodes && new Set(group.discriminatorCodes)
    }
  ])
)

// Discriminator codes run 0..255; NO_DISCRIMINATOR keys groups without one.
const NO_DISCRIMINATOR = 256
const DISCRIMINATORS = 257
const INSTANCES = 256

function ruleKey (
  info: GroupInfo,
  discriminator: number | undefined,
  instance: number
) {
  const d = discriminator === undefined ? NO_DISCRIMINATOR : discriminator
  return (info.index * DISCRIMINATORS + d) * INSTANCES + instance
}

// The low 32 bits of the device's NAME.
function deviceKey (manufacturerCode: number, uniqueNumber: number) {
  return manufacturerCode * UNIQUE_NUMBERS + uniqueNumber
}

interface RuleEntry {
  device: number
  key: number
  prefix: string
}

// Rules by deviceKey, then by ruleKey, with the index of each in its list.
type RuleTable = Map<number, Map<number, { index: number; prefix: string }>>

const isInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value)

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value !== ''

const isIntegerIn = (value: unknown, max: number): value is number =>
  isInteger(value) && value >= 0 && value <= max

// The problems of one rule; its table entry when it has none.
function checkRule (rule: unknown, problems: string[]): RuleEntry | undefined {
  if (typeof rule !== 'object' || rule === null || Array.isArray(rule)) {
    problems.push('rule is not an object')
    return undefined
  }
  const {
    manufacturerCode,
    uniqueNumber,
    group,
    discriminator,
    instance,
    prefix
  } = rule as Record<string, unknown>
  if (!isIntegerIn(manufacturerCode, MANUFACTURER_CODE_MASK)) {
    problems.push(
      `manufacturerCode must be an integer in 0..${MANUFACTURER_CODE_MASK}`
    )
  }
  if (!isIntegerIn(uniqueNumber, UNIQUE_NUMBER_MASK)) {
    problems.push(`uniqueNumber must be an integer in 0..${UNIQUE_NUMBER_MASK}`)
  }
  if (!isNonEmptyString(prefix)) {
    problems.push('prefix must be a non-empty string')
  }
  if (discriminator !== undefined && !isInteger(discriminator)) {
    problems.push('discriminator must be an integer')
  }
  if (typeof group !== 'string') {
    problems.push('group must be a string')
    return undefined
  }
  const info = GROUPS.get(group)
  if (!info) {
    problems.push(`unknown group "${group}"`)
    return undefined
  }
  const { maxInstance } = info.group
  const { discriminatorCodes } = info
  if (!isInteger(instance) || instance < 0 || instance > maxInstance) {
    problems.push(`instance must be an integer in 0..${maxInstance}`)
  }
  if (discriminatorCodes === undefined) {
    if (discriminator !== undefined) {
      problems.push(`group ${group} takes no discriminator`)
    }
  } else if (discriminator === undefined) {
    problems.push(`group ${group} needs a discriminator`)
  } else if (
    isInteger(discriminator) &&
    !discriminatorCodes.has(discriminator)
  ) {
    problems.push(
      `discriminator ${discriminator} has no path in group ${group}`
    )
  }
  if (
    problems.length > 0 ||
    !isIntegerIn(manufacturerCode, MANUFACTURER_CODE_MASK) ||
    !isIntegerIn(uniqueNumber, UNIQUE_NUMBER_MASK) ||
    !isNonEmptyString(prefix) ||
    !isInteger(instance) ||
    !(discriminator === undefined || isInteger(discriminator))
  ) {
    return undefined
  }
  return {
    device: deviceKey(manufacturerCode, uniqueNumber),
    key: ruleKey(info, discriminator, instance),
    prefix
  }
}

function compileRules (rules: unknown) {
  const problems: InstancePrefixRuleProblem[] = []
  const table: RuleTable = new Map()
  if (!Array.isArray(rules)) {
    problems.push({
      index: -1,
      message: 'instance prefix rules must be an array'
    })
    return { table, problems }
  }
  rules.forEach((rule, index) => {
    const messages: string[] = []
    const entry = checkRule(rule, messages)
    if (entry === undefined) {
      messages.forEach(message => problems.push({ index, message }))
      return
    }
    let device = table.get(entry.device)
    if (device === undefined) {
      device = new Map()
      table.set(entry.device, device)
    }
    const earlier = device.get(entry.key)
    if (earlier !== undefined) {
      problems.push({
        index,
        message: `same manufacturerCode, uniqueNumber, group, discriminator and instance as rule ${earlier.index}`
      })
      return
    }
    device.set(entry.key, { index, prefix: entry.prefix })
  })
  return { table, problems }
}

/**
 * The problems that keep rules from applying, each naming its rule's index:
 * a malformed rule, a manufacturerCode outside 0..2047 or a uniqueNumber
 * outside 0..2^21 - 1, an unknown group, a discriminator the group does not
 * take or write, an instance out of range, an empty prefix, a key an
 * earlier rule already holds. A list that is not an array is one problem, at
 * index -1, and no rule is checked.
 */
export function validateInstancePrefixRules (
  rules: unknown
): InstancePrefixRuleProblem[] {
  return compileRules(rules).problems
}

function rulePrefix (table: RuleTable, context: InstancePrefixContext) {
  const { manufacturerCode, uniqueNumber } = context
  if (manufacturerCode === undefined || uniqueNumber === undefined) {
    return undefined
  }
  const device = table.get(deviceKey(manufacturerCode, uniqueNumber))
  const info = GROUPS.get(context.group)
  if (device === undefined || info === undefined) {
    return undefined
  }
  const rule = device.get(
    ruleKey(info, context.discriminator, context.instance)
  )
  return rule !== undefined ? rule.prefix : undefined
}

/**
 * Holds a mapper's instance prefix overrides. resolver is what toDelta
 * consults: a matching rule's prefix, else the resolver function's. It is
 * undefined when nothing overrides the default prefix.
 */
export class InstancePrefixOverrides {
  resolver: InstancePrefixResolver | undefined
  /**
   * The pgn:src keys the resolver function's throws have been logged for, so
   * each is logged once per mapper and afresh for a new resolver function.
   */
  readonly reportedThrows = new Set<string>()
  private rules: RuleTable | undefined
  private userResolver: InstancePrefixResolver | undefined

  /**
   * Applies the valid rules, replacing any earlier ones, and logs and returns
   * the problems of the others. undefined, null or [] removes every rule, as
   * does a list that is not an array, which is reported.
   */
  setRules (
    rules: readonly InstancePrefixRule[] | null | undefined
  ): InstancePrefixRuleProblem[] {
    const { table, problems } = compileRules(rules != null ? rules : [])
    for (const { index, message } of problems) {
      console.error(
        index < 0
          ? `n2k-signalk: ${message}`
          : `n2k-signalk: instance prefix rule ${index}: ${message}`
      )
    }
    this.rules = table.size > 0 ? table : undefined
    this.combine()
    return problems
  }

  setResolver (resolver: InstancePrefixResolver | null | undefined) {
    if (resolver != null && typeof resolver !== 'function') {
      throw new TypeError('instancePrefixResolver must be a function')
    }
    const next = resolver != null ? resolver : undefined
    if (next !== this.userResolver) {
      this.reportedThrows.clear()
    }
    this.userResolver = next
    this.combine()
  }

  private combine () {
    const { rules, userResolver } = this
    if (rules === undefined) {
      this.resolver = userResolver
      return
    }
    this.resolver = context => {
      const prefix = rulePrefix(rules, context)
      if (prefix !== undefined) {
        return prefix
      }
      return userResolver !== undefined ? userResolver(context) : undefined
    }
  }
}
