import { timeToSeconds } from '../utils.js'
import {
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
  FusionPlayStatus,
  FusionMessageId,
  ManufacturerCode,
  FusionPowerState
} from '@canboat/ts-pgns'
let currentFusionSource: number | null = null
const fusionSources: { [key: string]: string } = {}

const isFusionMessage = (n2k: any, id: string): boolean => {
  return (
    n2k.fields.messageId == id &&
    n2k.fields.manufacturerCode == ManufacturerCode.FusionElectronics
  )
}

const isMuted = (n2k: PGN_130820_FusionMute) => 
      n2k.fields.mute == 'Mute On' ? true : false

module.exports = [
  {
    value: (n2k: PGN_130820_FusionDeviceName) => n2k.fields.name,

    node: 'entertainment.device.fusion1.name',

    filter: (n2k: PGN_130820_FusionDeviceName) => n2k.isMatch()
//      isFusionMessage(n2k, FusionMessageId.UnitName)
  },
  {
    node: 'entertainment.device.fusion1.state',

    filter: (n2k: PGN_130820_FusionPowerState) =>
      isFusionMessage(n2k, FusionMessageId.Power),

    value: (n2k: PGN_130820_FusionPowerState) => {
      return n2k.fields.state === FusionPowerState.On ? 'on' : 'off'
    }
  },
  {
    value: (n2k: PGN_130820_FusionArtistName) => n2k.fields.artist,

    node: (n2k: PGN_130820_FusionArtistName) =>
      'entertainment.device.fusion1.avsource.source' +
      currentFusionSource +
      '.track.artistName',

    filter: (n2k: PGN_130820_FusionArtistName) =>
      isFusionMessage(n2k, FusionMessageId.TrackArtist) &&
      n2k.fields.artist != undefined &&
      currentFusionSource != null
  },
  {
    value: (n2k: PGN_130820_FusionAlbumName) => n2k.fields.album,

    node: (n2k: PGN_130820_FusionAlbumName) =>
      'entertainment.device.fusion1.avsource.source' +
      currentFusionSource +
      '.track.albumName',

    filter: (n2k: PGN_130820_FusionAlbumName) =>
      isFusionMessage(n2k, FusionMessageId.TrackAlbum) &&
      n2k.fields.album != undefined &&
      currentFusionSource != null
  },
  {
    value: (n2k:PGN_130820_FusionTrackName) => n2k.fields.track,
    
    node: (n2k: any) => 
    'entertainment.device.fusion1.avsource.source' +
      currentFusionSource +
      '.track.name',

    filter: (n2k: PGN_130820_FusionTrackName) =>
      isFusionMessage(n2k, FusionMessageId.TrackTitle) &&
      n2k.fields.track != undefined &&
      currentFusionSource != null
  },
  {
    node: (n2k: PGN_130820_FusionTrackPosition) => 
    'entertainment.device.fusion1.avsource.source' +
      currentFusionSource +
      '.track.elapsedTime',

    filter: (n2k: PGN_130820_FusionTrackPosition) =>
    isFusionMessage(n2k, FusionMessageId.TrackProgress) &&
      currentFusionSource != null,
    
    value: (n2k: PGN_130820_FusionTrackPosition) =>
      timeToSeconds(n2k.fields.progress)
  },
  {
    node: (n2k: PGN_130820_FusionMedia) =>
    'entertainment.device.fusion1.avsource.source' +
      currentFusionSource +
      '.track.length',

    filter: (n2k: PGN_130820_FusionMedia) =>
    isFusionMessage(n2k,FusionMessageId.TrackInfo) &&
      currentFusionSource != null,
    
    value: (n2k: PGN_130820_FusionMedia) =>
    timeToSeconds(n2k.fields.length)
  },
  {
    value: (n2k:PGN_130820_FusionSiriusxmArtist) => n2k.fields.artist,
    
    node: (n2k: any) =>
    'entertainment.device.fusion1.avsource.source' +
      currentFusionSource +
      '.track.artistName',
    
    filter: (n2k: PGN_130820_FusionSiriusxmArtist) =>
    isFusionMessage(n2k, FusionMessageId.SiriusXmArtist) &&
      currentFusionSource != null
  },
  {
    value: (n2k: PGN_130820_FusionSiriusxmTitle) => n2k.fields.title,
    
    node: (n2k: PGN_130820_FusionSiriusxmTitle) =>
        'entertainment.device.fusion1.avsource.source' +
        currentFusionSource +
      '.track.name',

    filter: (n2k: PGN_130820_FusionSiriusxmTitle) =>
    isFusionMessage(n2k, FusionMessageId.SiriusXmTitle) &&
      currentFusionSource != null,
  },
  {
    value: (n2k: PGN_130820_FusionSiriusxmChannel) => n2k.fields.channel,
    
    node: (n2k: PGN_130820_FusionSiriusxmChannel) =>
    'entertainment.device.fusion1.avsource.source' +
      currentFusionSource +
      '.tuner.stationName',
    
    filter: (n2k: PGN_130820_FusionSiriusxmChannel) =>
    isFusionMessage(n2k, FusionMessageId.SiriusXmChannel) &&
      currentFusionSource != null
  },
  {
    value: (n2k: PGN_130820_FusionSiriusxmContentInfo) => n2k.fields.genre,
    
    node: (n2k: PGN_130820_FusionSiriusxmContentInfo) =>
    'entertainment.device.fusion1.avsource.source' +
      currentFusionSource +
      '.track.genre',
    
    filter: (n2k: any) =>
      isFusionMessage(n2k, FusionMessageId.SiriusXmGenre)
      && currentFusionSource != null
  },
  {
    value: (n2k: PGN_130820_FusionMedia) => n2k.fields.track,
    
    node: (n2k: PGN_130820_FusionMedia) =>
    'entertainment.device.fusion1.avsource.source' +
      currentFusionSource +
      '.track.number',
    
    filter: (n2k: PGN_130820_FusionMedia)  =>
    isFusionMessage(n2k, FusionMessageId.TrackInfo) &&
      currentFusionSource != null
  },
  {
    value: (n2k: PGN_130820_FusionMedia) => n2k.fields.trackCount,
    
    node: (n2k: PGN_130820_FusionMedia) =>
    'entertainment.device.fusion1.avsource.source' +
      currentFusionSource +
      '.track.totalTracks',
    
    filter: (n2k: PGN_130820_FusionMedia) =>
    isFusionMessage(n2k, FusionMessageId.TrackInfo) &&
      currentFusionSource != null
  },
  {
    node: 'entertainment.device.fusion1.output.zone1.volume.master',
    
    value: (n2k: PGN_130820_FusionVolumes) => n2k.fields.zone1,
    
    filter: (n2k: any) => isFusionMessage(n2k, FusionMessageId.Volume)
  },
  {
    node: 'entertainment.device.fusion1.output.zone2.volume.master',

    value: (n2k: PGN_130820_FusionVolumes) => n2k.fields.zone2,
    
    filter: (n2k: any) => isFusionMessage(n2k, FusionMessageId.Volume)
  },
  {
    node: 'entertainment.device.fusion1.output.zone3.volume.master',

    value: (n2k: PGN_130820_FusionVolumes) => n2k.fields.zone3,
    
    filter: (n2k: any) => isFusionMessage(n2k, FusionMessageId.Volume)
  },
  {
    node: 'entertainment.device.fusion1.output.zone4.volume.master',

    value: (n2k: PGN_130820_FusionVolumes) => n2k.fields.zone4,
    
    filter: (n2k: any) => isFusionMessage(n2k, FusionMessageId.Volume)
  },
  {
    node: (n2k: PGN_130820_FusionZoneName) =>
    'entertainment.device.fusion1.output.zone' +
      (n2k.fields.number + 1) +
        '.name',

    value: (n2k: PGN_130820_FusionZoneName) => n2k.fields.name,
    
    filter: (n2k: any) => isFusionMessage(n2k, FusionMessageId.ZoneName)
  },
  {
    node: 'entertainment.device.fusion1.output.zone1.source',
    
    value: (n2k: PGN_130820_FusionSource) => {
      if ( n2k.fields.currentSourceId ) {
        currentFusionSource = n2k.fields.currentSourceId
        return (
          'entertainment.device.fusion1.avsource.source' +
            n2k.fields.currentSourceId
        )
      }
    },
    
    filter: (n2k: PGN_130820_FusionSource)  =>
    isFusionMessage(n2k, FusionMessageId.Source)
  },
  {
    node: 'entertainment.device.fusion1.output.zone2.source',
    
    value: (n2k: PGN_130820_FusionSource) =>
    'entertainment.device.fusion1.avsource.source' +
      n2k.fields.currentSourceId,
    
    filter: (n2k: PGN_130820_FusionSource) =>
    isFusionMessage(n2k, FusionMessageId.Source)
  },
  {
    node: 'entertainment.device.fusion1.output.zone3.source',

    value: (n2k: PGN_130820_FusionSource) =>
    'entertainment.device.fusion1.avsource.source' +
      n2k.fields.currentSourceId,
    
    filter: (n2k: PGN_130820_FusionSource) =>
    
    isFusionMessage(n2k, FusionMessageId.Source)
  },
  {
    node: 'entertainment.device.fusion1.output.zone4.source',

    value: (n2k: PGN_130820_FusionSource) =>
    'entertainment.device.fusion1.avsource.source' +
      n2k.fields.currentSourceId,
    
    filter: (n2k: PGN_130820_FusionSource) =>
    isFusionMessage(n2k, FusionMessageId.Source)
  },
  {
    node: (n2k: PGN_130820_FusionSource) =>
    'entertainment.device.fusion1.avsource.source' +
      n2k.fields.sourceId +
      '.name',
    
    value: (n2k: PGN_130820_FusionSource) => {
      fusionSources[n2k.fields.sourceId!] = n2k.fields.source!
      return n2k.fields.source
    },
    filter: (n2k: PGN_130820_FusionSource) =>
      isFusionMessage(n2k, FusionMessageId.Source)
  },
  /*
    FIXME??
  {
    source: 'amFm',
    node: (n2k: any) {
      return (
        'entertainment.device.fusion1.avsource.source' +
        currentFusionSource +
        '.tuner.mode'
      )
    },
    filter: function (n2k: any) {
      return (
        n2k.fields.messageId == 'AM/FM Station' && currentFusionSource != null
      )
    }
  },
  {
    source: 'frequency',
    node: function (n2k: any) {
      return (
        'entertainment.device.fusion1.avsource.source' +
        currentFusionSource +
        '.tuner.frequency'
      )
    },
    filter: function (n2k: any) {
      return (
        n2k.fields.messageId == 'AM/FM Station' && currentFusionSource != null
      )
    }
    },
    */
  {
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
    filter: function (n2k: any) {
      return isFusionMessage(n2k, FusionMessageId.TrackInfo)
    }
  },
  {
    node: 'entertainment.device.fusion1.output.zone1.isMuted',

    value: (n2k: PGN_130820_FusionMute) => isMuted(n2k),
    
    filter: function (n2k: PGN_130820_FusionMute) {
      return isFusionMessage(n2k, FusionMessageId.Mute)
    }
  },
  {
    node: 'entertainment.device.fusion1.output.zone2.isMuted',
    
    value: (n2k: PGN_130820_FusionMute) => isMuted(n2k),
    
    filter: function (n2k: any) {
      return isFusionMessage(n2k, FusionMessageId.Mute)
    }
  },
  {
    node: 'entertainment.device.fusion1.output.zone3.isMuted',

    value: (n2k: PGN_130820_FusionMute) => isMuted(n2k),
    
    filter: function (n2k: any) {
      return isFusionMessage(n2k, FusionMessageId.Mute)
    }
  },
  {
    node: 'entertainment.device.fusion1.output.zone4.isMuted',

    value: (n2k: PGN_130820_FusionMute) => isMuted(n2k),
    
    filter: function (n2k: any) {
      return isFusionMessage(n2k, FusionMessageId.Mute)
    }
  },
  {
    node: 'entertainment.device.fusion1.output.zone1.equalizer',
    
    value: function (n2k: PGN_130820_FusionEq) {
      return {
        bass: n2k.fields.bass,
        mid: n2k.fields.mid,
        treble: n2k.fields.treble
      }
    },
    
    filter: function (n2k: PGN_130820_FusionEq) {
      return isFusionMessage(n2k, FusionMessageId.Tone)
    }
  },
  {
    node: 'entertainment.device.fusion1.output.zone2.equalizer',

    value: function (n2k: PGN_130820_FusionEq) {
      return {
        bass: n2k.fields.bass,
        mid: n2k.fields.mid,
        treble: n2k.fields.treble
      }
    },
    
    filter: function (n2k: PGN_130820_FusionEq) {
      return isFusionMessage(n2k, FusionMessageId.Tone)
    }
  },
  {
    node: 'entertainment.device.fusion1.output.zone3.equalizer',

    value: function (n2k: PGN_130820_FusionEq) {
      return {
        bass: n2k.fields.bass,
        mid: n2k.fields.mid,
        treble: n2k.fields.treble
      }
    },
    
    filter: function (n2k: PGN_130820_FusionEq) {
      return isFusionMessage(n2k, FusionMessageId.Tone)
    }
  },
  {
    node: 'entertainment.device.fusion1.output.zone4.equalizer',

    value: function (n2k: PGN_130820_FusionEq) {
      return {
        bass: n2k.fields.bass,
        mid: n2k.fields.mid,
        treble: n2k.fields.treble
      }
    },
    
    filter: function (n2k: PGN_130820_FusionEq) {
      return isFusionMessage(n2k, FusionMessageId.Tone)
    }
  }
]
