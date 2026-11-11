import { vesselState } from '../vesselState.js'

// ts-pgns has no type for 262400, "NMEA 2000 gateway: network status": the
// status of the gateway a connection reads the bus through, which the gateway
// sends itself (an iKonvert, or canboat for an NGT-1 or a CAN interface).
type Frame = { fields: Record<string, unknown> }

// The fields every such gateway sends, under the connection's provider id
const FIELDS = [
  'errors',
  'deviceCount',
  'uptime',
  'gatewayAddress',
  'rejectedTxRequests'
]

module.exports = [
  (n2k: Frame, state?: Parameters<typeof vesselState>[0]) => {
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
    if (fields.canNetworkLoad != null) {
      // A percentage
      values.unshift({
        path: `${prefix}.canNetworkLoad`,
        value: Number(fields.canNetworkLoad) / 100
      })
    }
    return values
  }
]
