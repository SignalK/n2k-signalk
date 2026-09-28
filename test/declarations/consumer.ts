// Compiled by test/declarations.js against the built declarations: a strict
// consumer that checks library declarations must see typed exports.
import {
  classifyInstance,
  defaultPrefix,
  instanceGroups
} from '../../dist/n2kMapper'

// never for an export typed any, which no value but never is assignable to.
type Typed<T> = 0 extends 1 & T ? never : T

const prefixOf: Typed<typeof defaultPrefix> = defaultPrefix
const prefix: string | undefined = prefixOf('battery', undefined, 3, 1)
const classify: Typed<typeof classifyInstance> = classifyInstance
const groups: Typed<typeof instanceGroups> = instanceGroups

export { prefix, classify, groups }
