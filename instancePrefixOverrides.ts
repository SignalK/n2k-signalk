/*
 * What a mapper writes instance paths under instead of the default prefix.
 */
import { InstancePrefixResolver } from './instanceGroups.js'

/**
 * Holds a mapper's instance prefix overrides. resolver is what toDelta
 * consults; it is undefined when nothing overrides the default prefix.
 */
export class InstancePrefixOverrides {
  resolver: InstancePrefixResolver | undefined
  /**
   * The pgn:src keys the resolver's throws have been logged for, so each is
   * logged once per mapper and afresh for a new resolver.
   */
  readonly reportedThrows = new Set<string>()

  setResolver (resolver: InstancePrefixResolver | null | undefined) {
    if (resolver != null && typeof resolver !== 'function') {
      throw new TypeError('instancePrefixResolver must be a function')
    }
    const next = resolver != null ? resolver : undefined
    if (next !== this.resolver) {
      this.reportedThrows.clear()
    }
    this.resolver = next
  }
}
