import {
  PGN_130850_SimnetAlarm,
  SimnetAlarm
} from '@canboat/ts-pgns'
import camelCase from 'camelcase'

module.exports = [
  {
    pgnClass: PGN_130850_SimnetAlarm,

    node: function (n2k: PGN_130850_SimnetAlarm) {
      return 'notifications.' + camelCase(typeof n2k.fields.alarm === 'string' ? n2k.fields.alarm : `unknown${n2k.fields.alarm}`)
    },

    value: function (n2k: PGN_130850_SimnetAlarm) {
     let state = 'warning'
     let method = ['visual', 
      //'sound'
    ]
     let message:string

      if (typeof n2k.fields.alarm !== 'string') {
        message = `Unknown Simnet Alarm ${n2k.fields.alarm}`
      } else {
        message = n2k.fields.alarm as string
      }

      return {
        message: message,
        method: method,
        state: state,
        timestamp: n2k.timestamp
      }
    }
  }
]
