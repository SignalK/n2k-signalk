function prefix (key, n2k, state) {
  return state.deviceName
    ? `entertainment.device.${state.deviceName}.${key}`
    : null
}

function sourcePrefix (key, n2k, state) {
  return state.currentFusionSource
    ? prefix(`avsource.source${state.currentFusionSource}.${key}`, n2k, state)
    : null
}

module.exports = [
  {
    source: 'Name',
    node: (n2k, state) => {
      state.deviceName = n2k.fields.Name
      return prefix('name', n2k, state)
    },
    filter: n2k => n2k.fields['Message ID'] == 'Unit Name'
  },
  {
    node: (n2k, state) => {
      return prefix('manufacturer', n2k, state)
    },
    value: () => "FUSION",
    filter: n2k => n2k.fields['Message ID'] == 'Unit Name'
  },
  {
    node: prefix.bind(null, 'state'),
    filter: n2k => n2k.fields['Message ID'] == 'Power',
    value: n2k => (n2k.fields['State'] === 'On' ? 'on' : 'off')
  },
  {
    source: 'Artist',
    node: sourcePrefix.bind(null, 'track.artistName'),
    filter: (n2k, state) =>
      n2k.fields['Message ID'] == 'Track Artist' && n2k.fields.Artist != 0
  },
  {
    source: 'Album',
    node: sourcePrefix.bind(null, 'track.albumName'),
    filter: (n2k, state) =>
      n2k.fields['Message ID'] == 'Track Album' && n2k.fields.Album != 0
  },
  {
    source: 'Track',
    node: sourcePrefix.bind(null, 'track.name'),
    filter: (n2k, state) =>
      n2k.fields['Message ID'] == 'Track Title' && n2k.fields.Track != 0
  },
  {
    source: 'Progress',
    node: sourcePrefix.bind(null, 'track.elapsedTime'),
    filter: (n2k, state) => n2k.fields['Message ID'] == 'Track Progress'
  },
  {
    source: 'Track Length',
    node: sourcePrefix.bind(null, 'track.length'),
    filter: (n2k, state) => n2k.fields['Message ID'] == 'Track Info'
  },
  {
    source: 'Artist',
    node: sourcePrefix.bind(null, 'track.artistName'),
    filter: (n2k, state) => n2k.fields['Message ID'] == 'SiriusXM Artist'
  },
  {
    source: 'Title',
    node: sourcePrefix.bind(null, 'track.name'),
    filter: (n2k, state) => n2k.fields['Message ID'] == 'SiriusXM Title'
  },
  {
    source: 'Channel',
    node: (n2k, state) => sourcePrefix.bind(null, 'tuner.stationName'),
    filter: (n2k, state) => n2k.fields['Message ID'] == 'SiriusXM Channel'
  },
  {
    source: 'Genre',
    node: sourcePrefix.bind(null, 'track.genre'),
    filter: n2k => n2k.fields['Message ID'] == 'SiriusXM Genre'
  },
  {
    source: 'Track #',
    node: sourcePrefix.bind(null, 'track.number'),
    filter: (n2k, state) => n2k.fields['Message ID'] == 'Track Info'
  },
  {
    source: 'Track Count',
    node: sourcePrefix.bind(null, 'track.totalTracks'),
    filter: (n2k, state) => n2k.fields['Message ID'] == 'Track Info'
  },
  {
    node: prefix.bind(null, 'output.zone1.volume.master'),
    source: 'Zone 1',
    filter: (n2k, state) => n2k.fields['Message ID'] == 'Volume'
  },
  {
    node: prefix.bind(null, 'output.zone2.volume.master'),
    source: 'Zone 2',
    filter: (n2k, state) => n2k.fields['Message ID'] == 'Volume'
  },
  {
    node: prefix.bind(null, 'output.zone3.volume.master'),
    source: 'Zone 3',
    filter: (n2k, state) => n2k.fields['Message ID'] == 'Volume'
  },
  {
    node: prefix.bind(null, 'output.zone4.volume.master'),
    source: 'Zone 4',
    filter: (n2k, state) => n2k.fields['Message ID'] == 'Volume'
  },
  {
    node: (n2k, state) =>
      prefix(
        'output.zone' + (Number(n2k.fields.Number) + 1) + '.name',
        n2k,
        state
      ),
    source: 'Name',
    filter: (n2k, state) => n2k.fields['Message ID'] == 'Zone Name'
  },
  {
    node: prefix.bind(null, 'output.zone1.source'),
    value: (n2k, state) => {
      state.currentFusionSource = n2k.fields['Current Source ID']
      return prefix(
        'avsource.source' + n2k.fields['Current Source ID'],
        n2k,
        state
      )
    },
    filter: (n2k, state) => n2k.fields['Message ID'] == 'Source'
  },
  {
    node: prefix.bind(null, 'output.zone2.source'),
    value: (n2k, state) =>
      prefix('avsource.source' + n2k.fields['Current Source ID'], n2k, state),
    filter: (n2k, state) => n2k.fields['Message ID'] == 'Source'
  },
  {
    node: prefix.bind(null, 'output.zone3.source'),
    value: (n2k, state) =>
      prefix('avsource.source' + n2k.fields['Current Source ID'], n2k, state),
    filter: (n2k, state) => n2k.fields['Message ID'] == 'Source'
  },
  {
    node: prefix.bind(null, 'output.zone4.source'),
    value: (n2k, state) =>
      prefix('avsource.source' + n2k.fields['Current Source ID'], n2k, state),
    filter: (n2k, state) => n2k.fields['Message ID'] == 'Source'
  },
  {
    source: 'Source',
    node: (n2k, state) =>
      prefix('avsource.source' + n2k.fields['Source ID'] + '.name', n2k, state),
    filter: (n2k, state) => n2k.fields['Message ID'] == 'Source'
  },
  {
    source: 'AM/FM',
    node: sourcePrefix.bind(null, 'tuner.mode'),
    filter: (n2k, state) => n2k.fields['Message ID'] == 'AM/FM Station'
  },
  {
    source: 'Frequency',
    node: sourcePrefix.bind(null, 'tuner.frequency'),
    filter: (n2k, state) => n2k.fields['Message ID'] == 'AM/FM Station'
  },
  {
    node: sourcePrefix.bind(null, 'playbackState'),
    value: (n2k, state) => {
      var val = n2k.fields['Transport']
      return val == 'Paused' ? 'Paused' : 'Playing'
    },
    filter: (n2k, state) => n2k.fields['Message ID'] == 'Track Info'
  },
  {
    node: prefix.bind(null, 'output.zone1.isMuted'),
    value: (n2k, state) => {
      var val = n2k.fields['Mute']
      return val == 'Muted' ? true : false
    },
    filter: (n2k, state) => n2k.fields['Message ID'] == 'Mute'
  },
  {
    node: prefix.bind(null, 'output.zone2.isMuted'),
    value: (n2k, state) => {
      var val = n2k.fields['Mute']
      return val == 'Muted' ? true : false
    },
    filter: (n2k, state) => n2k.fields['Message ID'] == 'Mute'
  },
  {
    node: prefix.bind(null, 'output.zone3.isMuted'),
    value: (n2k, state) => {
      var val = n2k.fields['Mute']
      return val == 'Muted' ? true : false
    },
    filter: (n2k, state) => n2k.fields['Message ID'] == 'Mute'
  },
  {
    node: prefix.bind(null, 'output.zone4.isMuted'),
    value: (n2k, state) => {
      var val = n2k.fields['Mute']
      return val == 'Muted' ? true : false
    },
    filter: (n2k, state) => n2k.fields['Message ID'] == 'Mute'
  },
  {
    node: prefix.bind(null, 'output.zone1.equalizer'),
    value: (n2k, state) => {
      return {
        bass: Number(n2k.fields.Bass),
        mid: Number(n2k.fields.Mid),
        treble: Number(n2k.fields.Treble)
      }
    },
    filter: (n2k, state) => n2k.fields['Message ID'] == 'Tone'
  },
  {
    node: prefix.bind(null, 'output.zone2.equalizer'),
    value: (n2k, state) => {
      return {
        bass: Number(n2k.fields.Bass),
        mid: Number(n2k.fields.Mid),
        treble: Number(n2k.fields.Treble)
      }
    },
    filter: (n2k, state) => n2k.fields['Message ID'] == 'Tone'
  },
  {
    node: prefix.bind(null, 'output.zone3.equalizer'),
    value: (n2k, state) => {
      return {
        bass: Number(n2k.fields.Bass),
        mid: Number(n2k.fields.Mid),
        treble: Number(n2k.fields.Treble)
      }
    },
    filter: (n2k, state) => n2k.fields['Message ID'] == 'Tone'
  },
  {
    node: prefix.bind(null, 'output.zone4.equalizer'),
    value: (n2k, state) => {
      return {
        bass: Number(n2k.fields.Bass),
        mid: Number(n2k.fields.Mid),
        treble: Number(n2k.fields.Treble)
      }
    },
    filter: (n2k, state) => n2k.fields['Message ID'] == 'Tone'
  }
]
