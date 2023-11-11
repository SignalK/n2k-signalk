function instance (n2k) {
  return n2k.fields['Instance']
}

function acPhase (lineData) {
  const phaseMap = { 0: 'A', 1: 'B', 2: 'C' }
  return phaseMap[lineData.Line] ?? 'A'
}

function prefix (n2k, lineData) {
  return `electrical.ac.${instance(n2k)}.${acPhase(lineData)}`
}

module.exports = [
  function (n2k, stage) {
    const fields = {
      Acceptability: 'acceptability',
      Voltage: 'voltage',
      Current: 'current',
      Frequency: 'frequency',
      'Breaker Size': 'breakerSize',
      'Real Power': 'realPower',
      'Reactive Power': 'reactivePower',
      'Power Factor': 'powerFactor'
    }
    return n2k.fields.list
      ? n2k.fields.list.reduce((updates, lineData) => {
          const pathPrefix = prefix(n2k, lineData)
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
