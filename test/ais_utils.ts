export function assertSensorClass(delta: any, theClass: string) {
  delta.updates[0].values
    .find(
      (pathValue: { path: string }) => pathValue.path === 'sensors.ais.class'
    )
    .value.should.equal(theClass)
}
