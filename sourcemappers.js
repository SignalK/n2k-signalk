
var deep = require('deep-get-set')
deep.p = true

module.exports = {
    "126996": function(n2k) {
        var result = {
            updates: [{
                source: {
                    label: '',
                    type: 'NMEA2000',
                    pgn: Number(n2k.pgn),
                    src: n2k.src.toString(),
                    data: {}
                }
            }]
        }
        var sourceData = result.updates[0].source.data
        setIfN2kHasField(n2k, "Model ID", sourceData, "manufacturer.modelId")
        setIfN2kHasField(n2k, "Software Version Code", sourceData, "manufacturer.softwareVersion")
        setIfN2kHasField(n2k, "Model Serial Code", sourceData, "manufacturer.serialNumber")
        setIfN2kHasField(n2k, "Model ID", sourceData, "manufacturer.modelId")
        setIfN2kHasField(n2k, "Model Version", sourceData, "manufacturer.modelVersion")
        return result;
    }
}

function setIfN2kHasField(n2k, sourceField, target, targetFieldName) {
  if (typeof n2k.fields[sourceField] != 'undefined') {
    deep(target, targetFieldName, n2k.fields[sourceField])
  }
}
