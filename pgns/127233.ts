/*
 * PGN 127233 "Man Overboard Notification", sent by a MOB system and by the
 * MOB button of a chartplotter.
 *
 * Raised as notifications.mob.<emitter id> on the vessel itself, in the shape
 * the server's Notifications API gives a MOB: state emergency, the position
 * at the top of the value. There is no createdAt: the frame gives the
 * activation as a time of day with no date of its own, so it is passed on in
 * data as the frame has it. The MMSI of the vessel of origin is kept in data,
 * not used as the context: the frame is on this boat's bus, and a MOB of
 * another vessel reaches it over AIS.
 */

import { PGN_127233 } from '@canboat/ts-pgns'
import { isNumber, isPosition } from '../utils.js'

// A status this mapping does not know (a reserved value, or none) is taken as
// a MOB: the frame exists to report one, and a missed MOB costs more than a
// false one. A decoder that does not resolve lookups gives the number.
function notificationState(status: unknown) {
  switch (status) {
    case 'MOB Not Active':
    case 3:
      return 'normal'
    case 'Test mode':
    case 2:
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

// The ID as a number, so that one emitter has one path however it is given.
// Every MOB without an ID shares one path, so that a cancel from any display
// clears it.
function emitterSegment(id: unknown) {
  return isNumber(id) ? String(Number(id)) : 'unset'
}

// Fields the frame leaves not available are left out.
function available(fields: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(fields).filter(
      ([, v]) =>
        v !== undefined &&
        v !== null &&
        (typeof v !== 'number' || Number.isFinite(v))
    )
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
        data: available({
          mobEmitterId: n2k.fields.mobEmitterId,
          activationTime: n2k.fields.activationTime,
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
