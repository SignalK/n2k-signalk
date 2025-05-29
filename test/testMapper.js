const n2kMapper = require('../n2kMapper')
const signalkSchema = require('@signalk/signalk-schema')

const canboatjs = require('@canboat/canboatjs')
const { FromPgn, pgnToActisenseSerialFormat } = canboatjs
const Parser = canboatjs.FromPgn
const parser = new FromPgn({ useCamel: true })

/*
  By default we take the input canboat json and convert to actisense format,
  back to conboat json and then do the n2k conversion.
  This is done to expose any issues/changes with field names in canboat.

  Set the env variable NO_CANBOATJS=true to skip the back and forth conversion.
*/

n2kMapper.toNested = function (n2k, state) {
  if (!process.env.NO_CANBOATJS) {
    return n2kMapper.doubleConvertWithCanboat(n2k, state)
  } else {
    return n2kMapper.n2kToNested(n2k, state)
  }
}

n2kMapper.testToDelta = function (n2k, state) {
  var actisense = pgnToActisenseSerialFormat(n2k)
  var parsed = parser.parseString(actisense)
  //console.log(JSON.stringify(n2k))
  //console.log(actisense)
  //console.log(JSON.stringify(parsed, null, 2))
  return n2kMapper.toDelta(parsed, state)
}

n2kMapper.doubleConvertWithCanboat = function (n2k, state) {
  var actisense = pgnToActisenseSerialFormat(n2k)
  var parsed = parser.parseString(actisense)
  //console.log(parsed)
  parsed.src = n2k.src
  if (n2k.timestamp) {
    parsed.timestamp = n2k.timestamp
  }
  //console.log(parsed)
  var delta = n2kMapper.toDelta(parsed, state)
  if (!delta.context) {
    delta.context = 'vessels.' + signalkSchema.fakeMmsiId
  }
  var contextParts = delta.context.split('.')
  return signalkSchema.deltaToFull(delta)[contextParts[0]][contextParts[1]]
}

n2kMapper.n2kToNested = function (n2k, state) {
  var delta = n2kMapper.toDelta(n2k, state)
  if (!delta.context) {
    delta.context = 'vessels.' + signalkSchema.fakeMmsiId
  }
  var contextParts = delta.context.split('.')
  return signalkSchema.deltaToFull(delta)[contextParts[0]][contextParts[1]]
}

module.exports = n2kMapper
