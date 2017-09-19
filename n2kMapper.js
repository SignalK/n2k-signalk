var through = require('through')
var debug = require('debug')('signalk:n2k-signalk')

var n2kMappings = {}
Object.assign(n2kMappings, require('./pgns'))
Object.assign(n2kMappings, require('./fusion'))
Object.assign(n2kMappings, require('./lowrance'))
Object.assign(n2kMappings, require('./raymarine'))

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
      .reduce(function (updates, theMapping) {
        try {
          if (typeof theMapping === 'function') {
            var mapped = theMapping(n2k, state)
            updates.push.apply(updates, mapped)
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

exports.toDelta = toDelta
exports.toDeltaTransformer = function (options) {
  return through(function (data) {
    this.queue(exports.toDelta(data))
  })
}