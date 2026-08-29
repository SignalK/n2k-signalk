import { PGN_65312_NavicoWirelessSignalStatus } from '@canboat/ts-pgns'
import { percentToRatio } from '../utils.js'

module.exports = [
  {
    pgnClass: PGN_65312_NavicoWirelessSignalStatus,
    node: 'sensors.wind.signalStrength',
    value: (n2k: PGN_65312_NavicoWirelessSignalStatus) =>
      percentToRatio(n2k.fields.signalStrength)
  }
]
