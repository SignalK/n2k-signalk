import {
  PGN_65288,
  ManufacturerCode,
  SeatalkAlarmStatus,
  SeatalkAlarmId
} from '@canboat/pgns'

module.exports = [
  {
    filter: function (n2k: PGN_65288) {
      return (
        n2k.fields.manufacturerCode === 'Raymarine' &&
        typeof n2k.fields.alarmGroup !== 'undefined' &&
        typeof n2k.fields.alarmStatus !== 'undefined'
      )
    },
    node: function (n2k: PGN_65288) {
      var alarmName: string

      if (typeof n2k.fields.alarmId === 'string') {
        alarmName = (n2k.fields.alarmId as string).replace(/ /g, '')
      } else {
        alarmName = `unknown${n2k.fields.alarmId}`
      }

      var alarmGroup:string = n2k.fields.alarmGroup !== undefined ?  n2k.fields.alarmGroup : "unknownGroup"

      var path =
        alarmGroup.toLowerCase().replace(/ /g, '') + '.' + alarmName
      return 'notifications.' + path
    },
    value: function (n2k: PGN_65288) {
      var state = n2k.fields.alarmStatus

      var method = ['visual']

      if (state === SeatalkAlarmStatus.AlarmConditionMetAndNotSilenced ) {
        method.push('sound')
      }

      let notifState : string
      if (state == SeatalkAlarmStatus.AlarmConditionNotMet) {
        notifState = 'normal'
      } else {
        notifState = 'alarm'
      }

      var alarmName : string
      const alarmId = n2k.fields.alarmId

      if (alarmId === undefined || typeof alarmId !== 'string') {
        alarmName = `Unknown Seatalk Alarm ${alarmId}`
      } else {
        alarmName = alarmId as string
        if (
          notifState == 'alarm' &&
            (alarmId === SeatalkAlarmId.WpArrival ||
             alarmId === SeatalkAlarmId.PilotWayPointAdvance ||
             alarmId === SeatalkAlarmId.PilotRouteComplete)
        ) {
          notifState = 'alert'
        }
      }

      return {
        message: alarmName,
        method: method,
        state: notifState,
        timestamp: n2k.timestamp
      }
    }
  }
]
