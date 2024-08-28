module.exports = {
  assertSensorClass: (delta, theClass) =>
    delta.updates[0].values
      .find(pathValue => pathValue.path === 'sensors.ais.class')
      .value.should.equal(theClass)
}
