var tv4 = require('tv4')

function validate (tree) {
  var signalkSchema = require('/Users/tjk/git-workspace/signalk/specification/schemas/signalk.json')
  var vesselSchema = require('/Users/tjk/git-workspace/signalk/specification/schemas/vessel.json')
  tv4.addSchema(
    'https://signalk.github.io/specification/schemas/vessel.json',
    vesselSchema
  )
  var definitions = require('/Users/tjk/git-workspace/signalk/specification/schemas/definitions.json')
  tv4.addSchema(
    'https://signalk.github.io/specification/schemas/definitions.json',
    definitions
  )
  ;['navigation', 'environment'].forEach(function (name) {
    var subSchema = require('/Users/tjk/git-workspace/signalk/specification/schemas/groups/' +
      name +
      '.json')
    tv4.addSchema(
      'https://signalk.github.io/specification/schemas/groups/' +
        name +
        '.json',
      subSchema
    )
  })
  var validTree = {
    vessels: {
      '230029970': tree
    }
  }
  var valid = tv4.validateMultiple(validTree, signalkSchema, true, true)
  return valid
}

module.exports.validate = validate
