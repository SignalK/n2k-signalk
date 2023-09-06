const { timeToSeconds } = require('../utils.js')
var currentFusionSource = null
var fusionSources = {}

module.exports = [
  {
    source: 'Name',
    node: 'entertainment.device.fusion1.name',
    filter: function(n2k) { return n2k.fields['Message ID'] == 'Unit Name' }
  }, {
    node: 'entertainment.device.fusion1.state',
    filter: function(n2k) { return n2k.fields['Message ID'] == 'Power' },
    value: function(n2k) {
      return n2k.fields['State'] === 'On' ? 'on' : 'off'
    }
  }, {
    source: 'Artist',
    node: function (n2k) { return 'entertainment.device.fusion1.avsource.source' + currentFusionSource + '.track.artistName' },
    filter: function(n2k) { return n2k.fields['Message ID'] == 'Track Artist' && n2k.fields.Artist != 0 && currentFusionSource != null }
  }, {
    source: 'Album',
    node: function(n2k) { return 'entertainment.device.fusion1.avsource.source' + currentFusionSource + '.track.albumName'} ,
    filter: function(n2k) { return n2k.fields['Message ID'] == 'Track Album'  && n2k.fields.Album != 0 && currentFusionSource != null }
  }, {
    source: 'Track',
    node: function(n2k) { return 'entertainment.device.fusion1.avsource.source' + currentFusionSource + '.track.name'} ,
    filter: function(n2k) { return n2k.fields['Message ID'] == 'Track Title'  && n2k.fields.Track != 0  && currentFusionSource != null  }	
  }, {
    //source: 'Progress',
    node: function(n2k) { return 'entertainment.device.fusion1.avsource.source' + currentFusionSource + '.track.elapsedTime'} ,
    filter: function(n2k) { return n2k.fields['Message ID'] == 'Track Progress' && currentFusionSource != null },
    value: function(n2k) {
      return timeToSeconds(n2k.fields['Progress'])
    }
  }, {
    //source: 'Length',
    node: function(n2k) { return 'entertainment.device.fusion1.avsource.source' + currentFusionSource + '.track.length'} ,
    filter: function(n2k) { return n2k.fields['Message ID'] == 'Track Info' && currentFusionSource != null },
    value: function(n2k) {
      return timeToSeconds(n2k.fields['Length'])
    }
  }, {
    source: 'Artist',
    node: function(n2k) { return 'entertainment.device.fusion1.avsource.source' + currentFusionSource + '.track.artistName'} ,
    filter: function(n2k) { return n2k.fields['Message ID'] == 'SiriusXM Artist' && currentFusionSource != null }
  }, {
    source: 'Title',
    node: function(n2k) { return 'entertainment.device.fusion1.avsource.source' + currentFusionSource + '.track.name'} ,
    filter: function(n2k) { return n2k.fields['Message ID'] == 'SiriusXM Title' && currentFusionSource != null }
  }, {
    source: 'Channel',
    node: function(n2k) { return 'entertainment.device.fusion1.avsource.source' + currentFusionSource + '.tuner.stationName'} ,
    filter: function(n2k) { return n2k.fields['Message ID'] == 'SiriusXM Channel' && currentFusionSource != null  }
  }, {
    source: 'Genre',
    node: function(n2k) { return 'entertainment.device.fusion1.avsource.source' + currentFusionSource + '.track.genre'} ,
    filter: function(n2k) { return n2k.fields['Message ID'] == 'SiriusXM Genre' && currentFusionSource != null }
  }, {
    source: 'Track #',
    node: function(n2k) { return 'entertainment.device.fusion1.avsource.source' + currentFusionSource + '.track.number'} ,
    filter: function(n2k) { return n2k.fields['Message ID'] == 'Track Info' && currentFusionSource != null }
  }, {
    source: 'Track Count',
    node: function(n2k) { return 'entertainment.device.fusion1.avsource.source' + currentFusionSource + '.track.totalTracks'} ,
    filter: function(n2k) { return n2k.fields['Message ID'] == 'Track Info' && currentFusionSource != null }
  }, {
    node: 'entertainment.device.fusion1.output.zone1.volume.master',
    source: 'Zone 1',
    filter: function(n2k) { return n2k.fields['Message ID'] == 'Volume' }
  }, {
    node: 'entertainment.device.fusion1.output.zone2.volume.master',
    source: 'Zone 2',
    filter: function(n2k) { return n2k.fields['Message ID'] == 'Volume' }
  }, {
    node: 'entertainment.device.fusion1.output.zone3.volume.master',
    source: 'Zone 3',
    filter: function(n2k) { return n2k.fields['Message ID'] == 'Volume' }
  }, {
    node: 'entertainment.device.fusion1.output.zone4.volume.master',
    source: 'Zone 4',
    filter: function(n2k) { return n2k.fields['Message ID'] == 'Volume' }
  }, {
    node: function (n2k) { return 'entertainment.device.fusion1.output.zone' + (Number(n2k.fields.Number)+1) + '.name' },

    source: 'Name',
    filter: function(n2k) { return n2k.fields['Message ID'] == 'Zone Name' }


   }, {
    node: 'entertainment.device.fusion1.output.zone1.source',
     value: function(n2k) {
       currentFusionSource = n2k.fields['Current Source ID']
       return 'entertainment.device.fusion1.avsource.source' + n2k.fields['Current Source ID']
     },
     filter: function(n2k) { return n2k.fields['Message ID'] == 'Source' }
   }, {
    node: 'entertainment.device.fusion1.output.zone2.source',
     value: function(n2k) {
       return 'entertainment.device.fusion1.avsource.source' + n2k.fields['Current Source ID']
     },
     filter: function(n2k) { return n2k.fields['Message ID'] == 'Source' }
   }, {
     node: 'entertainment.device.fusion1.output.zone3.source',
     value: function(n2k) {
       return 'entertainment.device.fusion1.avsource.source' + n2k.fields['Current Source ID']
     },
     filter: function(n2k) { return n2k.fields['Message ID'] == 'Source' }
   }, {
     node: 'entertainment.device.fusion1.output.zone4.source',
     value: function(n2k) {
       return 'entertainment.device.fusion1.avsource.source' + n2k.fields['Current Source ID']
     },
     filter: function(n2k) { return n2k.fields['Message ID'] == 'Source' }
  }, {
    node: function (n2k) { return 'entertainment.device.fusion1.avsource.source' + n2k.fields['Source ID'] + '.name' },
    value: function(n2k) {
      fusionSources[n2k.fields['Source ID']] = n2k.fields.Source
      return n2k.fields.Source
    },
    filter: function(n2k) { return n2k.fields['Message ID'] == 'Source' }
    
  }, {
    source: 'AM/FM',
    node: function(n2k) { return 'entertainment.device.fusion1.avsource.source' + currentFusionSource + '.tuner.mode'} ,
    filter: function(n2k) { return n2k.fields['Message ID'] == 'AM/FM Station' && currentFusionSource != null}
  }, {
    source: 'Frequency',
    node: function(n2k) { return 'entertainment.device.fusion1.avsource.source' + currentFusionSource + '.tuner.frequency'} ,
    filter: function(n2k) { return n2k.fields['Message ID'] == 'AM/FM Station' && currentFusionSource != null }
  }, {
    node: function(n2k) { return 'entertainment.device.fusion1.avsource.source' + currentFusionSource + '.playbackState'} ,
    value: function(n2k) {
      var val = n2k.fields['Transport']
      return val == 'Paused' || val == 'Stop' ? 'Paused' : 'Playing'
    },
    filter: function(n2k) { return n2k.fields['Message ID'] == 'Track Info' }
  }, {
    node: 'entertainment.device.fusion1.output.zone1.isMuted',
    value: function(n2k) {
      var val = n2k.fields['Mute']
      return val == 'Mute On' ? true : false
    },
    filter: function(n2k) { return n2k.fields['Message ID'] == 'Mute' }
  }, {
    node: 'entertainment.device.fusion1.output.zone2.isMuted',
    value: function(n2k) {
      var val = n2k.fields['Mute']
      return val == 'Mute On' ? true : false
    },
    filter: function(n2k) { return n2k.fields['Message ID'] == 'Mute' }
  }, {
    node: 'entertainment.device.fusion1.output.zone3.isMuted',
    value: function(n2k) {
      var val = n2k.fields['Mute']
      return val == 'Mute On' ? true : false
    },
    filter: function(n2k) { return n2k.fields['Message ID'] == 'Mute' }
  }, {
    node: 'entertainment.device.fusion1.output.zone4.isMuted',
    value: function(n2k) {
      var val = n2k.fields['Mute']
      return val == 'Mute On' ? true : false
    },
    filter: function(n2k) { return n2k.fields['Message ID'] == 'Mute' }
    
  }, {
    node: 'entertainment.device.fusion1.output.zone1.equalizer',
    value: function(n2k) {
      return {
	bass: Number(n2k.fields.Bass),
	mid: Number(n2k.fields.Mid),
	treble: Number(n2k.fields.Treble)
      }
    },
    filter: function(n2k) { return n2k.fields['Message ID'] == 'Tone' }
  }, {
    node: 'entertainment.device.fusion1.output.zone2.equalizer',
    value: function(n2k) {
      return {
	bass: Number(n2k.fields.Bass),
	mid: Number(n2k.fields.Mid),
	treble: Number(n2k.fields.Treble)
      }
    },
    filter: function(n2k) { return n2k.fields['Message ID'] == 'Tone' }
  }, {
    node: 'entertainment.device.fusion1.output.zone3.equalizer',
    value: function(n2k) {
      return {
	bass: Number(n2k.fields.Bass),
	mid: Number(n2k.fields.Mid),
	treble: Number(n2k.fields.Treble)
      }
    },
    filter: function(n2k) { return n2k.fields['Message ID'] == 'Tone' }
  }, {
    node: 'entertainment.device.fusion1.output.zone4.equalizer',
    value: function(n2k) {
      return {
	bass: Number(n2k.fields.Bass),
	mid: Number(n2k.fields.Mid),
	treble: Number(n2k.fields.Treble)
      }
    },
    filter: function(n2k) { return n2k.fields['Message ID'] == 'Tone' }
  }
]
