/**
 * State that a mapping keeps for the whole vessel rather than for one source:
 * for something one device starts and another ends, such as a Simnet alarm
 * that one display raises and another clears.
 *
 * toDelta keeps it in its MapperState under a symbol, so that it is not taken
 * for a source, and links it into each source's state, so that a mapping
 * reaches it through the state it is given.
 */
export const VESSEL = Symbol('vessel')

export type VesselState = Record<string, unknown>

/** Something that holds, or links to, the vessel-wide state. */
export interface HoldsVesselState {
  [VESSEL]?: VesselState
}

/**
 * Links a source's state to the vessel-wide state of the mapper state it
 * belongs to, creating that on first use.
 */
export function linkVesselState(
  mapperState: HoldsVesselState,
  sourceState: HoldsVesselState
): void {
  if (!mapperState[VESSEL]) {
    hide(mapperState, {})
  }
  if (sourceState[VESSEL] !== mapperState[VESSEL]) {
    hide(sourceState, mapperState[VESSEL]!)
  }
}

// Not enumerable, so that comparing or serialising a state leaves it out
function hide(holder: HoldsVesselState, vessel: VesselState) {
  Object.defineProperty(holder, VESSEL, {
    value: vessel,
    enumerable: false,
    writable: true,
    configurable: true
  })
}

/**
 * The vessel-wide state a mapping's state links to, or undefined when toDelta
 * was called without state.
 */
export function vesselState(
  sourceState: HoldsVesselState | undefined
): VesselState | undefined {
  return sourceState && sourceState[VESSEL]
}
