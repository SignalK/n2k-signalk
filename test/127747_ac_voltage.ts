import chai from 'chai'
chai.should()
chai.use(require('@signalk/signalk-schema').chaiModule)

describe('127747, 127748 and 127749 AC voltage / frequency', function () {
  const frame = (pgn: number) => ({
    timestamp: '2020-07-28T01:46:48.714Z',
    prio: 6,
    src: 33,
    dst: 255,
    pgn,
    fields: {
      SID: 133,
      'Connection Number': 0,
      'AC Voltage Line to Neutral': 230,
      'AC Voltage Line to Line': 400,
      Frequency: 50
    }
  })

  const state = () => ({ 33: { deviceInstance: 1 } })

  ;[
    [127747, 'A'],
    [127748, 'B'],
    [127749, 'C']
  ].forEach(([pgn, phase]) => {
    it(`${pgn} writes phase ${phase}`, function () {
      const tree = require('./testMapper').toNested(
        frame(pgn as number),
        state()
      )
      const at = `electrical.ac.1.phase.${phase}`
      tree.should.have.nested.property(`${at}.lineNeutralVoltage.value`, 230)
      tree.should.have.nested.property(`${at}.lineLineVoltage.value`, 400)
      tree.should.have.nested.property(`${at}.frequency.value`, 50)
      tree.should.be.validSignalKVesselIgnoringIdentity
    })
  })

  it('writes nothing for a reading the frame does not have', function () {
    const n2k = frame(127747)
    const fields: Record<string, unknown> = n2k.fields
    delete fields['AC Voltage Line to Line']
    const tree = require('./testMapper').toNested(n2k, state())
    const phase = tree.electrical.ac['1'].phase.A
    phase.should.not.have.property('lineLineVoltage')
    phase.lineNeutralVoltage.value.should.equal(230)
  })
})
