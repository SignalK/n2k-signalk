const EventEmitter = require('events').EventEmitter
var through = require('through')
var debug = require('debug')('signalk:n2k-signalk')
const toPgn = require('@canboat/canboatjs').toPgn
const Uint64LE = require('int64-buffer').Uint64LE
const PGN = require('@canboat/ts-pgns').PGN

require('util').inherits(N2kMapper, EventEmitter)

var n2kMappings = {}
Object.assign(n2kMappings, require('./pgns'))
Object.assign(n2kMappings, require('./fusion'))
Object.assign(n2kMappings, require('./lowrance'))
Object.assign(n2kMappings, require('./raymarine'))
Object.assign(n2kMappings, require('./maretron'))
Object.assign(n2kMappings, require('./actisense'))
Object.assign(n2kMappings, require('./digitalyacht'))
Object.assign(n2kMappings, require('./simrad'))

function N2kMapper (options) {
  this.state = {}
  this.unknownPGNs = {}
  this.customPgns = {}
  this.options = options || {}

  if (this.options.onPropertyValues) {
    this.options.onPropertyValues('pgn-to-signalk', values => {
      values
        .filter(v => v !== undefined)
        .forEach(pv => {
          Object.entries(pv.value).forEach(([pgnNumber, mappings]) => {
            if (
              n2kMappings[pgnNumber] &&
              !this.options.allowCustomPGNOverride
            ) {
              console.error(`pgn ${pgnNumber} can't be overwritten`)
            } else {
              this.customPgns[pgnNumber] = mappings
              debug('registered custom pgn %d by %s', pgnNumber, pv.setter)
            }
          })
        })
    })
  }
}

N2kMapper.prototype.n2kOutIsAvailable = function (listener, event) {
  this.n2kOutEvent = event
  this.n2kListener = listener
  this.requestAllMeta()
}

N2kMapper.prototype.requestMetaData = function (dst, pgn) {
  const reqPgn = {
    pgn: 59904,
    dst: dst,
    PGN: pgn
  }
  debug(`requesting pgn ${pgn} from src ${dst}`)
  return new Promise((resolve, reject) => {
    this.n2kListener.emit(this.n2kOutEvent, reqPgn)
    setTimeout(() => {
      resolve()
    }, 5000)
  })
}

N2kMapper.prototype.requestMetaPGNs = async function (dst, pgns) {
  for (let i = 0; i < pgns.length; i++) {
    await this.requestMetaData(dst, pgns[i])
  }
}

N2kMapper.prototype.checkSrcMetasAndRetry = function (src) {
  if (src !== '255') {
    const neededPGNs = Object.keys(metaPGNs).filter(pgn => {
      return (
        !this.state[src].metaPGNsReceived ||
        !this.state[src].metaPGNsReceived[pgn]
      )
    })
    if (neededPGNs.length > 0) {
      debug('did not get meta pgns %j for src %d', neededPGNs, src)
      this.requestMetaPGNs(src, neededPGNs).then(() => {
        neededPGNs.forEach(pgn => {
          if (
            !this.state[src].metaPGNsReceived ||
            !this.state[src].metaPGNsReceived[pgn]
          ) {
            debug(`did not get meta pgn ${pgn} for src ${src}`)
            this.emit('n2kSourceMetadataTimeout', pgn, src)
          }
        })
      })
    }
  }
}

N2kMapper.prototype.requestAllMeta = function () {
  this.requestMetaPGNs(255, Object.keys(metaPGNs)).then(() => {
    Object.keys(this.state).forEach(src => this.checkSrcMetasAndRetry(src))
  })
}

N2kMapper.prototype.toDelta = function (n2k) {
  if (metaPGNs[n2k.pgn]) {
    const meta = metaPGNs[n2k.pgn](n2k)
    if (!this.state[n2k.src]) {
      this.state[n2k.src] = {}
    }

    if (n2k.pgn === 60928) {
      const canName = new Uint64LE(toPgn(n2k)).toString(16)
      if (
        this.state[n2k.src].canName &&
        this.state[n2k.src].canName != canName
      ) {
        // clear out any existing state since the src addresses have changed
        this.emit(
          'n2kSourceChanged',
          n2k.src,
          this.state[n2k.src].canName,
          canName
        )
        this.state[n2k.src] = {}
        this.requestMetaData(n2k.src, 126996).then(() => {
          return this.requestMetaData(n2k.src, 126998)
        })
      }
      this.state[n2k.src].deviceInstance = meta.deviceInstance
      meta.canName = canName
      this.state[n2k.src].canName = canName
    }

    if (!this.state[n2k.src].metaPGNsReceived) {
      this.state[n2k.src].metaPGNsReceived = {}
    }

    this.state[n2k.src].metaPGNsReceived[n2k.pgn] = Date.now()

    this.emit('n2kSourceMetadata', n2k, meta)
  } else {
    if (!n2kMappings[n2k.pgn]) {
      if (!this.unknownPGNs[n2k.src]) {
        this.unknownPGNs[n2k.src] = {}
      }
      if (!this.unknownPGNs[n2k.src][n2k.pgn]) {
        this.unknownPGNs[n2k.src][n2k.pgn] = n2k
        this.emit('n2kSourceMetadata', n2k, {
          unknownPGNs: this.unknownPGNs[n2k.src]
        })
      }
    }
    return toDelta(n2k, this.state, this.customPgns)
  }
}

var toDelta = function (n2k, state, customPgns = {}) {
  try {
    var theMappings, customMappings

    theMappings = [
      ...(customPgns[n2k.pgn] || []),
      ...(n2kMappings[n2k.pgn] || [])
    ]

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

    if (src_state && src_state.canName) {
      result.updates[0].source.canName = src_state.canName
    }
    if (src_state && typeof src_state.deviceInstance !== 'undefined') {
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
      if (result.context) {
        //filter out invalid mmsi
        let last = result.context.lastIndexOf(':')
        if (last != -1 && result.context.slice(last + 1).length < 9) {
          console.error('bad MMSI: ' + result.context)
          return
        }
      }

      if (theMappings.length === 1 && theMappings[0].instance) {
        result.updates[0].source.instance = theMappings[0].instance(n2k)
      }
    }

    return result
  } catch (ex) {
    console.error(ex)
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
          if (theMapping.pgnClass) {
            return (
              theMapping.pgnClass.isMatch(n2k) &&
              (theMapping.filter === undefined || theMapping.filter(n2k, state))
            )
          } else {
            return (
              typeof theMapping.filter === 'undefined' ||
              theMapping.filter(n2k, state)
            )
          }
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
          console.error(ex)
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
  60928: n2k => {
    return {
      ...n2k.fields,
      deviceInstance:
        (n2k.fields.deviceInstanceUpper << 3) | n2k.fields.deviceInstanceLower
    }
  },
  126998: n2k => n2k.fields,
  126996: n2k => n2k.fields
}

exports.N2kMapper = N2kMapper
exports.toDelta = toDelta
exports.toDeltaTransformer = function (options, state) {
  return through(function (data) {
    this.queue(exports.toDelta(data, state))
  })
}
