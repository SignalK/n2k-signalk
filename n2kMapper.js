const EventEmitter = require('events').EventEmitter
var through = require('through')
var debug = require('debug')('signalk:n2k-signalk')
const toPgn = require('@canboat/canboatjs').toPgn
const Uint64LE = require('int64-buffer').Uint64LE

require('util').inherits(N2kMapper, EventEmitter);

var n2kMappings = {}
Object.assign(n2kMappings, require('./pgns'))
Object.assign(n2kMappings, require('./fusion'))
Object.assign(n2kMappings, require('./lowrance'))
Object.assign(n2kMappings, require('./raymarine'))
Object.assign(n2kMappings, require('./maretron'))

function N2kMapper (options) {
  this.state = {}

  this.on('n2kRequestMetadata', (src) => {
    if ( src === 255 ) {
      return
    }
    this.requestMetaData(src, 126996)
    this.requestMetaData(src, 126998)
    this.requestMetaData(src, 60928)
  })
}

N2kMapper.prototype.requestMetaData = function(src, pgn) {
  const reqPgn = {
    "pgn": 59904,
    "dst": src,
    "PGN": pgn
  }
  let retries = 5
  debug(`requesting pgn ${pgn} from src ${src}`)
  this.emit('n2kOut', reqPgn)
  let interval = setInterval(() => {
    if ( retries-- === 0 ) {
      debug(`did not get meta pgn ${pgn} for src ${src}`)
      clearInterval(interval)
    } else if ( this.state[src] && this.state[src].metaPGNsReceived && this.state[src].metaPGNsReceived.indexOf(pgn) != -1 ) {
      clearInterval(interval)
      debug(`got meta pgn ${pgn} from src ${src}`)
    } else {
      debug(`did not get pgn ${pgn} from src ${src}, retrying..`)
      this.emit('n2kOut', reqPgn)
    }
  }, 2000)
}

N2kMapper.prototype.toDelta = function(n2k) {
  if ( metaPGNs[n2k.pgn] ) {
    const meta = metaPGNs[n2k.pgn](n2k)
    if ( ! this.state[n2k.src] ) {
      this.state[n2k.src] = {}
    }

    if ( !this.state[n2k.src].metaPGNsReceived ) {
      this.state[n2k.src].metaPGNsReceived = []
    }

    if ( n2k.pgn === 60928 ) {
      const canName = new Uint64LE(toPgn(n2k)).toString()
      if ( ! this.state[n2k.src] ) {
        this.state[n2k.src] = {}
      } else if ( this.state[n2k.src].canName && this.state[n2k.src].canName != canName ) {
        // clear out any existing state since the src addresses have changed
        this.emit('n2kSourceChanged', n2k.src, this.state[n2k.src].canName, canName)
        this.state[n2k.src] = {}
        this.emit('n2kRequestMetadata', n2k.src)
      }
      this.state[n2k.src].deviceInstance = meta.deviceInstance
      meta.canName = canName
      this.state[n2k.src].canName = canName
    }

    this.state[n2k.src].metaPGNsReceived.push(n2k.pgn)
    
    this.emit('n2kSourceMetadata', n2k, meta)
  } else {
    return toDelta(n2k, this.state)
  }
}

var toDelta = function (n2k, state) {
  try {
    var theMappings = n2kMappings[n2k.pgn]
    var src_state
    if (state) {
      var n2k_src = n2k.src.toString()
      if (!state[n2k_src]) {
        state[n2k_src] = {}
      }
      src_state = state[n2k_src]
    }
    var result = {
      updates: [
        {
          source: {
            label: '',
            type: 'NMEA2000',
            pgn: Number(n2k.pgn),
            src: n2k.src.toString()
          },
          timestamp:
            n2k.timestamp.substring(0, 10) +
            'T' +
            n2k.timestamp.substring(11, n2k.timestamp.length),
          values: toValuesArray(theMappings, n2k, src_state)
        }
      ]
    }
    if ( src_state && src_state.canName ) {
      result.updates[0].source.canName = src_state.canName
    }
    if ( src_state && typeof src_state.deviceInstance !== 'undefined' ) {
      result.updates[0].source.deviceInstance = src_state.deviceInstance
    }
    if (
      typeof theMappings !== 'undefined' &&
      typeof theMappings !== 'function'
    ) {
      theMappings.forEach(function (mapping) {
        if (typeof mapping.context === 'function') {
          result.context = mapping.context(n2k, src_state)
        }
      })
      if (theMappings.length === 1 && theMappings[0].instance) {
        result.updates[0].source.instance = theMappings[0].instance(n2k)
      }
    }
    return result
  } catch (ex) {
    console.error('Unable to convert:' + ex.message + ':' + JSON.stringify(n2k))
    return { updates: [] }
  }
}

function getValue (n2k, theMapping, state) {
  if (typeof theMapping.source !== 'undefined') {
    var stringValue = n2k.fields[theMapping.source]
    if (!stringValue && stringValue != '') {
      return undefined
    }
    var numberValue = Number(stringValue)
    return isNaN(numberValue) ? stringValue : numberValue
  } else {
    if (theMapping.value) {
      return theMapping.value(n2k, state)
    }
  }
}

function reduceMapping (updates, theMapping) {
  try {
    if (typeof theMapping === 'function') {
      updates.push.apply(updates, theMapping(n2k, state))
    } else {
      var path =
        typeof theMapping.node === 'function'
          ? theMapping.node(n2k, state)
          : theMapping.node
      var value =
        typeof theMapping.source === 'function'
          ? theMapping.source(n2k, state)
          : getValue(n2k, theMapping, state)
      var allowNull =
        typeof theMapping.allowNull !== 'undefined' && theMapping.allowNull
      if (!(value == null) || allowNull) {
        // null or undefined
        updates.push({
          path: path,
          value: value
        })
      }
    }
  } catch (ex) {
    process.stderr.write(ex + ' ' + JSON.stringify(n2k))
  }
  return updates
}

var toValuesArray = function (theMappings, n2k, state) {
  if (n2k.fields && typeof theMappings !== 'undefined') {
    return theMappings
      .filter(function (theMapping) {
        try {
          return (
            typeof theMapping.filter === 'undefined' ||
            theMapping.filter(n2k, state)
          )
        } catch (ex) {
          process.stderr.write(ex + ' ' + n2k)
          return false
        }
      })
      .reduce((updates, theMapping) => {
        try {
          if (typeof theMapping === 'function') {
            Array.prototype.push.apply(updates, theMapping(n2k, state))
          } else {
            var path =
              typeof theMapping.node === 'function'
                ? theMapping.node(n2k, state)
                : theMapping.node
            var value =
              typeof theMapping.source === 'function'
                ? theMapping.source(n2k, state)
                : getValue(n2k, theMapping, state)
            var allowNull =
              typeof theMapping.allowNull !== 'undefined' &&
              theMapping.allowNull
            if (!(value == null) || allowNull) {
              // null or undefined
              updates.push({
                path: path,
                value: value
              })
            }
          }
        } catch (ex) {
          process.stderr.write(ex + ' ' + JSON.stringify(n2k))
        }
        return updates
      }, [])
      .filter(function (x) {
        return x != undefined
      })
  }
  return []
}

var addToTree = function (pathValue, source, tree) {
  var result = {}
  var temp = tree
  var parts = msg.path.split('.')
  for (var i = 0; i < parts.length - 1; i++) {
    temp[parts[i]] = {}
    temp = temp[parts[i]]
  }
  temp[parts[parts.length - 1]] = msg
  return result
}

function addAsNested (pathValue, source, timestamp, result) {
  var temp = result
  var parts = pathValue.path.split('.')
  for (var i = 0; i < parts.length - 1; i++) {
    if (typeof temp[parts[i]] === 'undefined') {
      temp[parts[i]] = {}
    }
    temp = temp[parts[i]]
  }

  // mapping produced an object like {latitude:...,longitude:...}
  if (typeof pathValue.value === 'object') {
    temp[parts[parts.length - 1]] = pathValue.value
    temp[parts[parts.length - 1]].source = source
    temp[parts[parts.length - 1]].timestamp = timestamp + ''
  } else {
    temp[parts[parts.length - 1]] = {
      value: pathValue.value,
      source: source,
      timestamp: timestamp + ''
    }
  }
}

const metaPGNs = {
  60928: (n2k) => {
    return {
      uniqueId: n2k.fields['Unique Number'],
      manufacturerName: n2k.fields['Manufacturer Code'],
      deviceFunction: n2k.fields['Device Function'],
      deviceClass: n2k.fields['Device Class'],
      deviceInstanceLower: n2k.fields['Device Instance Lower'],
      deviceInstanceUpper: n2k.fields['Device Instance Upper'],
      systemInstance: n2k.fields['System Instance'],
      deviceInstance: (n2k.fields['Device Instance Upper'] << 3) | n2k.fields['Device Instance Lower']
    }
  },
  126998: (n2k) => {
    return {
      installationNote1: n2k.fields['Installation Description #1'],
      installationNote2: n2k.fields['Installation Description #2'],
      installationNote3: n2k.fields['Installation Description #3'],
      manufacturerInfo: n2k.fields['Manufacturer Information']
    }
  },
  126996: (n2k) => {
    return {
      productName: n2k.fields['Model ID'],
      hardwareVersion: n2k.fields['Model Version'],
      softwareVersion: n2k.fields['Software Version Code'],
      productID: n2k.fields['Product Code'],
      serialNumber: n2k.fields['Model Serial Code'],
      nmea2000Version: n2k.fields['NMEA 2000 Version'],
      certificationLevel: n2k.fields['Certification Level'],
      loadEquivalency: n2k.fields['Load Equivalency']
    }
  }
}

exports.N2kMapper = N2kMapper
exports.toDelta = toDelta
exports.toDeltaTransformer = function (options, state) {
  return through(function (data) {
    this.queue(exports.toDelta(data, state))
  })
}
