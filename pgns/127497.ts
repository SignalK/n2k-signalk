import { PGN_127497 } from '@canboat/ts-pgns'
import { skEngineId } from '../utils.js'

// canboatjs gives the fuel used in m3 and the rates in m3/s, as Signal K
// wants them.
const trip = (path: string) => (n2k: PGN_127497) =>
  `propulsion.${skEngineId(n2k)}.trip.${path}`

module.exports = [
  { source: 'tripFuelUsed', node: trip('fuelUsed') },
  { source: 'fuelRateAverage', node: trip('fuelRate.average') },
  { source: 'fuelRateEconomy', node: trip('fuelRate.economy') },
  {
    source: 'instantaneousFuelEconomy',
    node: trip('fuelRate.instantaneousEconomy')
  }
]
