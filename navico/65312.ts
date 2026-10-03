import { PGN_65312_NavicoWirelessSignalStatus } from '@canboat/ts-pgns'

module.exports = [
  {
    pgnClass: PGN_65312_NavicoWirelessSignalStatus,
    node: 'sensors.wind.signalStrength',
    source: 'signalStrength'
  }
]
