const { instancePrefix } = require('../instanceGroups')

function acPhase (lineData) {
  const phaseMap = { 0: 'A', 1: 'B', 2: 'C' }
  return phaseMap[lineData.line] ?? 'A'
}

function prefix (n2k, state, lineData) {
  return `${instancePrefix(n2k, state)}.${acPhase(lineData)}`
}

module.exports = [
  function (n2k, state) {
    const fields = {
      acceptability: 'acceptability',
      voltage: 'voltage',
      current: 'current',
      frequency: 'frequency',
      breakerSize: 'breakerSize',
      realPower: 'realPower',
      reactivePower: 'reactivePower',
      powerFactor: 'powerFactor'
    }
    return n2k.fields.list
      ? n2k.fields.list.reduce((updates, lineData) => {
          const pathPrefix = prefix(n2k, state, lineData)
          Object.keys(fields).reduce((fieldUpdates, fieldName) => {
            if (typeof lineData[fieldName] !== 'undefined') {
              updates.push({
                path: `${pathPrefix}.${fields[fieldName]}`,
                value: lineData[fieldName]
              })
            }
            return updates
          }, updates)
          return updates
        }, [])
      : []
  }
]
