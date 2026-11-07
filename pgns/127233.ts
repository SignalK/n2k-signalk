/*
 * PGN 127233 "Man Overboard Notification", sent by a MOB system and by the
 * MOB button of a chartplotter.
 *
 * Raised as notifications.mob.<emitter id> on the vessel itself, in the shape
 * the server's Notifications API gives a MOB: state emergency, the position
 * at the top of the value, createdAt the time of activation. The MMSI of the
 * vessel of origin is kept in data, not used as the context: the frame is on
 * this boat's bus, and a MOB of another vessel reaches it over AIS.
 */

import { PGN_127233 } from '@canboat/ts-pgns'
import { isNumber, isPosition, isoDateTime, seconds } from '../utils.js'

// A status this mapping does not know (a reserved value, or none) is taken as
// a MOB: the frame exists to report one, and a missed MOB costs more than a
// false one.
function notificationState(status: unknown) {
  switch (status) {
    case 'MOB Not Active':
      return 'normal'
    case 'Test mode':
      return 'alert'
    default:
      return 'emergency'
  }
}

const METHODS: Record<string, string[]> = {
  emergency: ['visual', 'sound'],
  alert: ['visual'],
  normal: []
}

const MESSAGES: Record<string, string> = {
  emergency: 'Person Overboard!',
  alert: 'Person Overboard test',
  normal: 'Person Overboard no longer active'
}

function emitterSegment(id: unknown) {
  return isNumber(id) ? String(id) : 'unset'
}

// The frame gives the activation as a time of day only, and no date of its
// own. It is dated with the position report only when it is not later in
// that day: a later time could be the day before, or a position report older
// than the activation, so it is left out.
function activatedAt(n2k: PGN_127233) {
  const activationSeconds = seconds(n2k.fields.activationTime)
  const positionSeconds = seconds(n2k.fields.positionTime)
  if (
    activationSeconds === null ||
    positionSeconds === null ||
    activationSeconds > positionSeconds
  ) {
    return undefined
  }
  return (
    isoDateTime(n2k.fields.positionDate, n2k.fields.activationTime) ?? undefined
  )
}

// Fields the frame leaves not available are left out.
function available(fields: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(fields).filter(([, v]) => v !== undefined && v !== null)
  )
}

module.exports = [
  {
    node: (n2k: PGN_127233) =>
      'notifications.mob.' + emitterSegment(n2k.fields.mobEmitterId),
    value: (n2k: PGN_127233) => {
      const state = notificationState(n2k.fields.manOverboardStatus)
      const { latitude, longitude } = n2k.fields
      return available({
        state,
        method: METHODS[state],
        message: MESSAGES[state],
        position: isPosition(latitude, longitude)
          ? { latitude: Number(latitude), longitude: Number(longitude) }
          : undefined,
        createdAt: activatedAt(n2k),
        data: available({
          mobEmitterId: n2k.fields.mobEmitterId,
          manOverboardStatus: n2k.fields.manOverboardStatus,
          positionSource: n2k.fields.positionSource,
          cogReference: n2k.fields.cogReference,
          cog: n2k.fields.cog,
          sog: n2k.fields.sog,
          mmsiOfVesselOfOrigin: n2k.fields.mmsiOfVesselOfOrigin,
          batteryLow: n2k.fields.mobEmitterBatteryLowStatus
        })
      })
    }
  }
]
