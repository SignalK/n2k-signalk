import { PGN_130850_SimnetAlarm } from '@canboat/ts-pgns'
import camelCase from 'camelcase'
import { HoldsVesselState, vesselState } from '../vesselState.js'

// Simnet alarms carry no level, so every active alarm is an alarm.
const commands: Record<string, { state: string; method: string[] }> = {
  Activate: { state: 'alarm', method: ['visual', 'sound'] },
  Acknowledge: { state: 'alarm', method: ['visual'] },
  Silence: { state: 'alarm', method: ['visual'] },
  Deactivate: { state: 'normal', method: [] }
}

// Simnet sends an alarm only when it changes, and one display may raise an
// alarm that another clears or acknowledges, possibly after it was cleared.
// So each alarm's last Activate or Deactivate is kept for the whole vessel, by
// name. An alarm with neither may be active from before the mapper started.
type AlarmStatus = 'active' | 'cleared'
type AlarmStatuses = Record<string, AlarmStatus>

function alarmStatuses(state: HoldsVesselState | undefined) {
  const vessel = vesselState(state)
  if (!vessel) return undefined
  if (!vessel.simnetAlarms) {
    vessel.simnetAlarms = {}
  }
  return vessel.simnetAlarms as AlarmStatuses
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
    // Acknowledge and Silence write nothing for an alarm that was cleared, so
    // that they cannot raise it again. They are written for an alarm that is
    // active, or whose state is not known (no Activate or Deactivate seen,
    // or no state).
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
        return alarmStatuses(state)?.[alarmName(n2k)] !== 'cleared'
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

      const statuses = alarmStatuses(sourceState)
      if (statuses) {
        if (command === 'Activate') {
          statuses[alarmName(n2k)] = 'active'
        } else if (command === 'Deactivate') {
          statuses[alarmName(n2k)] = 'cleared'
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
