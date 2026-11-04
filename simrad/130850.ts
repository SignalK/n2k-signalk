import { PGN_130850_SimnetAlarm } from '@canboat/ts-pgns'
import camelCase from 'camelcase'

// The Signal K state and method for each command that is about an alarm.
// Simnet alarms carry no level, so every active alarm is an alarm.
const commands: Record<string, { state: string; method: string[] }> = {
  Activate: { state: 'alarm', method: ['visual', 'sound'] },
  Acknowledge: { state: 'alarm', method: ['visual'] },
  Silence: { state: 'alarm', method: ['visual'] },
  Deactivate: { state: 'normal', method: [] }
}

module.exports = [
  {
    pgnClass: PGN_130850_SimnetAlarm,

    // Tack/Gybe Confirm, MOB Activated/Cancelled, Alarm History and unnamed
    // commands carry no alarm ID and are not about an alarm.
    filter: function (n2k: PGN_130850_SimnetAlarm) {
      return (
        typeof n2k.fields.command === 'string' &&
        commands[n2k.fields.command] !== undefined &&
        n2k.fields.alarmId !== undefined &&
        n2k.fields.alarmId !== null
      )
    },

    node: function (n2k: PGN_130850_SimnetAlarm) {
      return (
        'notifications.' +
        camelCase(
          typeof n2k.fields.alarmId === 'string'
            ? n2k.fields.alarmId
            : `unknown${n2k.fields.alarmId}`
        )
      )
    },

    value: function (n2k: PGN_130850_SimnetAlarm) {
      const { state, method } = commands[n2k.fields.command as string]

      const message =
        typeof n2k.fields.alarmId === 'string'
          ? n2k.fields.alarmId
          : `Unknown Simnet Alarm ${n2k.fields.alarmId}`

      return {
        message: message,
        method: [...method],
        state: state,
        timestamp: n2k.timestamp
      }
    }
  }
]
