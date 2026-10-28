const chai = require('chai')
chai.Should()

const { N2kMapper, instanceGroups } = require('../dist/n2kMapper')
const { decode, prefixOf, FRAMES } = require('./instanceFrames')

const SENTINEL = 'x.y'

function values (mapper, n2k) {
  return mapper.toDelta(n2k).updates[0].values
}

// path with the prefix it is at or under replaced, notifications included;
// undefined for a path under neither.
function rebased (path, from, to) {
  for (const root of ['', 'notifications.']) {
    const prefix = root + from
    if (path === prefix || path.startsWith(prefix + '.')) {
      return root + to + path.slice(prefix.length)
    }
  }
  return undefined
}

// A notification's message names the engine, which a remapped prefix
// renames; the rest of the value is unchanged.
function withoutMessage (value) {
  return value && typeof value === 'object' && 'message' in value
    ? { ...value, message: undefined }
    : value
}

describe('instancePrefixResolver override coverage', function () {
  FRAMES.forEach(([pgn, fields]) => {
    it(`${pgn} ${JSON.stringify(
      fields
    )} writes every path under the resolved prefix`, function () {
      const n2k = decode(pgn, 34, fields)
      const group = instanceGroups.find(g => g.pgns.includes(pgn))
      const from = prefixOf(n2k)
      // A single-leaf prefix is the full path, so keep its leaf.
      const to = group.singleLeaf
        ? SENTINEL + from.slice(from.lastIndexOf('.'))
        : SENTINEL
      const expected = values(new N2kMapper(), n2k).map(v => {
        const path = rebased(v.path, from, to)
        chai.expect(path, `${v.path} under ${from}`).to.not.equal(undefined)
        return { path, value: withoutMessage(v.value) }
      })
      expected.should.not.be.empty
      const mapper = new N2kMapper({ instancePrefixResolver: () => to })
      values(mapper, n2k)
        .map(v => ({ path: v.path, value: withoutMessage(v.value) }))
        .should.deep.equal(expected)
    })
  })

  it('names the remapped engine in a 127493 transmission alarm', function () {
    const n2k = decode(127493, 17, {
      instance: 2,
      transmissionGear: 'Forward',
      discreteStatus1: ['Over Temperature']
    })
    const mapper = new N2kMapper({
      instancePrefixResolver: () => 'propulsion.genset'
    })
    const alarm = values(mapper, n2k).find(
      v =>
        v.path ===
        'notifications.propulsion.genset.transmission.overTemperature'
    )
    alarm.value.should.deep.equal({
      state: 'alarm',
      method: ['visual', 'sound'],
      message: 'Genset Transmission Over Temperature'
    })
  })
})
