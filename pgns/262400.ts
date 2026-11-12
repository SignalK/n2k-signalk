import { PGN_262400, PGN_262400Fields } from '@canboat/ts-pgns'
import { vesselState } from '../vesselState.js'

// 262400, "NMEA 2000 gateway: network status": the status of the gateway a
// connection reads the bus through, which the gateway sends itself (an
// iKonvert, or canboat for an NGT-1 or a CAN interface).

// The fields every such gateway sends, under the connection's provider id
const FIELDS: (keyof PGN_262400Fields)[] = [
  'errors',
  'deviceCount',
  'uptime',
  'gatewayAddress',
  'rejectedTxRequests'
]

module.exports = [
  (n2k: PGN_262400, state?: Parameters<typeof vesselState>[0]) => {
    const providerId = vesselState(state)?.providerId
    // Without a provider id the status belongs to no known connection.
    if (typeof providerId !== 'string' || providerId === '') {
      return []
    }
    const prefix = `providers.${providerId}`
    const { fields } = n2k
    const values = FIELDS.filter((field) => fields[field] != null).map(
      (field) => ({ path: `${prefix}.${field}`, value: fields[field] })
    )
    // A percentage; one that isn't a number from 0 to 100 is left out.
    const load = Number(fields.canNetworkLoad)
    if (fields.canNetworkLoad != null && load >= 0 && load <= 100) {
      values.unshift({ path: `${prefix}.canNetworkLoad`, value: load / 100 })
    }
    return values
  }
]
