const { timeToSeconds } = require('../utils.js')
var currentFusionSource = null
var fusionSources = {}

module.exports = [
  {
    source: 'name',
    node: 'entertainment.device.fusion1.name',
    filter: function(n2k) { return n2k.fields.messageId == 'Unit Name' }
  }, {
    node: 'entertainment.device.fusion1.state',
    filter: function(n2k) { return n2k.fields.messageId == 'Power' },
    value: function(n2k) {
      return n2k.fields.state === 'On' ? 'on' : 'off'
    }
  }, {
    source: 'artist',
    node: function (n2k) { return 'entertainment.device.fusion1.avsource.source' + currentFusionSource + '.track.artistName' },
    filter: function(n2k) { return n2k.fields.messageId == 'Track Artist' && n2k.fields.artist != 0 && currentFusionSource != null }
  }, {
    source: 'album',
    node: function(n2k) { return 'entertainment.device.fusion1.avsource.source' + currentFusionSource + '.track.albumName'} ,
    filter: function(n2k) { return n2k.fields.messageId == 'Track Album'  && n2k.fields.album != 0 && currentFusionSource != null }
  }, {
    source: 'track',
    node: function(n2k) { return 'entertainment.device.fusion1.avsource.source' + currentFusionSource + '.track.name'} ,
    filter: function(n2k) { return n2k.fields.messageId == 'Track Title'  && n2k.fields.track != 0  && currentFusionSource != null  }	
  }, {
    //source: 'Progress',
    node: function(n2k) { return 'entertainment.device.fusion1.avsource.source' + currentFusionSource + '.track.elapsedTime'} ,
    filter: function(n2k) { return n2k.fields.messageId == 'Track Progress' && currentFusionSource != null },
    value: function(n2k) {
      return timeToSeconds(n2k.fields.progress)
    }
  }, {
    //source: 'Length',
    node: function(n2k) { return 'entertainment.device.fusion1.avsource.source' + currentFusionSource + '.track.length'} ,
    filter: function(n2k) { return n2k.fields.messageId == 'Track Info' && currentFusionSource != null },
    value: function(n2k) {
      return timeToSeconds(n2k.fields.length)
    }
  }, {
    source: 'artist',
    node: function(n2k) { return 'entertainment.device.fusion1.avsource.source' + currentFusionSource + '.track.artistName'} ,
    filter: function(n2k) { return n2k.fields.messageId == 'SiriusXM Artist' && currentFusionSource != null }
  }, {
    source: 'title',
    node: function(n2k) { return 'entertainment.device.fusion1.avsource.source' + currentFusionSource + '.track.name'} ,
    filter: function(n2k) { return n2k.fields.messageId == 'SiriusXM Title' && currentFusionSource != null }
  }, {
    source: 'channel',
    node: function(n2k) { return 'entertainment.device.fusion1.avsource.source' + currentFusionSource + '.tuner.stationName'} ,
    filter: function(n2k) { return n2k.fields.messageId == 'SiriusXM Channel' && currentFusionSource != null  }
  }, {
    source: 'genre',
    node: function(n2k) { return 'entertainment.device.fusion1.avsource.source' + currentFusionSource + '.track.genre'} ,
    filter: function(n2k) { return n2k.fields.messageId == 'SiriusXM Genre' && currentFusionSource != null }
  }, {
    source: 'track',
    node: function(n2k) { return 'entertainment.device.fusion1.avsource.source' + currentFusionSource + '.track.number'} ,
    filter: function(n2k) { return n2k.fields.messageId == 'Track Info' && currentFusionSource != null }
  }, {
    source: 'trackCount',
    node: function(n2k) { return 'entertainment.device.fusion1.avsource.source' + currentFusionSource + '.track.totalTracks'} ,
    filter: function(n2k) { return n2k.fields.messageId == 'Track Info' && currentFusionSource != null }
  }, {
    node: 'entertainment.device.fusion1.output.zone1.volume.master',
    source: 'zone1',
    filter: function(n2k) { return n2k.fields.messageId == 'Volume' }
  }, {
    node: 'entertainment.device.fusion1.output.zone2.volume.master',
    source: 'zone2',
    filter: function(n2k) { return n2k.fields.messageId == 'Volume' }
  }, {
    node: 'entertainment.device.fusion1.output.zone3.volume.master',
    source: 'zone3',
    filter: function(n2k) { return n2k.fields.messageId == 'Volume' }
  }, {
    node: 'entertainment.device.fusion1.output.zone4.volume.master',
    source: 'zone4',
    filter: function(n2k) { return n2k.fields.messageId == 'Volume' }
  }, {
    node: function (n2k) { return 'entertainment.device.fusion1.output.zone' + (Number(n2k.fields.number)+1) + '.name' },

    source: 'name',
    filter: function(n2k) { return n2k.fields.messageId == 'Zone Name' }


   }, {
    node: 'entertainment.device.fusion1.output.zone1.source',
     value: function(n2k) {
       currentFusionSource = n2k.fields.currentSourceId
       return 'entertainment.device.fusion1.avsource.source' + n2k.fields.currentSourceId
     },
     filter: function(n2k) { return n2k.fields.messageId == 'Source' }
   }, {
    node: 'entertainment.device.fusion1.output.zone2.source',
     value: function(n2k) {
       return 'entertainment.device.fusion1.avsource.source' + n2k.fields.currentSourceId
     },
     filter: function(n2k) { return n2k.fields.messageId == 'Source' }
   }, {
     node: 'entertainment.device.fusion1.output.zone3.source',
     value: function(n2k) {
       return 'entertainment.device.fusion1.avsource.source' + n2k.fields.currentSourceId
     },
     filter: function(n2k) { return n2k.fields.messageId == 'Source' }
   }, {
     node: 'entertainment.device.fusion1.output.zone4.source',
     value: function(n2k) {
       return 'entertainment.device.fusion1.avsource.source' + n2k.fields.currentSourceId
     },
     filter: function(n2k) { return n2k.fields.messageId == 'Source' }
  }, {
    node: function (n2k) { return 'entertainment.device.fusion1.avsource.source' + n2k.fields.sourceId + '.name' },
    value: function(n2k) {
      fusionSources[n2k.fields.sourceId] = n2k.fields.source
      return n2k.fields.source
    },
    filter: function(n2k) { return n2k.fields.messageId == 'Source' }
    
  }, {
    source: 'amFm',
    node: function(n2k) { return 'entertainment.device.fusion1.avsource.source' + currentFusionSource + '.tuner.mode'} ,
    filter: function(n2k) { return n2k.fields.messageId == 'AM/FM Station' && currentFusionSource != null}
  }, {
    source: 'frequency',
    node: function(n2k) { return 'entertainment.device.fusion1.avsource.source' + currentFusionSource + '.tuner.frequency'} ,
    filter: function(n2k) { return n2k.fields.messageId == 'AM/FM Station' && currentFusionSource != null }
  }, {
    node: function(n2k) { return 'entertainment.device.fusion1.avsource.source' + currentFusionSource + '.playbackState'} ,
    value: function(n2k) {
      var val = n2k.fields.transport
      return val == 'Paused' || val == 'Stop' ? 'Paused' : 'Playing'
    },
    filter: function(n2k) { return n2k.fields.messageId == 'Track Info' }
  }, {
    node: 'entertainment.device.fusion1.output.zone1.isMuted',
    value: function(n2k) {
      var val = n2k.fields.mute
      return val == 'Mute On' ? true : false
    },
    filter: function(n2k) { return n2k.fields.messageId == 'Mute' }
  }, {
    node: 'entertainment.device.fusion1.output.zone2.isMuted',
    value: function(n2k) {
      var val = n2k.fields.mute
      return val == 'Mute On' ? true : false
    },
    filter: function(n2k) { return n2k.fields.messageId == 'Mute' }
  }, {
    node: 'entertainment.device.fusion1.output.zone3.isMuted',
    value: function(n2k) {
      var val = n2k.fields.mute
      return val == 'Mute On' ? true : false
    },
    filter: function(n2k) { return n2k.fields.messageId == 'Mute' }
  }, {
    node: 'entertainment.device.fusion1.output.zone4.isMuted',
    value: function(n2k) {
      var val = n2k.fields.mute
      return val == 'Mute On' ? true : false
    },
    filter: function(n2k) { return n2k.fields.messageId == 'Mute' }
    
  }, {
    node: 'entertainment.device.fusion1.output.zone1.equalizer',
    value: function(n2k) {
      return {
	bass: Number(n2k.fields.bass),
	mid: Number(n2k.fields.mid),
	treble: Number(n2k.fields.treble)
      }
    },
    filter: function(n2k) { return n2k.fields.messageId == 'Tone' }
  }, {
    node: 'entertainment.device.fusion1.output.zone2.equalizer',
    value: function(n2k) {
      return {
	bass: Number(n2k.fields.bass),
	mid: Number(n2k.fields.mid),
	treble: Number(n2k.fields.treble)
      }
    },
    filter: function(n2k) { return n2k.fields.messageId == 'Tone' }
  }, {
    node: 'entertainment.device.fusion1.output.zone3.equalizer',
    value: function(n2k) {
      return {
	bass: Number(n2k.fields.bass),
	mid: Number(n2k.fields.mid),
	treble: Number(n2k.fields.treble)
      }
    },
    filter: function(n2k) { return n2k.fields.messageId == 'Tone' }
  }, {
    node: 'entertainment.device.fusion1.output.zone4.equalizer',
    value: function(n2k) {
      return {
	bass: Number(n2k.fields.bass),
	mid: Number(n2k.fields.mid),
	treble: Number(n2k.fields.treble)
      }
    },
    filter: function(n2k) { return n2k.fields.messageId == 'Tone' }
  }
]
