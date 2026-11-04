import { PGN_130850_SimnetAlarm } from '@canboat/ts-pgns'
import camelCase from 'camelcase'
import { HoldsVesselState, vesselState } from '../vesselState.js'

// The Signal K state and method for each command that is about an alarm.
// Simnet alarms carry no level, so every active alarm is an alarm.
const commands: Record<string, { state: string; method: string[] }> = {
  Activate: { state: 'alarm', method: ['visual', 'sound'] },
  Acknowledge: { state: 'alarm', method: ['visual'] },
  Silence: { state: 'alarm', method: ['visual'] },
  Deactivate: { state: 'normal', method: [] }
}

// Simnet sends an alarm only when it changes, and one display may raise an
// alarm that another clears or acknowledges, possibly after it was cleared.
// So the alarms that are active are kept for the whole vessel, by name.
type ActiveAlarms = Record<string, true>

function activeAlarms(state: HoldsVesselState | undefined) {
  const vessel = vesselState(state)
  if (!vessel) return undefined
  if (!vessel.simnetAlarms) {
    vessel.simnetAlarms = {}
  }
  return vessel.simnetAlarms as ActiveAlarms
}

function alarmName(n2k: PGN_130850_SimnetAlarm): string {
  return camelCase(
    typeof n2k.fields.alarmId === 'string'
      ? n2k.fields.alarmId
      : `unknown${n2k.fields.alarmId}`
  )
}

module.exports = [
  {
    pgnClass: PGN_130850_SimnetAlarm,

    // Tack/Gybe Confirm, MOB Activated/Cancelled, Alarm History and unnamed
    // commands carry no alarm ID and are not about an alarm.
    // Acknowledge and Silence write nothing for an alarm that is not active,
    // so that they cannot raise one that was cleared. Without state, which
    // alarms are active is not known, so they are written.
    filter: function (n2k: PGN_130850_SimnetAlarm, state?: HoldsVesselState) {
      const command = n2k.fields.command
      if (
        typeof command !== 'string' ||
        commands[command] === undefined ||
        n2k.fields.alarmId === undefined ||
        n2k.fields.alarmId === null
      ) {
        return false
      }
      if (command === 'Acknowledge' || command === 'Silence') {
        const active = activeAlarms(state)
        return !active || active[alarmName(n2k)] === true
      }
      return true
    },

    node: function (n2k: PGN_130850_SimnetAlarm) {
      return 'notifications.' + alarmName(n2k)
    },

    value: function (
      n2k: PGN_130850_SimnetAlarm,
      sourceState?: HoldsVesselState
    ) {
      const command = n2k.fields.command as string
      const { state, method } = commands[command]

      const active = activeAlarms(sourceState)
      if (active) {
        if (command === 'Activate') {
          active[alarmName(n2k)] = true
        } else if (command === 'Deactivate') {
          delete active[alarmName(n2k)]
        }
      }

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
