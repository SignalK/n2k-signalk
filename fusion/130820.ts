import { timeToSeconds } from '../utils.js'
import {
  PGN,
  PGN_130820_FusionMedia,
  PGN_130820_FusionDeviceName,
  PGN_130820_FusionPowerState,
  PGN_130820_FusionArtistName,
  PGN_130820_FusionAlbumName,
  PGN_130820_FusionTrackName,
  PGN_130820_FusionTrackNameMatchFields,
  PGN_130820_FusionTrackPosition,
  PGN_130820_FusionSiriusxmArtist,
  PGN_130820_FusionSiriusxmTitle,
  PGN_130820_FusionSiriusxmChannel,
  PGN_130820_FusionSiriusxmContentInfo,
  PGN_130820_FusionVolumes,
  PGN_130820_FusionZoneName,
  PGN_130820_FusionSource,
  PGN_130820_FusionMute,
  PGN_130820_FusionEq,
  PGN_130820_FusionTuner,
  FusionPlayStatus,
  ManufacturerCode,
  FusionPowerState,
  FusionStatusMessageId
} from '@canboat/ts-pgns'
let currentFusionSource: number | null = null
const fusionSources: { [key: string]: string } = {}

const isMuted = (n2k: PGN_130820_FusionMute) =>
  n2k.fields.mute == 'Mute On' ? true : false

module.exports = [
  {
    pgnClass: PGN_130820_FusionDeviceName,

    node: 'entertainment.device.fusion1.name',

    value: (n2k: PGN_130820_FusionDeviceName) => n2k.fields.name
  },
  {
    pgnClass: PGN_130820_FusionPowerState,

    node: 'entertainment.device.fusion1.state',

    value: (n2k: PGN_130820_FusionPowerState) =>
      n2k.fields.state === FusionPowerState.On ? 'on' : 'off'
  },
  {
    pgnClass: PGN_130820_FusionArtistName,

    value: (n2k: PGN_130820_FusionArtistName) => n2k.fields.artist,

    node: (n2k: PGN_130820_FusionArtistName) =>
      'entertainment.device.fusion1.avsource.source' +
      currentFusionSource +
      '.track.artistName',

    filter: (n2k: PGN_130820_FusionArtistName) =>
      n2k.fields.artist != undefined && currentFusionSource != null
  },
  {
    pgnClass: PGN_130820_FusionAlbumName,

    value: (n2k: PGN_130820_FusionAlbumName) => n2k.fields.album,

    node: (n2k: PGN_130820_FusionAlbumName) =>
      'entertainment.device.fusion1.avsource.source' +
      currentFusionSource +
      '.track.albumName',

    filter: (n2k: PGN_130820_FusionAlbumName) =>
      n2k.fields.album != undefined && currentFusionSource != null
  },
  {
    pgnClass: PGN_130820_FusionTrackName,

    value: (n2k: PGN_130820_FusionTrackName) => n2k.fields.track,

    node: (n2k: any) =>
      'entertainment.device.fusion1.avsource.source' +
      currentFusionSource +
      '.track.name',

    filter: (n2k: PGN_130820_FusionTrackName) =>
      n2k.fields.track != undefined && currentFusionSource != null
  },
  {
    pgnClass: PGN_130820_FusionTrackPosition,

    node: (n2k: PGN_130820_FusionTrackPosition) =>
      'entertainment.device.fusion1.avsource.source' +
      currentFusionSource +
      '.track.elapsedTime',

    filter: (n2k: PGN_130820_FusionTrackPosition) =>
      currentFusionSource != null,

    value: (n2k: PGN_130820_FusionTrackPosition) =>
      timeToSeconds(n2k.fields.progress)
  },
  {
    pgnClass: PGN_130820_FusionMedia,

    node: (n2k: PGN_130820_FusionMedia) =>
      'entertainment.device.fusion1.avsource.source' +
      currentFusionSource +
      '.track.length',

    filter: (n2k: PGN_130820_FusionMedia) => currentFusionSource != null,

    value: (n2k: PGN_130820_FusionMedia) => timeToSeconds(n2k.fields.length)
  },
  {
    pgnClass: PGN_130820_FusionSiriusxmArtist,

    value: (n2k: PGN_130820_FusionSiriusxmArtist) => n2k.fields.artist,

    node: (n2k: any) =>
      'entertainment.device.fusion1.avsource.source' +
      currentFusionSource +
      '.track.artistName',

    filter: (n2k: PGN_130820_FusionSiriusxmArtist) =>
      currentFusionSource != null
  },
  {
    pgnClass: PGN_130820_FusionSiriusxmTitle,

    value: (n2k: PGN_130820_FusionSiriusxmTitle) => n2k.fields.title,

    node: (n2k: PGN_130820_FusionSiriusxmTitle) =>
      'entertainment.device.fusion1.avsource.source' +
      currentFusionSource +
      '.track.name',

    filter: (n2k: PGN_130820_FusionSiriusxmTitle) => currentFusionSource != null
  },
  {
    pgnClass: PGN_130820_FusionSiriusxmChannel,

    value: (n2k: PGN_130820_FusionSiriusxmChannel) => n2k.fields.channel,

    node: (n2k: PGN_130820_FusionSiriusxmChannel) =>
      'entertainment.device.fusion1.avsource.source' +
      currentFusionSource +
      '.tuner.stationName',

    filter: (n2k: PGN_130820_FusionSiriusxmChannel) =>
      currentFusionSource != null
  },
  {
    pgnClass: PGN_130820_FusionSiriusxmContentInfo,

    value: (n2k: PGN_130820_FusionSiriusxmContentInfo) => n2k.fields.genre,

    node: (n2k: PGN_130820_FusionSiriusxmContentInfo) =>
      'entertainment.device.fusion1.avsource.source' +
      currentFusionSource +
      '.track.genre',

    filter: (n2k: any) => currentFusionSource != null
  },
  {
    pgnClass: PGN_130820_FusionMedia,

    value: (n2k: PGN_130820_FusionMedia) => n2k.fields.track,

    node: (n2k: PGN_130820_FusionMedia) =>
      'entertainment.device.fusion1.avsource.source' +
      currentFusionSource +
      '.track.number',

    filter: (n2k: PGN_130820_FusionMedia) => currentFusionSource != null
  },
  {
    pgnClass: PGN_130820_FusionMedia,

    value: (n2k: PGN_130820_FusionMedia) => n2k.fields.trackCount,

    node: (n2k: PGN_130820_FusionMedia) =>
      'entertainment.device.fusion1.avsource.source' +
      currentFusionSource +
      '.track.totalTracks',

    filter: (n2k: PGN_130820_FusionMedia) => currentFusionSource != null
  },
  {
    pgnClass: PGN_130820_FusionVolumes,

    node: 'entertainment.device.fusion1.output.zone1.volume.master',

    value: (n2k: PGN_130820_FusionVolumes) => n2k.fields.zone1
  },
  {
    pgnClass: PGN_130820_FusionVolumes,

    node: 'entertainment.device.fusion1.output.zone2.volume.master',

    value: (n2k: PGN_130820_FusionVolumes) => n2k.fields.zone2
  },
  {
    pgnClass: PGN_130820_FusionVolumes,

    node: 'entertainment.device.fusion1.output.zone3.volume.master',

    value: (n2k: PGN_130820_FusionVolumes) => n2k.fields.zone3
  },
  {
    pgnClass: PGN_130820_FusionVolumes,

    node: 'entertainment.device.fusion1.output.zone4.volume.master',

    value: (n2k: PGN_130820_FusionVolumes) => n2k.fields.zone4
  },
  {
    pgnClass: PGN_130820_FusionZoneName,

    node: (n2k: PGN_130820_FusionZoneName) =>
      'entertainment.device.fusion1.output.zone' +
      (n2k.fields.number + 1) +
      '.name',

    value: (n2k: PGN_130820_FusionZoneName) => n2k.fields.name
  },
  {
    pgnClass: PGN_130820_FusionSource,

    node: 'entertainment.device.fusion1.output.zone1.source',

    value: (n2k: PGN_130820_FusionSource) => {
      if (n2k.fields.currentSourceId !== undefined) {
        currentFusionSource = n2k.fields.currentSourceId
        return (
          'entertainment.device.fusion1.avsource.source' +
          n2k.fields.currentSourceId
        )
      }
    }
  },
  {
    pgnClass: PGN_130820_FusionSource,

    node: 'entertainment.device.fusion1.output.zone2.source',

    value: (n2k: PGN_130820_FusionSource) =>
      'entertainment.device.fusion1.avsource.source' +
      n2k.fields.currentSourceId
  },
  {
    pgnClass: PGN_130820_FusionSource,

    node: 'entertainment.device.fusion1.output.zone3.source',

    value: (n2k: PGN_130820_FusionSource) =>
      'entertainment.device.fusion1.avsource.source' +
      n2k.fields.currentSourceId
  },
  {
    pgnClass: PGN_130820_FusionSource,

    node: 'entertainment.device.fusion1.output.zone4.source',

    value: (n2k: PGN_130820_FusionSource) =>
      'entertainment.device.fusion1.avsource.source' +
      n2k.fields.currentSourceId
  },
  {
    pgnClass: PGN_130820_FusionSource,
    node: (n2k: PGN_130820_FusionSource) =>
      'entertainment.device.fusion1.avsource.source' +
      n2k.fields.sourceId +
      '.name',

    value: (n2k: PGN_130820_FusionSource) => {
      fusionSources[n2k.fields.sourceId!] = n2k.fields.source!
      return n2k.fields.source
    }
  },
  {
    pgnClass: PGN_130820_FusionTuner,

    node: (n2k: PGN_130820_FusionTuner) =>
      'entertainment.device.fusion1.avsource.source' +
      currentFusionSource +
      '.tuner.frequency',

    value: (n2k: PGN_130820_FusionTuner) => {
      if (n2k.fields.sourceId == 'AM') {
        return n2k.fields.frequency! / 1000
      } else {
        return n2k.fields.frequency! / 1000000
      }
    },
    filter: (n2k: PGN_130820_FusionTuner) =>
      currentFusionSource != null && n2k.fields.frequency !== undefined
  },
  {
    pgnClass: PGN_130820_FusionTuner,

    node: (n2k: PGN_130820_FusionTuner) =>
      'entertainment.device.fusion1.avsource.source' +
      currentFusionSource +
      '.tuner.signalStrength',

    value: (n2k: PGN_130820_FusionTuner) => n2k.fields.signalStrength,

    filter: (n2k: PGN_130820_FusionSource) => currentFusionSource != null
  },
  {
    pgnClass: PGN_130820_FusionTuner,

    node: (n2k: PGN_130820_FusionTuner) =>
      'entertainment.device.fusion1.avsource.source' +
      currentFusionSource +
      '.track.name',

    value: (n2k: PGN_130820_FusionTuner) =>
      n2k.fields.track && n2k.fields.track.length > 0 ? n2k.fields.track : null,

    filter: (n2k: PGN_130820_FusionSource) => currentFusionSource != null
  },
  {
    pgnClass: PGN_130820_FusionMedia,

    node: (n2k: PGN_130820_FusionMedia) =>
      'entertainment.device.fusion1.avsource.source' +
      currentFusionSource +
      '.playbackState',

    value: function (n2k: PGN_130820_FusionMedia) {
      return n2k.fields.flags == FusionPlayStatus.Paused ||
        n2k.fields.flags == FusionPlayStatus.Stopped
        ? 'Paused'
        : 'Playing'
    },

    filter: (n2k: PGN_130820_FusionSource) => currentFusionSource != null
  },
  {
    pgnClass: PGN_130820_FusionMute,

    node: 'entertainment.device.fusion1.output.zone1.isMuted',

    value: (n2k: PGN_130820_FusionMute) => isMuted(n2k)
  },
  {
    pgnClass: PGN_130820_FusionMute,

    node: 'entertainment.device.fusion1.output.zone2.isMuted',

    value: (n2k: PGN_130820_FusionMute) => isMuted(n2k)
  },
  {
    pgnClass: PGN_130820_FusionMute,

    node: 'entertainment.device.fusion1.output.zone3.isMuted',

    value: (n2k: PGN_130820_FusionMute) => isMuted(n2k)
  },
  {
    pgnClass: PGN_130820_FusionMute,

    node: 'entertainment.device.fusion1.output.zone4.isMuted',

    value: (n2k: PGN_130820_FusionMute) => isMuted(n2k)
  },
  {
    pgnClass: PGN_130820_FusionEq,

    node: 'entertainment.device.fusion1.output.zone1.equalizer',

    value: function (n2k: PGN_130820_FusionEq) {
      return {
        bass: n2k.fields.bass,
        mid: n2k.fields.mid,
        treble: n2k.fields.treble
      }
    }
  },
  {
    pgnClass: PGN_130820_FusionEq,

    node: 'entertainment.device.fusion1.output.zone2.equalizer',

    value: function (n2k: PGN_130820_FusionEq) {
      return {
        bass: n2k.fields.bass,
        mid: n2k.fields.mid,
        treble: n2k.fields.treble
      }
    }
  },
  {
    pgnClass: PGN_130820_FusionEq,

    node: 'entertainment.device.fusion1.output.zone3.equalizer',

    value: function (n2k: PGN_130820_FusionEq) {
      return {
        bass: n2k.fields.bass,
        mid: n2k.fields.mid,
        treble: n2k.fields.treble
      }
    }
  },
  {
    pgnClass: PGN_130820_FusionEq,

    node: 'entertainment.device.fusion1.output.zone4.equalizer',

    value: function (n2k: PGN_130820_FusionEq) {
      return {
        bass: n2k.fields.bass,
        mid: n2k.fields.mid,
        treble: n2k.fields.treble
      }
    }
  }
]
