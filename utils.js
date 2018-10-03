
module.exports = {
  chooseField: (n2k, field1, field2) => {
    let res = typeof n2k.fields[field1] === 'undefined' ? n2k.fields[field2] : n2k.fields[field1]
    //console.log(`chooseField ${typeof n2k.fields[field1]} '${field1}' '${field2}' ${res} ${JSON.stringify(n2k.fields)}`)
    return res
  }
}
