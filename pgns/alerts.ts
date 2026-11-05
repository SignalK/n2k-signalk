// What 126985 (Alert Text) and 126983 (Alert) share through the source's state

/** An alert's text, as 126985 stores it in the per-source state for 126983. */
export interface AlertText {
  languageId: unknown
  textDescription: unknown
  locationTextDescription: unknown
}

/** The per-source state 126985 and 126983 share. */
export interface AlertState {
  /** Alert texts, keyed by alertKey. */
  alerts?: Record<string, AlertText>
}

/**
 * The key an alert's text is stored under. One source can run several alert
 * systems and sub-systems, and each numbers its alerts on its own, so the ID
 * alone does not identify an alert.
 */
export function alertKey(fields: {
  alertSystem?: unknown
  alertSubSystem?: unknown
  alertId?: unknown
}): string {
  return [fields.alertSystem, fields.alertSubSystem, fields.alertId]
    .map((v) => (v === undefined || v === null ? '' : String(v)))
    .join('.')
}
