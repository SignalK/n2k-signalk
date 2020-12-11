const n2kMapper = require('../n2kMapper')
const signalkSchema = require('@signalk/signalk-schema')

n2kMapper.toNested = function (n2k, state) {
  var delta = n2kMapper.toDelta(n2k, state, true)
  if (!delta.context) {
    delta.context = 'vessels.' + signalkSchema.fakeMmsiId
  }
  var contextParts = delta.context.split('.')
  return signalkSchema.deltaToFull(delta)[contextParts[0]][contextParts[1]]
}
module.exports = n2kMapper
