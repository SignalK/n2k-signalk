const { skJ1939EngineId } = require('../utils.js')

// J1939 Active Trouble Codes (DM1) — the four fault lamps plus the
// repeating SPN/FMI list. Mapped to a notification per engine: the
// lamps carry the severity, the DTC list rides in the message. Lamp
// fields are 2-bit BINARY — '00' is off, anything else (steady or
// flashing) is on.

const LAMPS = [
  { field: 'redStopLampStatus', label: 'red stop lamp', state: 'alarm' },
  {
    field: 'malfunctionLampStatus',
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

const lampOn = (n2k, field) =>
  typeof n2k.fields[field] !== 'undefined' && n2k.fields[field] !== '00'

module.exports = [
  {
    node: function (n2k) {
      return (
        'notifications.propulsion.' + skJ1939EngineId(n2k) + '.troubleCodes'
      )
    },
    value: function (n2k) {
      const active = LAMPS.filter(l => lampOn(n2k, l.field))
      // Most severe active lamp wins; LAMPS is ordered by severity.
      const state = active.length > 0 ? active[0].state : 'normal'
      // A no-fault DM1 carries one all-zero DTC, and short frames pad
      // with FF — neither is a real trouble code.
      const dtcs = (Array.isArray(n2k.fields.list)
        ? n2k.fields.list
        : []
      ).filter(
        d =>
          typeof d.spn === 'string' &&
          d.fmi !== undefined &&
          !/^[0 ]+$/.test(d.spn) &&
          !/^[fF ]+$/.test(d.spn)
      )
      let message = 'No active trouble codes'
      if (active.length > 0 || dtcs.length > 0) {
        const parts = active.map(l => l.label)
        if (dtcs.length > 0) {
          parts.push(
            dtcs.length +
              ' trouble code' +
              (dtcs.length > 1 ? 's' : '') +
              ': ' +
              dtcs.map(d => 'SPN ' + d.spn + ' FMI ' + d.fmi).join(', ')
          )
        }
        message = parts.join('; ')
      }
      return {
        state,
        method: state === 'normal' ? [] : ['visual', 'sound'],
        message
      }
    }
  }
]
