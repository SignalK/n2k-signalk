import { PGN_65309_NavicoWirelessBatteryStatus } from '@canboat/ts-pgns'
import { percentToRatio } from '../utils.js'

module.exports = [
  {
    pgnClass: PGN_65309_NavicoWirelessBatteryStatus,
    node: 'sensors.wind.batteryStatus',
    value: (n2k: PGN_65309_NavicoWirelessBatteryStatus) =>
      percentToRatio(n2k.fields.batteryStatus)
  },
  {
    pgnClass: PGN_65309_NavicoWirelessBatteryStatus,
    node: 'sensors.wind.batteryChargeStatus',
    value: (n2k: PGN_65309_NavicoWirelessBatteryStatus) =>
      percentToRatio(n2k.fields.batteryChargeStatus)
  },
  {
    pgnClass: PGN_65309_NavicoWirelessBatteryStatus,
    node: 'sensors.wind.status',
    value: (n2k: PGN_65309_NavicoWirelessBatteryStatus) => n2k.fields.status
  }
]
