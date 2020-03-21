function chooseField (n2k, field1, field2) {
  let res =
    typeof n2k.fields[field1] === 'undefined'
      ? n2k.fields[field2]
      : n2k.fields[field1]
  // console.log(`chooseField ${typeof n2k.fields[field1]} '${field1}' '${field2}' ${res} ${JSON.stringify(n2k.fields)}`)
  return res
}

function skEngineId (n2k) {
  let id = chooseField(n2k, 'Engine Instance', 'Instance')
  if (typeof id === 'number') {
    return id
  } else {
    return id === 'Single Engine or Dual Engine Port' ? 'port' : 'starboard'
  }
}

function skEngineTitle (n2k) {
  var engine = skEngineId(n2k)
  if (typeof engine === 'number') {
    return engine
  } else {
    return engine.charAt(0).toUpperCase() + engine.slice(1)
  }
}

module.exports = {
  chooseField,
  skEngineId,
  skEngineTitle
}
