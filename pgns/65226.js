const { skJ1939EngineId } = require('../utils.js')

// J1939 Active Trouble Codes (DM1) — the four fault lamps plus the
// repeating DTC list. Mapped to a notification per engine: the lamps
// carry the severity, the DTC list rides in the message.
//
// Expects canboat's J1939-73 decode (canboat#949, #951): each lamp is the
// J1939_LAMP_STATUS lookup (Off / On / Error; not available is omitted),
// and each DTC is plain numbers, its SPN named from canboat's SPN lookup
// when canboat knows it. The decode before that reversed the lamp bits and
// misread the DTCs, so it is not mapped rather than mapped to the wrong
// severity.

const LAMPS = [
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
const lampOn = (n2k, field) => n2k.fields[field] === 'On'

// A no-fault DM1 carries one all-zero DTC, and a short frame's padding
// decodes without an FMI — neither is a real trouble code.
const activeDtcs = n2k =>
  (Array.isArray(n2k.fields.list) ? n2k.fields.list : []).filter(
    d =>
      d &&
      typeof d.fmi === 'number' &&
      d.spn !== undefined &&
      d.spn !== null &&
      !(d.spn === 0 && d.fmi === 0)
  )

const dtcText = d =>
  (typeof d.spn === 'number' ? 'SPN ' + d.spn : d.spn) + ' FMI ' + d.fmi

module.exports = [
  {
    node: function (n2k) {
      return (
        'notifications.propulsion.' + skJ1939EngineId(n2k) + '.troubleCodes'
      )
    },
    value: function (n2k) {
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
    filter: function (n2k) {
      return (
        LAMPS.some(l => LAMP_STATUSES.includes(n2k.fields[l.field])) ||
        activeDtcs(n2k).length > 0
      )
    }
  }
]
