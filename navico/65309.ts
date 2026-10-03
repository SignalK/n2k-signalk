import { PGN_65309_NavicoWirelessBatteryStatus } from '@canboat/ts-pgns'

module.exports = [
  {
    pgnClass: PGN_65309_NavicoWirelessBatteryStatus,
    node: 'sensors.wind.batteryStatus',
    source: 'batteryStatus'
  },
  {
    pgnClass: PGN_65309_NavicoWirelessBatteryStatus,
    node: 'sensors.wind.batteryChargeStatus',
    source: 'batteryChargeStatus'
  },
  {
    pgnClass: PGN_65309_NavicoWirelessBatteryStatus,
    node: 'sensors.wind.status',
    value: (n2k: PGN_65309_NavicoWirelessBatteryStatus) => n2k.fields.status
  }
]
