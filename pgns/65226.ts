import { skJ1939EngineId } from '../utils.js'

// ts-pgns has no J1939 PGNs; the fields this mapping reads. The lamps are
// read by name, so fields is indexable.
type Dtc = { spn?: number | string; fmi?: number; cm?: number }
type J1939DM1 = {
  src: number
  fields: Record<string, unknown> & { list?: unknown }
}
type Lamp = { field: string; label: string; state: string }

// J1939 Active Trouble Codes (DM1) — the four fault lamps plus the
// repeating DTC list. Mapped to a notification per engine: the lamps
// carry the severity, the DTC list rides in the message.
//
// Needs canboat's J1939-73 decode (canboat#949, #951): each lamp is the
// J1939_LAMP_STATUS lookup (Off / On / Error; not available is omitted),
// and each DTC is plain numbers, its SPN named from canboat's SPN lookup
// when canboat knows it. Lamps in any other shape can't be trusted for a
// severity, so they produce no notification.

const LAMPS: Lamp[] = [
  { field: 'redStopLampStatus', label: 'red stop lamp', state: 'alarm' },
  {
    field: 'malfunctionIndicatorLampStatus',
    label: 'malfunction lamp',
    state: 'warn'
  },
  {
    field: 'amberWarningLampStatus',
    label: 'amber warning lamp',
    state: 'warn'
  },
  { field: 'protectLampStatus', label: 'protect lamp', state: 'alert' }
]

const LAMP_STATUSES = ['Off', 'On', 'Error']

// Only an explicit On lights a lamp; Error is a lamp fault, not a fault.
const lampOn = (n2k: J1939DM1, field: string) => n2k.fields[field] === 'On'

// A no-fault DM1 carries one all-zero DTC, and a short frame's padding
// decodes without an FMI — neither is a real trouble code.
const activeDtcs = (n2k: J1939DM1): Dtc[] =>
  (Array.isArray(n2k.fields.list) ? (n2k.fields.list as Dtc[]) : []).filter(
    d =>
      d &&
      Number.isFinite(d.fmi) &&
      // a number, or the name canboat's SPN lookup gives it
      (Number.isFinite(d.spn) || (typeof d.spn === 'string' && d.spn !== '')) &&
      !(d.spn === 0 && d.fmi === 0)
  )

// CM 1 marks an SPN in an older J1939-73 layout, which canboat decodes as
// the current one, so its SPN is wrong; the fault itself still stands.
const dtcText = (d: Dtc) =>
  d.cm === 1
    ? 'FMI ' + d.fmi + ' (SPN in an older layout)'
    : (typeof d.spn === 'number' ? 'SPN ' + d.spn : d.spn) + ' FMI ' + d.fmi

module.exports = [
  {
    node: function (n2k: J1939DM1) {
      return (
        'notifications.propulsion.' + skJ1939EngineId(n2k) + '.troubleCodes'
      )
    },
    value: function (n2k: J1939DM1) {
      const active = LAMPS.filter(l => lampOn(n2k, l.field))
      const dtcs = activeDtcs(n2k)
      // Most severe active lamp wins; LAMPS is ordered by severity. A DTC
      // the ECU reports without lighting a lamp is still a fault.
      let state = 'normal'
      if (active.length > 0) {
        state = active[0].state
      } else if (dtcs.length > 0) {
        state = 'alert'
      }
      let message = 'No active trouble codes'
      if (active.length > 0 || dtcs.length > 0) {
        const parts = active.map(l => l.label)
        if (dtcs.length > 0) {
          parts.push(
            dtcs.length +
              ' trouble code' +
              (dtcs.length > 1 ? 's' : '') +
              ': ' +
              dtcs.map(dtcText).join(', ')
          )
        }
        message = parts.join('; ')
      }
      return {
        state,
        method: state === 'normal' ? [] : ['visual', 'sound'],
        message
      }
    },
    filter: function (n2k: J1939DM1) {
      return (
        LAMPS.some(l =>
          LAMP_STATUSES.includes(n2k.fields[l.field] as string)
        ) || activeDtcs(n2k).length > 0
      )
    }
  }
]
